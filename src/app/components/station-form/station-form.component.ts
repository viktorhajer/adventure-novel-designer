import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Station} from '../../model/station.model';
import {NovelService} from '../../services/novel.service';
import {EditService} from '../../services/edit.service';
import {MatDialog} from '@angular/material/dialog';
import {StationViewerComponent} from '../station-viewer/station-viewer.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Relation} from '../../model/relation.model';
import {STATION_COLORS} from '../../model/station-color.model';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-station-form',
  templateUrl: './station-form.component.html',
  styleUrls: ['./station-form.component.scss']
})
export class StationFormComponent implements OnChanges {
  @Input() trigger = 0;
  @Input() station: Station = null as any;
  @Input() previousStation = 0;
  @Output() stationChanged = new EventEmitter();
  children: Station[] = [];
  childRoutes: Relation[] = [];
  createNew = true;
  stations: Station[] = [];
  colors = STATION_COLORS;
  myDestinationControl = new FormControl('');
  filteredDestinationOptions: Observable<Station[]>;

  constructor(private readonly novelService: NovelService,
              private readonly editService: EditService,
              private readonly dialog: MatDialog) {
    this.filteredDestinationOptions = this.myDestinationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterDestination(value || '')),
    );
  }

  ngOnChanges() {
    if (this.station) {
      this.createNew = !this.station.id;
      if (!this.createNew) {
        this.children = this.novelService.getChildren(this.station.id);
        this.childRoutes = this.novelService.model.relations.filter(r => r.sourceID === this.station.id);
        this.stations = this.novelService.getStations(this.station.id);
      }
    }
  }
  
  checkUnsaved() {
    if (this.createNew) {
      this.editService.unsaved = true;
    } else {
      const originStation = this.novelService.model.stations.find(s => s.id === this.station.id);
      this.editService.unsaved = JSON.stringify(originStation) !== JSON.stringify(this.station);
    }
  }

  create() {
    if (this.station.title.trim()) {
      this.novelService.createStation(this.station, this.previousStation);
      this.editService.unsaved = false;
      this.stationChanged.emit(this.station.id + '');
    } else {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Please enter a valid title.'}
      }).afterClosed();
    }
  }

  update() {
    this.novelService.updateStation(this.station);
    this.editService.unsaved = false;
    this.stationChanged.emit(this.station.id + '');
  }

  delete() {
    this.openConfirmation().then(result => {
      if (result) {
        this.novelService.deleteStation(this.station.id);
        this.stationChanged.emit(null);
      }
    });
  }

  createRelation(destination:HTMLInputElement, comment: HTMLInputElement) {
    const targetId = this.stations.find(s => s.title === destination.value)?.id as any;
    this.novelService.createRelation(this.station.id, targetId, comment.value);
    comment.value = '';
    this.stationChanged.emit(this.station.id + '');
  }

  deleteRelation(targetId: number) {
    this.openConfirmation().then(result => {
      if (result) {
        this.novelService.deleteRelation(this.station.id, targetId);
        this.stationChanged.emit(this.station.id + '');
      }
    });
  }

  viewStation(station: Station) {
    this.dialog.open(StationViewerComponent, {
      panelClass: 'full-modal',
      data: {station}
    }).afterClosed();
  }

  getRelationComment(childId: number) {
    return this.childRoutes?.find(r => r.targetID === childId)?.comment;
  }
  
  private openConfirmation(): Promise<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose:true})
      .afterClosed().toPromise();
  }
  
  private filterDestination(value: string): Station[] {
    const filterValue = value.toLowerCase();
    return this.stations.filter(s => s.title.toLowerCase().includes(filterValue));
  }
}

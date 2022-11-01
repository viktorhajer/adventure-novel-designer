import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Station} from '../../model/station.model';
import {Item} from '../../model/item.model';
import {StationItem} from '../../model/station-item.model';
import {NovelService} from '../../services/novel.service';
import {EditService} from '../../services/edit.service';
import {MatDialog} from '@angular/material/dialog';
import {StationViewerComponent} from '../station-viewer/station-viewer.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {RelationFormComponent} from '../relation-form/relation-form.component';
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
  items: Item[] = [];
  ownItems: {item: Item, stationItem: StationItem}[] = [];
  colors = STATION_COLORS;
  myDestinationControl = new FormControl('');
  filteredDestinationOptions: Observable<Station[]>;

  constructor(public readonly novelService: NovelService,
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
        this.childRoutes = this.novelService.model.relations.filter(r => r.sourceId === this.station.id);
        this.stations = this.novelService.getStations(this.station.id);
        this.items = this.novelService.getItems(this.station.id);
        this.ownItems = this.novelService.getStationItems(this.station.id);
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
    if (this.validateTitle()) {
      this.novelService.createStation(this.station, this.previousStation);
      this.editService.unsaved = false;
      this.stationChanged.emit(this.station.id + '');
    }
  }

  update() {
    if (this.validateTitle()) {
      this.novelService.updateStation(this.station);
      this.editService.unsaved = false;
      this.stationChanged.emit(this.station.id + '');
    }
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
  
  deleteOwnItem(itemId: number) {
    this.openConfirmation().then(result => {
      if (result) {
        this.novelService.deleteStationItem(this.station.id, itemId);
        this.stationChanged.emit(this.station.id + '');
      }
    });
  }
  
  setItem(stationId: number, itemId: any, count: HTMLInputElement) {
    this.novelService.setItem(stationId, itemId.value, +count.value);
    itemId.value = '';
    count.value = '1';
    this.stationChanged.emit(this.station.id + '');
  }

  viewStation(station: Station) {
    this.dialog.open(StationViewerComponent, {
      panelClass: 'full-modal',
      data: {station}
    }).afterClosed();
  }
  
  editRelation(targetId: number) {
    const relation = this.novelService.model.relations.find(r => r.targetId === targetId && r.sourceId === this.station.id);
    if (relation) {
      this.dialog.open(RelationFormComponent, {data: {relation}, disableClose:true})
        .afterClosed().toPromise().then(result => {
          if(result !== null) {
            relation.comment = result;
            this.editService.unsaved = false;
            this.stationChanged.emit(this.station.id + '');
          }
        });
    }
  }

  getRelationComment(childId: number) {
    return this.childRoutes?.find(r => r.targetId === childId)?.comment;
  }
  
  private validateTitle(): boolean {
    if (!this.station.title.trim()) {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Please enter a valid title.'}
      }).afterClosed();
      return false;
    } else if (this.novelService.model.stations.some(s => s.title === this.station.title && s.id !== this.station.id)) {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Station title should be unique.'}
      }).afterClosed();
      return false;
    }
    return true;
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

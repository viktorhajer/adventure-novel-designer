import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Station} from '../../model/station.model';
import {Item} from '../../model/item.model';
import {StationItem} from '../../model/station-item.model';
import {BookService} from '../../services/book.service';
import {EditService} from '../../services/edit.service';
import {StationViewerComponent} from '../station-viewer/station-viewer.component';
import {RelationFormComponent} from '../relation-form/relation-form.component';
import {Relation} from '../../model/relation.model';
import {STATION_COLORS} from '../../model/station-color.model';
import {FormControl} from '@angular/forms';
import {firstValueFrom, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Chapter} from '../../model/chapter.model';
import {DialogService} from '../../services/dialog.service';

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
  chapters: Chapter[] = [];
  stations: Station[] = [];
  items: Item[] = [];
  ownItems: { item: Item, stationItem: StationItem }[] = [];
  colors = STATION_COLORS;
  myDestinationControl = new FormControl('');
  filteredDestinationOptions: Observable<Station[]> = null as any;

  constructor(public readonly bookService: BookService,
              private readonly dialogService: DialogService,
              private readonly editService: EditService) {
  }

  ngOnChanges() {
    this.chapters = this.bookService.model.chapters;
    if (this.station) {
      this.createNew = !this.station.id;
      if (!this.createNew) {
        this.children = this.bookService.getChildren(this.station.id);
        this.childRoutes = this.bookService.model.relations.filter(r => r.sourceId === this.station.id);
        this.stations = this.bookService.getStations(this.station.id);
        this.items = this.bookService.getItems(this.station.id);
        this.ownItems = this.bookService.getStationItems(this.station.id);
      }
      this.filteredDestinationOptions = this.myDestinationControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterDestination(value || '')),
      );
    }
  }

  checkUnsaved() {
    if (this.createNew) {
      this.editService.unsaved = true;
    } else {
      const originStation = this.bookService.model.stations.find(s => s.id === this.station.id);
      this.editService.unsaved = JSON.stringify(originStation) !== JSON.stringify(this.station);
    }
  }

  checkWinnerLooser(field = 0) {
    const hasChild = this.bookService.model.relations.some(r => r.sourceId === this.station.id);
    if (field !== 0 && (this.station.winner || this.station.looser) && hasChild) {
      const marker = field === 1 && this.station.winner ? 'winner' : 'looser';
      const message = `Are you sure you are marking the station as a ${marker}? All routes from this station will be deleted.`;
      this.dialogService.openConfirmation(message).then(result => {
        if (!result) {
          this.station.winner = false;
          this.station.looser = false;
        } else {
          this.setStarterWinnerLooser(field);
        }
      });
      return;
    }
    this.setStarterWinnerLooser(field);
    this.checkUnsaved();
  }

  create() {
    if (this.validateTitle()) {
      this.bookService.createStation(this.station, this.previousStation);
      this.editService.unsaved = false;
      this.stationChanged.emit(this.station.id + '');
    }
  }

  update() {
    if (this.validateTitle()) {
      this.bookService.updateStation(this.station);
      this.editService.unsaved = false;
      this.stationChanged.emit(this.station.id + '');
    }
  }

  delete() {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteStation(this.station.id);
        this.stationChanged.emit(null);
      }
    });
  }

  createRelation(destination: HTMLInputElement, comment: HTMLInputElement, conditionInput: any) {
    const targetId = this.stations.find(s => s.title === destination.value)?.id as any;
    if (targetId) {
      this.bookService.createRelation(this.station.id, targetId, comment.value, conditionInput.checked);
      comment.value = '';
      this.stationChanged.emit(this.station.id + '');
      destination.value = '';
      comment.value = '';
      conditionInput.checked = false;
    }
  }

  deleteRelation(targetId: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteRelation(this.station.id, targetId);
        this.stationChanged.emit(this.station.id + '');
      }
    });
  }

  deleteOwnItem(itemId: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteStationItem(this.station.id, itemId);
        this.stationChanged.emit(this.station.id + '');
      }
    });
  }

  setItem(stationId: number, itemId: any, count: HTMLInputElement) {
    let value = !!(+count.value) ? +count.value : 1;
    value = value > 0 ? value : 1;
    this.bookService.setItem(stationId, itemId.value, value);
    itemId.value = '';
    count.value = '1';
    this.stationChanged.emit(this.station.id + '');
  }

  viewStation(station: Station) {
    this.dialogService.openCustomDialog(StationViewerComponent, {width: '70vw'}, {station});
  }

  editRelation(targetId: number) {
    const relation = this.bookService.model.relations.find(r => r.targetId === targetId && r.sourceId === this.station.id);
    if (relation) {
      firstValueFrom(this.dialogService.openCustomDialog(RelationFormComponent, {width: '70vw', disableClose: true}, {relation}))
        .then(result => {
          if (result !== null) {
            relation.comment = result.comment;
            relation.condition = result.condition;
            this.editService.unsaved = false;
            this.stationChanged.emit(this.station.id + '');
          }
        });
    }
  }

  getRelation(childId: number) {
    return this.childRoutes?.find(r => r.targetId === childId) as any;
  }

  private validateTitle(): boolean {
    if (!this.station.title.trim()) {
      this.dialogService.openError('Please enter a valid title.');
      return false;
    } else if (this.bookService.model.stations.some(s => s.title === this.station.title && s.id !== this.station.id)) {
      this.dialogService.openError('Title should be unique.');
      return false;
    }
    return true;
  }

  private filterDestination(value: string): Station[] {
    const filterValue = value.toLowerCase();
    return this.stations.filter(s => s.title.toLowerCase().includes(filterValue));
  }

  private setStarterWinnerLooser(field: number) {
    if (field === 0 && this.station.starter) {
      this.station.winner = false;
      this.station.looser = false;
    } else if (field === 1 && this.station.winner) {
      this.station.starter = false;
      this.station.looser = false;
    } else if (field === 2 && this.station.looser) {
      this.station.starter = false;
      this.station.winner = false;
    }
  }
}

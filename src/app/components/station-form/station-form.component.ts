import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Station} from '../../model/station.model';
import {NovelService} from '../../services/novel.service';
import {MatDialog} from '@angular/material/dialog';
import {StationViewerComponent} from '../station-viewer/station-viewer.component';
import {Relation} from '../../model/relation.model';
import {STATION_COLORS} from '../../model/station-color.model';

@Component({
  selector: 'app-station-form',
  templateUrl: './station-form.component.html',
  styleUrls: ['./station-form.component.scss']
})
export class StationFormComponent implements OnChanges {
  @Input() trigger = 0;
  @Input() station: Station = null as any;
  @Output() stationChanged = new EventEmitter();
  children: Station[] = [];
  childRoutes: Relation[] = [];
  createNew = true;
  stations: Station[] = [];
  colors = STATION_COLORS;

  constructor(private readonly novelService: NovelService,
              private readonly dialog: MatDialog) {
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

  create() {
    this.novelService.createStation(this.station);
    this.stationChanged.emit(this.station.id + '');
  }

  update() {
    this.novelService.updateStation(this.station);
    this.stationChanged.emit(this.station.id + '');
  }

  delete() {
    this.novelService.deleteStation(this.station.id);
    this.stationChanged.emit(null);
  }

  createRelation(targetId: number, comment: HTMLInputElement) {
    this.novelService.createRelation(this.station.id, targetId, comment.value);
    comment.value = '';
    this.stationChanged.emit(this.station.id + '');
  }

  deleteRelation(targetId: number) {
    this.novelService.deleteRelation(this.station.id, targetId);
    this.stationChanged.emit(this.station.id + '');
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
}

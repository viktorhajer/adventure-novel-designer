import {Injectable} from '@angular/core';
import {Novel} from '../model/novel.model';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';
import {Station} from '../model/station.model';

@Injectable({
  providedIn: 'root'
})
export class NovelService {
  loaded = false;
  model: Novel;
  maxID = 0;

  constructor(private readonly dialog: MatDialog) {
    this.model = new Novel();
  }

  loadModel(content: string) {
    try {
      this.model = JSON.parse(content);
      this.loaded = true;
      this.setMaxID();
    } catch (e) {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Failed to load the model due syntax error.'}
      }).afterClosed();
    }
  }

  getStation(id: number): Station {
    const station = this.model.stations.find(s => s.id === id);
    return !!station ? station : null as any;
  }

  getStations(exceptId: number): Station[] {
    let filtered = this.model.stations.filter(s => s.id !== exceptId);
    const children = this.model.relations.filter(r => r.sourceID === exceptId).map(r => r.targetID);
    return filtered.filter(s => !children.includes(s.id));
  }

  createStation(station: Station, parentId?: number, comment = '') {
    station.id = ++this.maxID;
    this.model.stations.push(station);
    if (parentId) {
      this.model.relations.push({
        sourceID: parentId,
        targetID: station.id,
        comment
      });
    }
  }

  updateStation(station: Station) {
    const originStation = this.model.stations.find(s => s.id === station.id);
    if (originStation) {
      originStation.title = station.title;
      originStation.story = station.story;
      originStation.exit = station.exit;
    }
  }

  deleteStation(id: number) {
    this.model.stations = this.model.stations.filter(s => s.id !== id);
    this.model.relations = this.model.relations.filter(r => r.sourceID !== id && r.targetID !== id);
  }

  createRelation(sourceID: number, targetID: number, comment = '') {
    this.model.relations.push({sourceID, targetID, comment});
  }

  deleteRelation(sourceID: number, targetID: number) {
    this.model.relations = this.model.relations.filter(r => r.sourceID !== sourceID && r.targetID !== targetID);
  }

  private setMaxID() {
    let max = 0;
    this.model.stations.forEach(s => {
      max = s.id > max ? s.id : max;
    });
    this.maxID = max;
  }
}

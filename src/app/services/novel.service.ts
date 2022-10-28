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
  maxID = 1;

  constructor(private readonly dialog: MatDialog) {
    this.model = new Novel();
  }

  clearModel() {
    this.model = new Novel();
    this.loaded = false;
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
      originStation.comment = station.comment;
      originStation.color = station.color;
      originStation.starter = station.starter;
      if (station.starter) {
        this.model.stations.filter(s => s.id !== station.id).forEach(s => s.starter = false);
      }
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
    this.model.relations = this.model.relations.filter(r => !(r.sourceID === sourceID && r.targetID === targetID));
  }

  getChildren(id: number): Station[] {
    return this.model.relations.filter(r => r.sourceID === id).map(r => this.model.stations.find(s => s.id === r.targetID) as any);
  }

  finalize() {
    // TODO validation
    this.generateIndexes();
    this.sortAndReplaceMacros();
  }

  private sortAndReplaceMacros() {
    // TODO deep copy
    const stations = [...this.model.stations].sort((s1, s2) => s1.index > s2.index ? 1 : -1);
    stations.forEach(s => {
      let i = 1;
      this.getChildren(s.id).forEach(c => {
        s.story = s.story.replace(`##${i}`, c.index+this.getAffix(c.index));
        i++;
      });
    });
  }

  private generateIndexes() {
    let index = 0;
    let stations = [...this.model.stations];
    const starter = stations.find(s => s.starter);
    if (starter) {
      index++;
      starter.index = index;
      stations = stations.filter(s => s.id !== starter.id);
    }
    while(stations.length) {
      index++;
      const id = stations[Math.floor(Math.random() * stations.length)].id;
      this.getStation(id).index = index;
      stations = stations.filter(s => s.id !== id);
    }
  }

  private setMaxID() {
    let max = 0;
    this.model.stations.forEach(s => {
      max = s.id > max ? s.id : max;
    });
    this.maxID = max;
  }

  private getAffix(num: number): string {
    if(num % 10 !== 0 && [1, 2, 4, 5, 7, 9].includes(num % 10)) {
      return '-re';
    } else if (num % 10 !== 0){
      return '-ra';
    } else {
      return '-re';
    }
  }
}

import {Injectable} from '@angular/core';
import {Novel} from '../model/novel.model';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';
import {WarningDialogComponent} from '../components/warning-dialog/warning-dialog.component';
import {Station} from '../model/station.model';
import {NovelViewerComponent} from '../components/novel-viewer/novel-viewer.component';

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
      this.openError('Failed to load the model due syntax error.');
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
      originStation.life = station.life;
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
    if (this.isValidNovel()) {
      this.generateIndexes();
      this.openNovelViewer(this.sortAndReplaceMacros());
      this.validateMacros();
    }
  }

  private isValidNovel() {
    let message = '';
    // One starter
    const starters = this.model.stations.filter(s => s.starter);
    if (starters.length !== 1) {
      if (starters.length === 0) {
        message = 'Missing first station.';
      } else {
        message = 'More than one first stations: ' + starters.map(s => s.title).join(', ') + '.';
      }
    }
    // Shadow starter
    if (!message) {
      const targetIds = this.model.relations.map(r => r.targetID);
      const abandonedStarters = this.model.stations.filter(s => !s.starter && !targetIds.includes(s.id));
      if (abandonedStarters.length) {
        message = 'Abandoned stations (where there is no route and not first station): '
          + abandonedStarters.map(s => s.title).join(', ');
      }
    }
    if (message) {
      this.openError(message);
    }
    return !message.length;
  }
  
  private validateMacros() {
    const messages = [];
    for (const s of this.model.stations) {
      const childrenNumber = this.model.relations.filter(r => r.sourceID === s.id).length;
      for (let i = 1; i < (childrenNumber + 1); i++) {
        if (s.story.indexOf('##' + i) === -1) {
          messages.push(s.title + ': ##' + i);
        }
      }
    }
    if (messages.length) {
      this.openWarning('Unused macro(s): ' + messages.join(', '));
    }
  }

  private sortAndReplaceMacros(): Station[] {
    const stations = (JSON.parse(JSON.stringify(this.model.stations)) as Station[])
      .sort((s1, s2) => s1.index > s2.index ? 1 : -1);
    stations.forEach(s => {
      let i = 1;
      this.getChildren(s.id).forEach(c => {
        s.story = s.story.replace(`##${i}`, c.index + this.getAffix(c.index));
        i++;
      });
    });
    return stations;
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
    while (stations.length) {
      index++;
      const id = stations[Math.floor(Math.random() * stations.length)].id;
      this.getStation(id).index = index;
      stations = stations.filter(s => s.id !== id);
    }
  }

  private openNovelViewer(stations: Station[]) {
    const novel = new Novel();
    novel.title = this.model.title;
    novel.prolog = this.model.prolog;
    novel.stations = stations;
    this.dialog.open(NovelViewerComponent, {
      panelClass: 'full-modal',
      data: {novel}
    }).afterClosed();
  }

  private setMaxID() {
    let max = 0;
    this.model.stations.forEach(s => {
      max = s.id > max ? s.id : max;
    });
    this.maxID = max;
  }

  private getAffix(num: number): string {
    if (num % 10 !== 0 && [1, 2, 4, 5, 7, 9].includes(num % 10)) {
      return '-re';
    } else if (num % 10 !== 0) {
      return '-ra';
    } else if (num % 100 !== 0 && [1, 4, 5, 7, 9].includes(num % 100 / 10)) {
      return '-re';
    } else if (num % 100 !== 0) {
      return '-ra';
    } else {
      return '-ra';
    }
  }

  private openError(message: string) {
    this.dialog.open(ErrorDialogComponent, {
      panelClass: 'small-dialog',
      data: {message}
    }).afterClosed();
  }
  
  private openWarning(message: string) {
    this.dialog.open(WarningDialogComponent, {
      panelClass: 'small-dialog',
      data: {message}
    }).afterClosed();
  }
}

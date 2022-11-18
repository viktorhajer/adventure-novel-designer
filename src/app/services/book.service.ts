import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {Station} from '../model/station.model';
import {Item} from '../model/item.model';
import {StationItem} from '../model/station-item.model';
import {BookCorrectorService} from './book-corrector.service';
import {BookViewerComponent} from '../components/book-viewer/book-viewer.component';
import {DialogService} from './dialog.service';

const NUMBER_OF_MAX_GENERATION = 200;

@Injectable({
  providedIn: 'root'
})
export class BookService {
  loaded = false;
  model: Book;
  maxStationID = 1;

  constructor(private readonly dialogService: DialogService,
              private readonly corrector: BookCorrectorService) {
    this.model = new Book();
  }

  clearModel() {
    this.model = new Book();
    this.loaded = false;
  }

  loadModel(content: string) {
    try {
      this.model = JSON.parse(content);
      this.corrector.fixModel(this.model);
      this.loaded = true;
      this.setMaxStationID();
    } catch (e) {
      this.dialogService.openError('Failed to load the model due syntax error.');
    }
  }

  getStation(id: number): Station {
    const station = this.model.stations.find(s => s.id === id);
    return !!station ? station : null as any;
  }

  getStations(exceptId: number): Station[] {
    let filtered = this.model.stations.filter(s => s.id !== exceptId);
    const children = this.model.relations.filter(r => r.sourceId === exceptId).map(r => r.targetId);
    return filtered.filter(s => !children.includes(s.id));
  }

  getNumberOfBranches() {
    const counts: any[] = [];
    this.model.stations.forEach(s => counts.push({id: s.id, count: this.model.relations.filter(r => r.sourceId === s.id).length}));
    return counts.filter(c => c.count > 1).length;
  }

  getNumberOfWinners() {
    return this.model.stations.filter(s => s.winner).length;
  }

  getNumberOfLooser() {
    return this.model.stations.filter(s => s.looser).length;
  }

  getItem(id: number): Item {
    return this.model.items.find(i => i.id === id) as any;
  }

  getItems(exceptId: number): Item[] {
    const expectItems = this.model.stationItems.filter(si => si.stationId === exceptId).map(si => si.itemId);
    return this.model.items.filter(item => !expectItems.includes(item.id));
  }

  getStationItems(stationId: number): { item: Item, stationItem: StationItem }[] {
    const stationItems = this.model.stationItems.filter(si => si.stationId === stationId);
    return stationItems.map(si => {
      const item = this.model.items.find(item => item.id === si.itemId) as any;
      return {item, stationItem: si};
    });
  }

  createStation(station: Station, parentId?: number, comment = '') {
    station.id = ++this.maxStationID;
    this.model.stations.push(station);
    if (!!parentId && !this.getStation(parentId).winner && !this.getStation(parentId).looser) {
      this.model.relations.push({
        sourceId: parentId,
        targetId: station.id,
        comment,
        condition: false
      });
    }
  }

  updateStation(station: Station) {
    const originStation = this.model.stations.find(s => s.id === station.id);
    if (originStation) {
      originStation.title = station.title;
      originStation.story = station.story;
      originStation.comment = station.comment;
      originStation.question = station.question;
      originStation.regionId = station.regionId;
      originStation.color = station.color;
      originStation.starter = station.starter;
      originStation.winner = station.winner;
      originStation.looser = station.looser;
      originStation.life = station.life;
      if (station.winner || station.looser) {
        this.model.relations = this.model.relations.filter(r => r.sourceId !== station.id);
      }
      if (station.starter) {
        this.model.stations.filter(s => s.id !== station.id).forEach(s => s.starter = false);
      }
    }
  }

  deleteStation(id: number) {
    this.model.stations = this.model.stations.filter(s => s.id !== id);
    this.model.relations = this.model.relations.filter(r => r.sourceId !== id && r.targetId !== id);
    this.model.stationItems = this.model.stationItems.filter(si => si.stationId !== id);
  }

  createRelation(sourceId: number, targetId: number, comment = '', condition = false) {
    this.model.relations.push({sourceId, targetId, comment, condition});
  }

  deleteRelation(sourceId: number, targetId: number) {
    this.model.relations = this.model.relations.filter(r => !(r.sourceId === sourceId && r.targetId === targetId));
  }

  createItem(name: string) {
    const id = this.getNewItemId();
    this.model.items.push({id, name, description: ''});
  }

  deleteItem(id: number) {
    this.model.items = this.model.items.filter(i => i.id !== id);
    this.model.stationItems = this.model.stationItems.filter(si => si.itemId !== id);
  }

  setItem(stationId: number, itemId: number, count: number) {
    this.model.stationItems.push({stationId, itemId, count});
  }

  deleteStationItem(stationId: number, itemId: number) {
    this.model.stationItems = this.model.stationItems.filter(si => !(si.stationId === stationId && si.itemId === itemId));
  }

  getChildren(id: number): Station[] {
    return this.model.relations.filter(r => r.sourceId === id).map(r => this.model.stations.find(s => s.id === r.targetId) as any);
  }

  createRegion(name: string) {
    const id = this.getNewRegionId();
    this.model.regions.push({id, name, color: '#ffffff', description: ''});
  }

  deleteRegion(id: number) {
    this.model.regions = this.model.regions.filter(i => i.id !== id);
    this.model.stations.filter(s => s.regionId === id).forEach(s => s.regionId = 0);
  }

  createCharacter(name: string) {
    const id = this.getNewCharacterId();
    this.model.characters.push({id, name, description: ''});
  }

  deleteCharacter(id: number) {
    this.model.characters = this.model.characters.filter(i => i.id !== id);
  }

  finalize(withDialog = true): Promise<Station[]> {
    if (this.isValidBook()) {

      const hasIndex = !this.model.stations.some(s => s.index === 0);
      return (hasIndex ?
        this.dialogService.openConfirmation('Indexes has been generated. Would you like to refresh?', 'Yes', 'No')
        : Promise.resolve(true))
        .then(refresh => {
          let hasIndexError = false;
          if (refresh) {
            let generation = 0;
            do {
              generation++;
              this.generateIndexes();
              if (generation > NUMBER_OF_MAX_GENERATION) {
                hasIndexError = true;
                break;
              }
            } while (!this.validateIndexes());
            if (generation > 0) {
              console.log('Number of generation: ' + generation);
            }
          }
          const stations = this.sortAndReplaceMacros();
          if (withDialog) {
            this.openBookViewer(stations);
            this.validateMacros();
          }
          if (hasIndexError) {
            this.dialogService.openError(`Number of index generations has reached the maximum (${NUMBER_OF_MAX_GENERATION}). ` +
              'Please try it again, or consider turning off the index validation.');
          }
          return stations;

        });
    }
    return Promise.resolve([]);
  }
  
  getAffix(num: number): string {
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

  getAffix2(num: number): string {
    if (num % 10 !== 0 && [1, 4, 5, 7, 9].includes(num % 10)) {
      return '-hez';
    } else if (num % 10 !== 0 && [2, 5].includes(num % 10)) {
      return '-höz';
    } else if (num % 10 !== 0) {
      return '-hoz';
    } else if (num % 100 !== 0 && [1, 4, 5, 7, 9].includes(num % 100 / 10)) {
      return '-hez';
    } else if (num % 100 !== 0) {
      return '-hoz';
    } else {
      return '-hoz';
    }
  }

  getArticle(num: number): string {
    const numStr = num + '';
    if (numStr.substr(0, 1) === '5' || (numStr.length === 4 && numStr.substr(0, 1) === '1') || num === 1) {
      return 'az ';
    } else {
      return 'a ';
    }
  }

  private isValidBook() {
    let message = '';

    // No station
    if (this.model.stations.length === 0) {
      message = 'Please create at least one station.';
    }

    // One starter
    if (!message) {
      const starters = this.model.stations.filter(s => s.starter);
      if (starters.length !== 1) {
        if (starters.length === 0) {
          message = 'Missing first station.';
        } else {
          message = 'More than one first stations: ' + starters.map(s => s.title).join(', ') + '.';
        }
      }
    }

    // Shadow starter
    if (!message) {
      const targetIds = this.model.relations.map(r => r.targetId);
      const abandonedStarters = this.model.stations.filter(s => !s.starter && !targetIds.includes(s.id));
      if (abandonedStarters.length) {
        message = 'Abandoned stations (where there is no route and not first station): '
          + abandonedStarters.map(s => s.title).join(', ');
      }
    }
    if (message) {
      this.dialogService.openError(message);
    }
    return !message.length;
  }

  private validateMacros() {
    const messages = [];
    for (const s of this.model.stations) {
      const childrenNumber = this.model.relations.filter(r => r.sourceId === s.id).length;
      for (let i = 1; i < (childrenNumber + 1); i++) {
        if (s.story.indexOf('##' + i) === -1) {
          messages.push(s.title + ': ##' + i);
        }
      }
    }
    if (messages.length) {
      this.dialogService.openWarning('Unused macro(s): ' + messages.join(', '));
    }
  }

  private sortAndReplaceMacros(): Station[] {
    const stations = (JSON.parse(JSON.stringify(this.model.stations)) as Station[])
      .sort((s1, s2) => s1.index > s2.index ? 1 : -1);
    stations.forEach(s => {
      let i = 1;
      this.getChildren(s.id).forEach(c => {
        s.story = s.story
          .replace(`[##${i}]`, this.getArticle(c.index) + this.addAnchor(c.index, c.index + this.getAffix(c.index)))
          .replace(`(##${i})`, this.getArticle(c.index) + this.addAnchor(c.index, c.index + this.getAffix2(c.index)))
          .replace(`##${i}`, this.getArticle(c.index) + this.addAnchor(c.index, c.index + ''));
        i++;
      });
    });
    return stations;
  }

  private addAnchor(index: number, indexStr: string): string {
    return `<span class="anchor ${index}">${indexStr}</span>`;
  }

  private generateIndexes() {
    let index = 0;
    let stations = [...this.model.stations];
    const starter = stations.find(s => s.starter);
    if (starter) {
      index++;
      starter.index = index + this.model.numberingOffset;
      stations = stations.filter(s => s.id !== starter.id);
    }
    while (stations.length) {
      index++;
      const id = stations[Math.floor(Math.random() * stations.length)].id;
      this.getStation(id).index = index + this.model.numberingOffset;
      stations = stations.filter(s => s.id !== id);
    }
  }

  private validateIndexes(): boolean {
    let wrongPCIndex = 0;
    let wrongSSIndex = 0;
    if (this.model.stations.length > 10 && (this.model.validationPC || this.model.validationSS)) {
      const nums: number[] = [];
      this.model.stations.forEach(s => nums[s.id] = s.index);

      // check parent-child distance
      if (this.model.validationPC) {
        for (const r of this.model.relations) {
          if (Math.abs(nums[r.sourceId] - nums[r.targetId]) === 1) {
            wrongPCIndex++;
          }
        }
      }

      // check siblings distance
      if (this.model.validationSS) {
        this.model.stations.forEach(station => {
          const rs = this.model.relations.filter(r => r.sourceId === station.id)
            .map(r => nums[r.targetId]).sort((n1, n2) => n1 - n2);
          if (rs.length > 1) {
            for (let i = 1; i < rs.length; i++) {
              if (Math.abs(rs[i - 1] - rs[i]) === 1) {
                wrongSSIndex++;
              }
            }
          }
        });
      }

      // DEBUG
      /*if (wrongPCIndex > 0 || wrongSSIndex > 0) {
        console.log('-------------');
        console.log(' Number of wrong parent-child index: ' + wrongPCIndex);
        console.log(' Number of wrong siblings index: ' + wrongSSIndex);
      } else {
        console.log('-------------');
        console.log(' No wrong index.');
      }*/
    }
    return wrongPCIndex === 0 && wrongSSIndex === 0;
  }

  private openBookViewer(stations: Station[]) {
    const book = new Book();
    book.title = this.model.title;
    book.backgroundStory = this.model.backgroundStory;
    book.stations = stations;
    this.dialogService.openCustomDialog(BookViewerComponent, {width: '80vw'}, {book});
  }

  private setMaxStationID() {
    let max = 0;
    this.model.stations.forEach(s => {
      max = s.id > max ? s.id : max;
    });
    this.maxStationID = max;
  }

  private getNewItemId(): number {
    return this.getNewId(this.model.items);
  }

  private getNewRegionId(): number {
    return this.getNewId(this.model.regions);
  }

  private getNewCharacterId(): number {
    return this.getNewId(this.model.characters);
  }

  private getNewId(list: { id: number }[]): number {
    let max = 0;
    list.forEach(entity => {
      max = entity.id > max ? entity.id : max;
    });
    return max + 1;
  }
}

import {Station} from './station.model';
import {Relation} from './relation.model';
import {Item} from './item.model';
import {StationItem} from './station-item.model';
import {Region} from './region.model';

export class Novel {
  title: string = '';
  prolog: string = '';
  notes: string = '';
  stations: Station[] = [];
  relations: Relation[] = [];
  stationItems: StationItem[] = [];
  items: Item[] = [];
  regions: Region[] = [];
  mortality = true;
  showRegions = false;
}

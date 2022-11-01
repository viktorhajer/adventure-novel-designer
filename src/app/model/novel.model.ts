import {Station} from './station.model';
import {Relation} from './relation.model';
import {Item} from './item.model';
import {StationItem} from './station-item.model';
import {RelationItem} from './relation-item.model';

export class Novel {
  title: string = '';
  prolog: string = '';
  stations: Station[] = [];
  relations: Relation[] = [];
  stationItems: StationItem[] = [];
  relationItems: RelationItem[] = [];
  items: Item[] = [];
  mortality = true;
  handleInventory = true;
}

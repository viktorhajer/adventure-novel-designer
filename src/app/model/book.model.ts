import {Station} from './station.model';
import {Relation} from './relation.model';
import {Item} from './item.model';
import {StationItem} from './station-item.model';
import {Region} from './region.model';
import {Character} from './character.model';

export class Book {
  id: number = 0;
  title: string = '';
  backgroundStory: string = '';
  notes: string = '';
  stations: Station[] = [];
  relations: Relation[] = [];
  stationItems: StationItem[] = [];
  items: Item[] = [];
  regions: Region[] = [];
  characters: Character[] = [];
  mortality = true;
  questionnaire = false;
  showRegions = false;
  numberingOffset: number = 0;
  validationPC = true;
  validationPCD: number = 2;
  validationSS = true;
  validationSSD: number = 2;
}

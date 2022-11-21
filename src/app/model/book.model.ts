import {Station} from './station.model';
import {Relation} from './relation.model';
import {Item} from './item.model';
import {StationItem} from './station-item.model';
import {Scene} from './scene.model';
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
  scenes: Scene[] = [];
  characters: Character[] = [];
  mortality = true;
  questionnaire = false;
  charactersChapter = false;
  showScenes = false;
  numberingOffset: number = 0;
  validationPC = true;
  validationPCD: number = 2;
  validationSS = true;
  validationSSD: number = 2;
}

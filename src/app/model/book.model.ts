import {Scene} from './scene.model';
import {Relation} from './relation.model';
import {Item} from './item.model';
import {SceneItem} from './scene-item.model';
import {Chapter} from './chapter.model';
import {Character} from './character.model';

export class Book {
  id: number = 0;
  title: string = '';
  backgroundStory: string = '';
  notes: string = '';
  scenes: Scene[] = [];
  relations: Relation[] = [];
  sceneItems: SceneItem[] = [];
  items: Item[] = [];
  chapters: Chapter[] = [];
  characters: Character[] = [];
  mortality = true;
  questionnaire = false;
  questionnaireCommand: string = 'Go to [###]!';
  charactersChapter = false;
  showChapters = false;
  numberingOffset: number = 0;
  validationPC = true;
  validationPCD: number = 2;
  validationSS = true;
  validationSSD: number = 2;
}

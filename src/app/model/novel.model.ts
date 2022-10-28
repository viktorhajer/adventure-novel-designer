import {Station} from './station.model';
import {Relation} from './relation.model';

export class Novel {
  title: string = '';
  prolog: string = '';
  stations: Station[] = [];
  relations: Relation[] = [];
}

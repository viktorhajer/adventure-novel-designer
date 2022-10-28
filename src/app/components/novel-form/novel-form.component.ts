import {Component} from '@angular/core';
import {NovelService} from '../../services/novel.service';

@Component({
  selector: 'app-novel-form',
  templateUrl: './novel-form.component.html',
  styleUrls: ['./novel-form.component.scss']
})
export class NovelFormComponent {

  constructor(public readonly novelService: NovelService) {
  }

}

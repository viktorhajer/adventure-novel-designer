import {Component, EventEmitter, Output} from '@angular/core';
import {UiService} from '../../services/ui.service';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-scene-color-box',
  templateUrl: './scene-color-box.component.html',
  styleUrls: ['./scene-color-box.component.scss']
})
export class SceneColorBoxComponent {

  @Output() sceneChanged = new EventEmitter();

  constructor(public readonly uiService: UiService,
              public readonly bookService: BookService) {
  }

  setId(id: number) {
    this.sceneChanged.emit(id);
  }

  displayed(): boolean {
    return !!this.bookService.model.scenes.length;
  }
}

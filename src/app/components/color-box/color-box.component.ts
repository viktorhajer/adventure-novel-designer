import {Component, EventEmitter, Output} from '@angular/core';
import {UiService} from '../../services/ui.service';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-color-box',
  templateUrl: './color-box.component.html',
  styleUrls: ['./color-box.component.scss']
})
export class ColorBoxComponent {

  @Output() chapterChanged = new EventEmitter();

  constructor(public readonly uiService: UiService,
              public readonly bookService: BookService) {
  }

  setId(id: number) {
    this.chapterChanged.emit(id);
  }

  displayed(): boolean {
    return !!this.bookService.model.chapters.length;
  }
}

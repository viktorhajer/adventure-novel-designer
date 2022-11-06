import {Component, EventEmitter, Output} from '@angular/core';
import {UiService} from '../../services/ui.service';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-region-color-box',
  templateUrl: './region-color-box.component.html',
  styleUrls: ['./region-color-box.component.scss']
})
export class RegionColorBoxComponent {

  @Output() regionChanged = new EventEmitter();

  constructor(public readonly uiService: UiService,
              public readonly bookService: BookService) {
  }

  setId(id: number) {
    this.regionChanged.emit(id);
  }

  displayed(): boolean {
    return !!this.bookService.model.regions.length;
  }
}

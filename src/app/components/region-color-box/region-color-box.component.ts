import {Component} from '@angular/core';
import {UiService} from '../../services/ui.service';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-region-color-box',
  templateUrl: './region-color-box.component.html',
  styleUrls: ['./region-color-box.component.scss']
})
export class RegionColorBoxComponent {

  constructor(public readonly uiService: UiService,
              public readonly bookService: BookService) {
  }

  displayed(): boolean {
    return this.bookService.model.showRegions && !!this.bookService.model.regions.length;
  }
}

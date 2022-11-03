import {Component} from '@angular/core';
import {UiService} from '../../services/ui.service';
import {NovelService} from '../../services/novel.service';

@Component({
  selector: 'app-region-color-box',
  templateUrl: './region-color-box.component.html',
  styleUrls: ['./region-color-box.component.scss']
})
export class RegionColorBoxComponent {

  constructor(public readonly uiService: UiService,
              public readonly novelService: NovelService) {
  }

  displayed(): boolean {
    return this.novelService.model.showRegions && !!this.novelService.model.regions.length;
  }
}

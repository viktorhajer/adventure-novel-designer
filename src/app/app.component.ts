import {Component} from '@angular/core';
import {NovelService} from './services/novel.service';
import {Station} from './model/station.model';
import {VisualNovel} from './components/visual-pipe/visual-novel.model';
import {VisualNovelMapper} from './components/visual-pipe/visual-novel.mapper';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  modelString = '{"title":"Title","stations":[{"id":1,"sketch":"Lorem ipsum dolor sit amet, consectetur","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","exit":true},{"id":2,"sketch":"ipsum dolor sit amet, consectetur","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","exit":false}],"relations":[{"sourceID":1,"targetID":2,"comment":"text text"}]}';
  selectedStation: Station = null as any;
  visualModel: VisualNovel = null as any;

  constructor(private readonly novelService: NovelService) {
  }

  isModelLoaded(): boolean {
    return this.novelService.loaded;
  }

  load() {
    this.novelService.loadModel(this.modelString);
    this.selectedStation = this.novelService.model.stations[0];
    this.visualModel = VisualNovelMapper.mapNovel(this.novelService.model);
  }
}

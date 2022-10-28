import {Component} from '@angular/core';
import {NovelService} from './services/novel.service';
import {Station} from './model/station.model';
import {VisualNovel} from './components/visual-novel/visual-novel.model';
import {VisualNovelMapper} from './components/visual-novel/visual-novel.mapper';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  modelString = '{"title":"Title","prolog": "...",' +
    '"stations":[' +
    '{"id":1,"index":0,"starter": true,"title":"Lorem ipsum dolor sit amet, consectetur","comment": "","story":"Menj a ##1 vagy ##2.","color":"red"},' +
    '{"id":2,"index":0,"starter": false,"title":"dolor sit amet","comment": "","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"},' +
    '{"id":3,"index":0,"starter": false,"title":"ipsum dolor sit amet, consectetur","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"blue"}],' +
    '"relations":[' +
    '{"sourceID":1,"targetID":2,"comment":"text text"},' +
    '{"sourceID":1,"targetID":3,"comment":""}]}';
  station: Station = null as any;
  visualModel: VisualNovel = null as any;
  formTrigger = 0;

  constructor(private readonly novelService: NovelService) {
  }

  isModelLoaded(): boolean {
    return this.novelService.loaded;
  }

  load() {
    this.novelService.loadModel(this.modelString);
    this.visualModel = VisualNovelMapper.mapNovel(this.novelService.model);
  }

  download() {
    this.modelString = JSON.stringify(this.novelService.model);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.modelString);
    }
  }

  finalize() {
    this.novelService.finalize();
  }

  openNovel() {
    this.station = null as any;
    this.visualModel = null as any;
    this.formTrigger = 0;
    this.novelService.clearModel();
  }

  createNew() {
    this.station = new Station(0);
    this.formTrigger++;
  }

  openStation(id: string) {
    if (id) {
      this.station = JSON.parse(JSON.stringify(this.novelService.getStation(+id.replace('node_', ''))));
    } else {
      this.station = null as any;
    }
    this.changeTrigger();
  }

  private changeTrigger() {
    this.visualModel = VisualNovelMapper.mapNovel(this.novelService.model);
    this.formTrigger++;
  }
}

import {Component} from '@angular/core';
import {NovelService} from './services/novel.service';
import {UiService} from './services/ui.service';
import {Station} from './model/station.model';
import {StationViewerComponent} from './components/station-viewer/station-viewer.component';
import {VisualNovel} from './components/visual-novel/visual-novel.model';
import {VisualNovelMapper} from './components/visual-novel/visual-novel.mapper';
import {MatDialog} from '@angular/material/dialog';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  modelString = '{"title":"Lorem ipsum dolor","prolog": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",' +
    '"stations":[' +
    '{"id":1,"life":0,"index":0,"starter": true,"title":"Indulás a faluból","comment": "","story":"Menj a ##1 vagy ##2.","color":"red"},' +
    '{"id":2,"life":0,"index":0,"starter": false,"title":"Elágazás az erdőben","comment": "Consectetur adipiscing elit, sed do eiusmod","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"},' +
    '{"id":3,"life":0,"index":0,"starter": false,"title":"Sziklás kihívás","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.   ##1","color":"blue"},' +
    '{"id":4,"life":0,"index":0,"starter": false,"title":"Völgy","comment": "","story":"","color":"white"},' +
    '{"id":5,"life":0,"index":0,"starter": false,"title":"Manók","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"}' +
    '],"relations":[' +
    '{"sourceID":1,"targetID":2,"comment":"Megnéz"},' +
    '{"sourceID":1,"targetID":3,"comment":"Leugrik"},' +
    '{"sourceID":3,"targetID":4,"comment":""},' +
    '{"sourceID":4,"targetID":5,"comment":"Nyert"}]}';
  station: Station = null as any;
  visualModel: VisualNovel = null as any;
  formTrigger = 0;

  constructor(public readonly novelService: NovelService,
    private readonly dialog: MatDialog,
    public readonly ui: UiService) {
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
      const station = JSON.parse(JSON.stringify(this.novelService.getStation(+id.replace('node_', ''))));
      if (this.ui.expanded) {
        this.dialog.open(StationViewerComponent, {
          panelClass: 'full-modal',
          data: {station}
        }).afterClosed();
      } else {
        this.station = station;
      }
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

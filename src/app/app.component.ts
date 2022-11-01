import {Component, ViewChild} from '@angular/core';
import {NovelService} from './services/novel.service';
import {UiService} from './services/ui.service';
import {EditService} from './services/edit.service';
import {Station} from './model/station.model';
import {StationViewerComponent} from './components/station-viewer/station-viewer.component';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {WarningDialogComponent} from './components/warning-dialog/warning-dialog.component';
import {VisualNovelComponent} from './components/visual-novel/visual-novel.component';
import {VisualNovel} from './components/visual-novel/visual-novel.model';
import {VisualNovelMapper} from './components/visual-novel/visual-novel.mapper';
import {MatDialog} from '@angular/material/dialog';

const EMPTY_NOVEL = '{"title":"New novel","prolog":"","stations":[],"relations":[],"items":[],"stationItems":[],"mortality": true,"handleInventory": true}';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(VisualNovelComponent) visual: VisualNovelComponent = null as any;

  modelString = '{"title":"Lorem ipsum dolor","prolog": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",' +
    '"stations":[' +
    '{"id":1,"life":0,"index":0,"starter": true,"title":"Indulás a faluból","comment": "","story":"Menj a ##1 vagy ##2.","color":"red"},' +
    '{"id":2,"life":0,"index":0,"starter": false,"title":"Elágazás az erdőben","comment": "Consectetur adipiscing elit, sed do eiusmod","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"},' +
    '{"id":3,"life":0,"index":0,"starter": false,"title":"Sziklás kihívás","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.   ##1","color":"blue"},' +
    '{"id":4,"life":0,"index":0,"starter": false,"title":"Völgy","comment": "","story":"","color":"white"},' +
    '{"id":5,"life":0,"index":0,"starter": false,"title":"Manók","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"}' +
    '],"relations":[' +
    '{"sourceId":1,"targetId":2,"comment":"Megnéz"},' +
    '{"sourceId":1,"targetId":3,"comment":"Leugrik"},' +
    '{"sourceId":3,"targetId":4,"comment":""},' +
    '{"sourceId":4,"targetId":5,"comment":"Nyert"}],' +
    '"stationItems":[{"stationId": 3, "itemId": 1, "count": 2}],' + 
    '"items":[{"id":1,"name":"Kard"},{"id": 2,"name":"Kulcs"}],' + 
    '"mortality": true,"handleInventory": true}';
  station: Station = null as any;
  visualModel: VisualNovel = null as any;
  formTrigger = 0;
  previousStation: number = 0;

  constructor(public readonly novelService: NovelService,
    private readonly dialog: MatDialog,
    private readonly editService: EditService,
    public readonly ui: UiService) {
  }

  isModelLoaded(): boolean {
    return this.novelService.loaded;
  }

  load() {
    this.novelService.loadModel(this.modelString);
    this.visualModel = VisualNovelMapper.mapNovel(this.novelService.model);
  }

  save() {
    this.modelString = JSON.stringify(this.novelService.model);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.modelString);
      this.dialog.open(WarningDialogComponent, {
        panelClass: 'small-dialog',
        data: {message: 'Raw model was copied to the clipboard successfully.', warning: false}
      }).afterClosed();
    }
    this.visualModel = null as any;
    this.station = null as any;
    this.novelService.clearModel();
  }

  finalize() {
    this.novelService.finalize();
  }

  clearNovel() {
    this.modelString = EMPTY_NOVEL;
    this.station = null as any;
    this.visualModel = null as any;
    this.novelService.clearModel();
    this.changeTrigger();
  }

  createNewStation() {
    if (this.editService.unsaved) {
      this.openConfirmation('Are you sure to navigate without saving?').then(result => {
        if (result) {
          this.navigateToCreateNew();
        } else {
          this.changeTrigger();
        }
      });
    } else {
      this.navigateToCreateNew();
    }
  }

  openStation(id: string) {
    if (this.editService.unsaved) {
      this.openConfirmation('Are you sure to navigate without saving?').then(result => {
        if (result) {
          this.navigateToStation(id);
        } else {
          this.changeTrigger();
        }
      });
    } else {
      this.navigateToStation(id);
    }
  }
  
  clearStation() {
    if (this.station) {
      if (this.editService.unsaved) {
        this.openConfirmation('Are you sure to navigate without saving?').then(result => {
          if (result) {
            this.navigateToNovel();
          }
        });
      } else {
        this.navigateToNovel();
      }
    }
  }
  
  private navigateToNovel() {
    this.visual.selectNode('node_' + this.station.id);
    this.editService.unsaved = false;
    this.previousStation = 0;
    this.station = null as any; 
  }
  
  private navigateToCreateNew() {
    if (this.station && !!this.station.id) {
      this.previousStation = this.station.id;
    }
    this.station = new Station(0);
    this.changeTrigger();
  }
  
  private navigateToStation(id: string) {
    if (id) {
      const station = JSON.parse(JSON.stringify(this.novelService.getStation(+id.replace('node_', ''))));
      if (this.ui.expanded) {
        this.dialog.open(StationViewerComponent, {
          panelClass: 'full-modal',
          data: {station}
        }).afterClosed();
      } else {
        this.editService.unsaved = false;
        this.previousStation = station.id;
        this.station = station;
      }
    } else {
      this.editService.unsaved = false;
      this.previousStation = 0;
      this.station = null as any;
    }
    this.changeTrigger();
  }

  private changeTrigger() {
    this.visualModel = VisualNovelMapper.mapNovel(this.novelService.model);
    this.formTrigger++;
  }
  
  private openConfirmation(message: string): Promise<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data: {message},
      disableClose:true
    }).afterClosed().toPromise();
  }
}

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
import {firstValueFrom} from 'rxjs';
import {STATION_COLORS, StationColor} from './model/station-color.model';
import {SimulationService} from './services/simulation.service';
import {SimulationComponent} from './components/simulation/simulation.component';
import {NotesFormComponent} from './components/notes-form/notes-form.component';

const EMPTY_NOVEL = '{"title":"New novel","prolog":"","notes":"","stations":[],"relations":[],"items":[],' +
  '"stationItems":[],"regions": [],"mortality": true,"showRegions": false}';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(VisualNovelComponent) visual: VisualNovelComponent = null as any;

  modelString = '{"title":"Lorem ipsum dolor","showRegions": false,"notes":"","prolog": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",' +
    '"stations":[' +
    '{"id":1,"regionId":1,"life":4,"index":0,"starter":true,"winner":false,"looser":false,"title":"Indulás a faluból","comment": "","story":"Menj a ##1 vagy ##2.","color":"white"},' +
    '{"id":2,"regionId":1,"life":-1,"index":0,"starter":false,"winner":false,"looser":false,"title":"Elágazás az erdőben","comment": "Consectetur adipiscing elit, sed do eiusmod","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"},' +
    '{"id":3,"regionId":1,"life":0,"index":0,"starter":false,"winner":false,"looser":false,"title":"Sziklás kihívás","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.   ##1","color":"blue"},' +
    '{"id":4,"regionId":2,"life":2,"index":0,"starter": false,"winner":false,"looser":false,"title":"Völgy","comment": "","story":"","color":"white"},' +
    '{"id":5,"regionId":2,"life":-1,"index":0,"starter": false,"winner":false,"looser":false,"title":"Manók","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"orange"},' +
    '{"id":6,"regionId":0,"life":1,"title":"Folyópart","story":"ss","color":"white","comment":"","index":0,"starter":false,"winner":true,"looser":false},' +
    '{"id":7,"regionId":2,"life":0,"title":"Gödör","story":"gödör","color":"","comment":"","index":0,"starter":false,"winner":false,"looser":true},' +
    '{"id":8,"title":"Völgyben elágazás","story":"xxx","color":"blue","comment":"","index":0,"starter":false,"life":0,"winner":false,"looser":false,"regionId":1},' +
    '{"id":9,"title":"Kisállat simogató","story":"","color":"","comment":"","index":6,"starter":false,"life":-3,"winner":false,"looser":false,"regionId":1}' +
    '],"relations":[' +
    '{"sourceId":1,"targetId":2,"comment":"Megnéz","condition":false},' +
    '{"sourceId":1,"targetId":3,"comment":"Leugrik","condition":true},' +
    '{"sourceId":3,"targetId":4,"comment":"","condition":false},' +
    '{"sourceId":4,"targetId":6,"comment":"","condition":true},' +
    '{"sourceId":5,"targetId":7,"comment":"","condition":false},' +
    '{"sourceId":4,"targetId":5,"comment":"Nyert","condition":false},' +
    '{"sourceId":4,"targetId":8,"comment":"","condition":true},' +
    '{"sourceId":3,"targetId":8,"comment":"","condition":true},' +
    '{"sourceId":2,"targetId":9,"comment":"","condition":false},' +
    '{"sourceId":9,"targetId":6,"comment":"","condition":false}' +
    '],"stationItems":[{"stationId": 3, "itemId": 1, "count": 2}, {"stationId": 5, "itemId": 2, "count": 1}],' +
    '"items":[{"id":1,"name":"Kard"},{"id": 2,"name":"Kulcs"}],' +
    '"regions":[{"id":1,"name":"Középfölde","color":"green","description":""},{"id": 2,"name":"Tündérország","color":"blue","description":""}],' +
    '"mortality": true}';
  station: Station = null as any;
  visualModel: VisualNovel = null as any;
  formTrigger = 0;
  previousStation: number = 0;
  regionId: number = 0;
  color: string = '';
  colors: StationColor[] = [];

  constructor(public readonly novelService: NovelService,
              private readonly dialog: MatDialog,
              private readonly editService: EditService,
              private readonly simulationService: SimulationService,
              private readonly visualNovelMapper: VisualNovelMapper,
              public readonly ui: UiService) {
  }

  isModelLoaded(): boolean {
    return this.novelService.loaded;
  }

  load() {
    this.novelService.loadModel(this.modelString);
    this.visualModel = this.visualNovelMapper.mapNovel(this.novelService.model);
    this.initColors();
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

  simulation() {
    this.dialog.open(SimulationComponent, {
      disableClose: true,
      panelClass: 'big-dialog'
    }).afterClosed();
  }

  takingNotes() {
    this.dialog.open(NotesFormComponent, {
      disableClose: true,
      panelClass: 'big-dialog'
    }).afterClosed();
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

  visualFilter() {
    if (this.station) {
      this.visual.selectNode('node_' + this.station.id);
      this.previousStation = 0;
      this.station = null as any;
    }
    this.changeTrigger();
  }

  private navigateToNovel() {
    this.visual.selectNode('node_' + this.station.id);
    this.editService.unsaved = false;
    this.previousStation = 0;
    this.station = null as any;
  }

  private navigateToCreateNew() {
    let regionId = 0;
    if (this.station && !!this.station.id) {
      this.previousStation = this.station.id;
      regionId = this.station.regionId;
    }
    this.station = new Station(0);
    this.station.regionId = regionId;
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
        this.initColors();
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
    this.visualModel = this.visualNovelMapper.mapNovel(this.novelService.model, this.regionId, this.color);
    this.formTrigger++;
  }

  private openConfirmation(message: string): Promise<boolean> {
    return firstValueFrom(this.dialog.open(ConfirmDialogComponent, {
      data: {message},
      disableClose: true
    }).afterClosed());
  }

  private initColors() {
    const cols = this.novelService.model.stations.filter(s => !!s.color).map(s => s.color)
      .filter((c, index, self) => self.indexOf(c) === index);
    this.colors = cols.map(s => {
      const color = STATION_COLORS.find(c => c.value === s);
      return color ? color : null as any;
    }).filter(s => !!s);
  }
}

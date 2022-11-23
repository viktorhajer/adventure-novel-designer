import {Component, ViewChild} from '@angular/core';
import {BookService} from './services/book.service';
import {UiService} from './services/ui.service';
import {EditService} from './services/edit.service';
import {Scene} from './model/scene.model';
import {SceneViewerComponent} from './components/scene-viewer/scene-viewer.component';
import {SCENE_COLORS, SceneColor} from './model/scene-color.model';
import {SimulationService} from './services/simulation.service';
import {SimulationComponent} from './components/simulation/simulation.component';
import {NotesFormComponent} from './components/notes-form/notes-form.component';
import {VisualBookComponent} from './components/visual-book/visual-book.component';
import {VisualModel} from './components/visual-book/visual-book.model';
import {VisualBookMapper} from './components/visual-book/visual-book.mapper';
import {BookLoaderService} from './services/book-loader.service';
import {ReviewFormComponent} from './components/review-form/review-form.component';
import {QuestionnaireComponent} from './components/questionnaire/questionnaire.component';
import {CharacterViewerComponent} from './components/character-viewer/character-viewer.component';
import {IndexEditorComponent} from './components/index-editor/index-editor.component';
import {Book} from './model/book.model';
import {StorageService} from './services/storage.service';
import {DownloadService} from './services/download.service';
import {DialogService} from './services/dialog.service';
import {firstValueFrom} from 'rxjs';
import {BookViewerComponent} from './components/book-viewer/book-viewer.component';

const EMPTY_BOOK = '{"id":0,"title":"New book","backgroundStory":"","notes":"","scenes":[],"relations":[],"items":[],' +
  '"sceneItems":[],"chapters": [],"characters": [],"mortality": true,"showChapters": false,"validationPC": true,"validationSS": true,' +
  '"numberingOffset": 0,"questionnaire": false,"questionnaireCommand": "Go to [###]!","validationPCD":2,"validationSSD":2,' +
  '"charactersChapter":false}';

// @ts-ignore

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(VisualBookComponent) visual: VisualBookComponent = null as any;

  modelString = '{"id":1667885870598,"title":"Lorem ipsum dolor","showChapters": false,"notes":"","backgroundStory": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",' +
    '"scenes":[' +
    '{"id":1,"chapterId":1,"life":4,"index":0,"starter":true,"winner":false,"looser":false,"title":"Indulás a faluból","comment": "","story":"Menj a ##1 vagy ##2.","color":"white"},' +
    '{"id":2,"chapterId":1,"life":-1,"index":0,"starter":false,"winner":false,"looser":false,"title":"Elágazás az erdőben","comment": "Consectetur adipiscing elit, sed do eiusmod","story":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"white"},' +
    '{"id":3,"chapterId":1,"life":0,"index":0,"starter":false,"winner":false,"looser":false,"title":"Sziklás kihívás","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.   ##1","color":"blue"},' +
    '{"id":4,"chapterId":2,"life":2,"index":0,"starter": false,"winner":false,"looser":false,"title":"Völgy","comment": "","story":"","color":"white"},' +
    '{"id":5,"chapterId":2,"life":-1,"index":0,"starter": false,"winner":false,"looser":false,"title":"Manók","comment": "","story":"Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","color":"orange"},' +
    '{"id":6,"chapterId":0,"life":1,"title":"Folyópart","story":"ss","color":"white","comment":"","index":0,"starter":false,"winner":true,"looser":false},' +
    '{"id":7,"chapterId":2,"life":0,"title":"Gödör","story":"gödör","color":"","comment":"","index":0,"starter":false,"winner":false,"looser":true},' +
    '{"id":8,"title":"Völgyben elágazás","story":"xxx","color":"blue","comment":"","index":0,"starter":false,"life":0,"winner":false,"looser":false,"chapterId":1},' +
    '{"id":9,"title":"Kisállat simogató","question":"Are you sure?","story":"","color":"","comment":"","index":6,"starter":false,"life":-3,"winner":false,"looser":false,"chapterId":1}' +
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
    '],"sceneItems":[{"sceneId": 3, "itemId": 1, "count": 2}, {"sceneId": 5, "itemId": 2, "count": 1}],' +
    '"items":[{"id":1,"name":"Kard"},{"id": 2,"name":"Kulcs"}],' +
    '"chapters":[{"id":1,"name":"Középfölde","color":"green","description":""},{"id": 2,"name":"Tündérország","color":"blue","description":""}],' +
    '"mortality": true,"questionnaire": true,"questionnaireCommand": "A válaszold ellenőrzéséhez lapozz [###]!","characters": [],' +
    '"numberingOffset": 10,"charactersChapter":false,' +
    '"validationPC": true,"validationSS": true,"validationPCD":2,"validationSSD":2}';
  scene: Scene = null as any;
  visualModel: VisualModel = null as any;
  formTrigger = 0;
  previousScene: number = 0;
  chapterFilterId: number = 0;
  color: string = '';
  colors: SceneColor[] = [];

  constructor(public readonly bookService: BookService,
              private readonly editService: EditService,
              private readonly dialogService: DialogService,
              private readonly simulationService: SimulationService,
              private readonly storage: StorageService,
              private readonly downloadService: DownloadService,
              private readonly visualBookMapper: VisualBookMapper,
              private readonly bookLoader: BookLoaderService,
              public readonly ui: UiService) {
  }

  isModelLoaded(): boolean {
    return this.bookService.loaded;
  }

  load() {
    this.color = '';
    this.chapterFilterId = 0;
    this.clearStage();
    this.bookService.loadModel(this.modelString);
    this.visualModel = this.visualBookMapper.mapModel(this.bookService.model);
    this.ui.expanded = false;
    this.initColors();
  }

  loadStored() {
    this.bookLoader.loadStored().subscribe(data => {
      this.modelString = JSON.stringify(data);
      this.load();
    });
  }

  loadBookFromStorage(id: number) {
    this.modelString = this.storage.openBook(id);
    this.load();
  }

  loadNew() {
    const book = JSON.parse(EMPTY_BOOK) as Book;
    book.id = Date.now();
    this.modelString = JSON.stringify(book);
    this.load();
  }

  save() {
    this.modelString = JSON.stringify(this.bookService.model);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.modelString);
      this.dialogService.openInfo('Raw model was copied to the clipboard successfully.');
      this.storage.updateStorage(this.bookService.model);
    }
  }

  finalize() {
    this.bookService.finalize().then(result => {
      const book = new Book();
      book.title = this.bookService.model.title;
      book.backgroundStory = this.bookService.model.backgroundStory;
      book.scenes = result[0];
      this.dialogService.openCustomDialog(BookViewerComponent, {width: '700px'}, {book});
      this.bookService.validateMacros();
    });
  }

  downloadFinal() {
    this.bookService.finalize().then(result =>
      this.downloadService.downloadGeneratedBook(this.bookService.model, result[0]));
  }

  openQuestionnaire() {
    this.dialogService.openCustomDialog(QuestionnaireComponent, {width: '70vw'});
  }

  openCharacters() {
    this.dialogService.openCustomDialog(CharacterViewerComponent, {width: '50vw'});
  }

  review() {
    this.dialogService.openCustomDialog(ReviewFormComponent, {width: '70vw', disableClose: true},
      {id: this.scene ? this.scene.id : null}).subscribe(() => this.changeTrigger());
  }

  simulation() {
    this.dialogService.openCustomDialog(SimulationComponent, {width: '80vw', disableClose: true});
  }

  takingNotes() {
    this.dialogService.openCustomDialog(NotesFormComponent, {width: '70vw', disableClose: true});
  }

  indexEditor() {
    firstValueFrom(this.dialogService.openCustomDialog(IndexEditorComponent, {width: '90vw'})).then(result => {
      if (result) {
        this.openScene(result + '');
      }
    });
  }

  exit() {
    this.dialogService.openConfirmation('Would you like to save before leaving?')
      .then(result => {
        if (result) {
          this.save();
        }
        this.clearStage();
      });
  }

  createNewScene() {
    if (this.editService.unsaved) {
      this.dialogService.openConfirmation('Are you sure to navigate without saving?').then(result => {
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

  openScene(id: string) {
    if (this.bookService.model.showChapters) {
      this.color = '';
    }

    if (this.editService.unsaved) {
      this.dialogService.openConfirmation('Are you sure to navigate without saving?').then(result => {
        if (result) {
          this.navigateToScene(id);
        } else {
          this.changeTrigger();
        }
      });
    } else {
      this.navigateToScene(id);
    }
  }

  clearScene() {
    if (this.scene) {
      if (this.editService.unsaved) {
        this.dialogService.openConfirmation('Are you sure to navigate without saving?').then(result => {
          if (result) {
            this.navigateToBook();
          }
        });
      } else {
        this.navigateToBook();
      }
    }
  }

  visualFilter() {
    if (this.scene) {
      this.visual.selectNode('node_' + this.scene.id);
      this.previousScene = 0;
      this.scene = null as any;
    }
    this.changeTrigger();
  }

  setChapterFilter(id: any) {
    this.chapterFilterId = id;
    this.visualFilter();
    if (this.visualModel && !!this.visualModel.nodes.length) {
      setTimeout(() => this.visual.zoom(0));
    }
  }

  private clearStage() {
    this.scene = null as any;
    this.visualModel = null as any;
    this.bookService.clearModel();
    this.ui.expanded = false;
    this.changeTrigger();
  }

  private navigateToBook() {
    this.visual.selectNode('node_' + this.scene.id);
    this.editService.unsaved = false;
    this.previousScene = 0;
    this.scene = null as any;
  }

  private navigateToCreateNew() {
    let chapterId = 0;
    if (this.scene && !!this.scene.id) {
      this.previousScene = this.scene.id;
      chapterId = this.scene.chapterId;
    }
    this.scene = new Scene(0);
    this.scene.chapterId = chapterId;
    this.changeTrigger();
  }

  private navigateToScene(id: string) {
    if (id) {
      const scene = JSON.parse(JSON.stringify(this.bookService.getScene(+id.replace('node_', ''))));
      if (this.ui.expanded) {
        this.dialogService.openCustomDialog(SceneViewerComponent, {width: '70vw'}, {scene});
      } else {
        this.initColors();
        this.editService.unsaved = false;
        this.previousScene = scene.id;
        this.scene = scene;
      }
    } else {
      this.editService.unsaved = false;
      this.previousScene = 0;
      this.scene = null as any;
    }
    this.changeTrigger();
  }

  private changeTrigger() {
    this.visualModel = this.visualBookMapper.mapModel(this.bookService.model, this.chapterFilterId, this.color);
    this.formTrigger++;
  }

  private initColors() {
    const cols = this.bookService.model.scenes.filter(s => !!s.color).map(s => s.color)
      .filter((c, index, self) => self.indexOf(c) === index);
    this.colors = cols.map(s => {
      const color = SCENE_COLORS.find(c => c.value === s);
      return color ? color : null as any;
    }).filter(s => !!s);
  }
}

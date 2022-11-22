import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Scene} from '../../model/scene.model';
import {Item} from '../../model/item.model';
import {SceneItem} from '../../model/scene-item.model';
import {BookService} from '../../services/book.service';
import {EditService} from '../../services/edit.service';
import {SceneViewerComponent} from '../scene-viewer/scene-viewer.component';
import {RelationFormComponent} from '../relation-form/relation-form.component';
import {Relation} from '../../model/relation.model';
import {SCENE_COLORS} from '../../model/scene-color.model';
import {FormControl} from '@angular/forms';
import {firstValueFrom, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Chapter} from '../../model/chapter.model';
import {DialogService} from '../../services/dialog.service';

@Component({
  selector: 'app-scene-form',
  templateUrl: './scene-form.component.html',
  styleUrls: ['./scene-form.component.scss']
})
export class SceneFormComponent implements OnChanges {
  @Input() trigger = 0;
  @Input() scene: Scene = null as any;
  @Input() previousScene = 0;
  @Output() sceneChanged = new EventEmitter();

  children: Scene[] = [];
  childRoutes: Relation[] = [];
  createNew = true;
  chapters: Chapter[] = [];
  scenes: Scene[] = [];
  items: Item[] = [];
  ownItems: { item: Item, sceneItem: SceneItem }[] = [];
  colors = SCENE_COLORS;
  myDestinationControl = new FormControl('');
  filteredDestinationOptions: Observable<Scene[]> = null as any;

  constructor(public readonly bookService: BookService,
              private readonly dialogService: DialogService,
              private readonly editService: EditService) {
  }

  ngOnChanges() {
    this.chapters = this.bookService.model.chapters;
    if (this.scene) {
      this.createNew = !this.scene.id;
      if (!this.createNew) {
        this.children = this.bookService.getChildren(this.scene.id);
        this.childRoutes = this.bookService.model.relations.filter(r => r.sourceId === this.scene.id);
        this.scenes = this.bookService.getScenes(this.scene.id);
        this.items = this.bookService.getItems(this.scene.id);
        this.ownItems = this.bookService.getSceneItems(this.scene.id);
      }
      this.filteredDestinationOptions = this.myDestinationControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterDestination(value || '')),
      );
    }
  }

  checkUnsaved() {
    if (this.createNew) {
      this.editService.unsaved = true;
    } else {
      const originScene = this.bookService.model.scenes.find(s => s.id === this.scene.id);
      this.editService.unsaved = JSON.stringify(originScene) !== JSON.stringify(this.scene);
    }
  }

  checkWinnerLooser(field = 0) {
    const hasChild = this.bookService.model.relations.some(r => r.sourceId === this.scene.id);
    if (field !== 0 && (this.scene.winner || this.scene.looser) && hasChild) {
      const marker = field === 1 && this.scene.winner ? 'winner' : 'looser';
      const message = `Are you sure you are marking the scene as a ${marker}? All routes from this scene will be deleted.`;
      this.dialogService.openConfirmation(message).then(result => {
        if (!result) {
          this.scene.winner = false;
          this.scene.looser = false;
        } else {
          this.setStarterWinnerLooser(field);
        }
      });
      return;
    }
    this.setStarterWinnerLooser(field);
    this.checkUnsaved();
  }

  create() {
    if (this.validateTitle()) {
      this.bookService.createScene(this.scene, this.previousScene);
      this.editService.unsaved = false;
      this.sceneChanged.emit(this.scene.id + '');
    }
  }

  update() {
    if (this.validateTitle()) {
      this.bookService.updateScene(this.scene);
      this.editService.unsaved = false;
      this.sceneChanged.emit(this.scene.id + '');
    }
  }

  delete() {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteScene(this.scene.id);
        this.sceneChanged.emit(null);
      }
    });
  }

  createRelation(destination: HTMLInputElement, comment: HTMLInputElement, conditionInput: any) {
    const targetId = this.scenes.find(s => s.title === destination.value)?.id as any;
    if (targetId) {
      this.bookService.createRelation(this.scene.id, targetId, comment.value, conditionInput.checked);
      comment.value = '';
      this.sceneChanged.emit(this.scene.id + '');
      destination.value = '';
      comment.value = '';
      conditionInput.checked = false;
    }
  }

  deleteRelation(targetId: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteRelation(this.scene.id, targetId);
        this.sceneChanged.emit(this.scene.id + '');
      }
    });
  }

  deleteOwnItem(itemId: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteSceneItem(this.scene.id, itemId);
        this.sceneChanged.emit(this.scene.id + '');
      }
    });
  }

  setItem(sceneId: number, itemId: any, count: HTMLInputElement) {
    let value = !!(+count.value) ? +count.value : 1;
    value = value > 0 ? value : 1;
    this.bookService.setItem(sceneId, itemId.value, value);
    itemId.value = '';
    count.value = '1';
    this.sceneChanged.emit(this.scene.id + '');
  }

  viewScene(scene: Scene) {
    this.dialogService.openCustomDialog(SceneViewerComponent, {width: '70vw'}, {scene});
  }

  editRelation(targetId: number) {
    const relation = this.bookService.model.relations.find(r => r.targetId === targetId && r.sourceId === this.scene.id);
    if (relation) {
      firstValueFrom(this.dialogService.openCustomDialog(RelationFormComponent, {width: '70vw', disableClose: true}, {relation}))
        .then(result => {
          if (result !== null) {
            relation.comment = result.comment;
            relation.condition = result.condition;
            this.editService.unsaved = false;
            this.sceneChanged.emit(this.scene.id + '');
          }
        });
    }
  }

  getRelation(childId: number) {
    return this.childRoutes?.find(r => r.targetId === childId) as any;
  }

  private validateTitle(): boolean {
    if (!this.scene.title.trim()) {
      this.dialogService.openError('Please enter a valid title.');
      return false;
    } else if (this.bookService.model.scenes.some(s => s.title === this.scene.title && s.id !== this.scene.id)) {
      this.dialogService.openError('Title should be unique.');
      return false;
    }
    return true;
  }

  private filterDestination(value: string): Scene[] {
    const filterValue = value.toLowerCase();
    return this.scenes.filter(s => s.title.toLowerCase().includes(filterValue));
  }

  private setStarterWinnerLooser(field: number) {
    if (field === 0 && this.scene.starter) {
      this.scene.winner = false;
      this.scene.looser = false;
    } else if (field === 1 && this.scene.winner) {
      this.scene.starter = false;
      this.scene.looser = false;
    } else if (field === 2 && this.scene.looser) {
      this.scene.starter = false;
      this.scene.winner = false;
    }
  }
}

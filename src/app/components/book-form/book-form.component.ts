import {Component, EventEmitter, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {Station} from '../../model/station.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {firstValueFrom} from 'rxjs';
import {SceneFormComponent} from '../scene-form/scene-form.component';
import {Item} from '../../model/item.model';
import {Scene} from '../../model/scene.model';
import {UiService} from '../../services/ui.service';
import {CharacterFormComponent} from '../character-form/character-form.component';
import {DialogService} from '../../services/dialog.service';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss']
})
export class BookFormComponent {
  @Output() stationSelected = new EventEmitter();
  itemName = '';
  sceneName = '';
  characterName = '';

  constructor(public readonly bookService: BookService,
              public readonly uiService: UiService,
              private readonly dialogService: DialogService) {
  }

  createItem() {
    if (this.validateName(this.itemName, this.bookService.model.items)) {
      this.bookService.createItem(this.itemName);
      this.itemName = '';
    }
  }

  deleteItem(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteItem(id);
      }
    });
  }

  editItem(id: number) {
    const item = this.bookService.model.items.find(item => item.id === id);
    if (item) {
      firstValueFrom(this.dialogService.openCustomDialog(ItemFormComponent, {width: '70vw', disableClose: true}, {item}))
        .then(result => {
          if (result !== null && this.validateName(result.name, this.bookService.model.items, id)) {
            item.name = result.name;
            item.description = result.description;
          }
        });
    }
  }

  createScene() {
    if (this.validateName(this.sceneName, this.bookService.model.scenes)) {
      this.bookService.createScene(this.sceneName.trim());
      this.sceneName = '';
    }
  }

  deleteScene(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteScene(id);
      }
    });
  }

  editScene(id: number) {
    const scene = this.bookService.model.scenes.find(scene => scene.id === id);
    if (scene) {
      firstValueFrom(this.dialogService.openCustomDialog(SceneFormComponent, {width: '70vw', disableClose: true}, {scene}))
        .then(result => {
          if (result !== null && this.validateName(result.name, this.bookService.model.scenes, id)) {
            scene.name = result.name;
            scene.color = result.color;
            scene.description = result.description;
            this.changePlugin();
          }
        });
    }
  }

  createCharacter() {
    if (this.validateName(this.characterName, this.bookService.model.characters)) {
      this.bookService.createCharacter(this.characterName.trim());
      this.characterName = '';
    }
  }

  deleteCharacter(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteCharacter(id);
      }
    });
  }

  editCharacter(id: number) {
    const character = this.bookService.model.characters.find(character => character.id === id);
    if (character) {
      firstValueFrom(this.dialogService.openCustomDialog(CharacterFormComponent, {width: '70vw', disableClose: true}, {character}))
        .then(result => {
          if (result !== null && this.validateName(result.name, this.bookService.model.characters, id)) {
            character.name = result.name;
            character.description = result.description;
            this.changePlugin();
          }
        });
    }
  }

  getEditorialStations(): Station[] {
    return this.bookService.model.stations.filter(s => !!s.comment);
  }

  openStation(id: number) {
    this.stationSelected.emit(id + '');
  }

  changePlugin() {
    this.stationSelected.emit('');
  }

  private validateName(name: string, list: Item[] | Scene[], id = 0): boolean {
    if (!name.trim()) {
      this.dialogService.openError('Please enter a valid name.');
      return false;
    } else if (list.some(s => s.name === name && (id === 0 || s.id !== id))) {
      this.dialogService.openError('Name should be unique.');
      return false;
    }
    return true;
  }
}

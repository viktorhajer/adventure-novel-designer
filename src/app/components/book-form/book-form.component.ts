import {Component, EventEmitter, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {Scene} from '../../model/scene.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {firstValueFrom} from 'rxjs';
import {ChapterFormComponent} from '../chapter-form/chapter-form.component';
import {Item} from '../../model/item.model';
import {Chapter} from '../../model/chapter.model';
import {UiService} from '../../services/ui.service';
import {CharacterFormComponent} from '../character-form/character-form.component';
import {DialogService} from '../../services/dialog.service';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss']
})
export class BookFormComponent {
  @Output() sceneSelected = new EventEmitter();
  itemName = '';
  chapterName = '';
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

  createChapter() {
    if (this.validateName(this.chapterName, this.bookService.model.chapters)) {
      this.bookService.createChapter(this.chapterName.trim());
      this.chapterName = '';
    }
  }

  deleteChapter(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteChapter(id);
      }
    });
  }

  editChapter(id: number) {
    const chapter = this.bookService.model.chapters.find(c => c.id === id);
    if (chapter) {
      firstValueFrom(this.dialogService.openCustomDialog(ChapterFormComponent, {width: '70vw', disableClose: true}, {chapter}))
        .then(result => {
          if (result !== null && this.validateName(result.name, this.bookService.model.chapters, id)) {
            chapter.name = result.name;
            chapter.color = result.color;
            chapter.description = result.description;
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

  getEditorialScenes(): Scene[] {
    return this.bookService.model.scenes.filter(s => !!s.comment);
  }

  openScene(id: number) {
    this.sceneSelected.emit(id + '');
  }

  changePlugin() {
    this.sceneSelected.emit('');
  }

  private validateName(name: string, list: Item[] | Chapter[], id = 0): boolean {
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

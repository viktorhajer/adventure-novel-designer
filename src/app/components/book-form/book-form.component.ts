import {Component, EventEmitter, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {Station} from '../../model/station.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {firstValueFrom} from 'rxjs';
import {RegionFormComponent} from '../region-form/region-form.component';
import {Item} from '../../model/item.model';
import {Region} from '../../model/region.model';
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
  regionName = '';
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

  createRegion() {
    if (this.validateName(this.regionName, this.bookService.model.regions)) {
      this.bookService.createRegion(this.regionName.trim());
      this.regionName = '';
    }
  }

  deleteRegion(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.bookService.deleteRegion(id);
      }
    });
  }

  editRegion(id: number) {
    const region = this.bookService.model.regions.find(region => region.id === id);
    if (region) {
      firstValueFrom(this.dialogService.openCustomDialog(RegionFormComponent, {width: '70vw', disableClose: true}, {region}))
        .then(result => {
          if (result !== null && this.validateName(result.name, this.bookService.model.regions, id)) {
            region.name = result.name;
            region.color = result.color;
            region.description = result.description;
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

  private validateName(name: string, list: Item[] | Region[], id = 0): boolean {
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

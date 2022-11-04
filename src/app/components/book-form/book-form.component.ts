import {Component, EventEmitter, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {Station} from '../../model/station.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {RegionFormComponent} from '../region-form/region-form.component';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import {Item} from '../../model/item.model';
import {Region} from '../../model/region.model';
import {UiService} from '../../services/ui.service';
import {CharacterFormComponent} from '../character-form/character-form.component';

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
              private readonly dialog: MatDialog) {
  }

  createItem() {
    if (this.validateName(this.itemName, this.bookService.model.items)) {
      this.bookService.createItem(this.itemName);
      this.itemName = '';
    }
  }

  deleteItem(id: number) {
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.bookService.deleteItem(id);
      }
    });
  }

  editItem(id: number) {
    const item = this.bookService.model.items.find(item => item.id === id);
    if (item) {
      firstValueFrom(this.dialog.open(ItemFormComponent, {data: {item}, disableClose: true})
        .afterClosed()).then(result => {
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
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.bookService.deleteRegion(id);
      }
    });
  }

  editRegion(id: number) {
    const region = this.bookService.model.regions.find(region => region.id === id);
    if (region) {
      firstValueFrom(this.dialog.open(RegionFormComponent, {data: {region}, disableClose: true})
        .afterClosed()).then(result => {
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
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.bookService.deleteCharacter(id);
      }
    });
  }

  editCharacter(id: number) {
    const character = this.bookService.model.characters.find(character => character.id === id);
    if (character) {
      firstValueFrom(this.dialog.open(CharacterFormComponent, {data: {character}, disableClose: true})
        .afterClosed()).then(result => {
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
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Please enter a valid name.'}
      }).afterClosed();
      return false;
    } else if (list.some(s => s.name === name && (id === 0 || s.id !== id))) {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Name should be unique.'}
      }).afterClosed();
      return false;
    }
    return true;
  }
}

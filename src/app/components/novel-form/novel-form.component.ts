import {Component, EventEmitter, Output} from '@angular/core';
import {NovelService} from '../../services/novel.service';
import {Station} from '../../model/station.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {RegionFormComponent} from '../region-form/region-form.component';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import {Item} from '../../model/item.model';
import {Region} from '../../model/region.model';

@Component({
  selector: 'app-novel-form',
  templateUrl: './novel-form.component.html',
  styleUrls: ['./novel-form.component.scss']
})
export class NovelFormComponent {
  @Output() stationSelected = new EventEmitter();
  itemName = '';
  regionName = '';

  constructor(public readonly novelService: NovelService,
              private readonly dialog: MatDialog) {
  }

  createItem() {
    if (this.validateName(this.itemName, this.novelService.model.items)) {
      this.novelService.createItem(this.itemName);
      this.itemName = '';
    }
  }

  deleteItem(id: number) {
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.novelService.deleteItem(id);
      }
    });
  }

  editItem(id: number) {
    const item = this.novelService.model.items.find(item => item.id === id);
    if (item) {
      firstValueFrom(this.dialog.open(ItemFormComponent, {data: {item}, disableClose: true})
        .afterClosed()).then(result => {
        if (result !== null && this.validateName(result, this.novelService.model.items, id)) {
          item.name = result;
        }
      });
    }
  }

  createRegion() {
    if (this.validateName(this.regionName, this.novelService.model.regions)) {
      this.novelService.createRegion(this.regionName.trim());
      this.regionName = '';
    }
  }

  deleteRegion(id: number) {
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.novelService.deleteRegion(id);
      }
    });
  }

  editRegion(id: number) {
    const region = this.novelService.model.regions.find(region => region.id === id);
    if (region) {
      firstValueFrom(this.dialog.open(RegionFormComponent, {data: {region}, disableClose: true})
        .afterClosed()).then(result => {
        if (result !== null && this.validateName(result, this.novelService.model.regions, id)) {
          region.name = result;
        }
      });
    }
  }

  getEditorialStations(): Station[] {
    return this.novelService.model.stations.filter(s => !!s.comment);
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

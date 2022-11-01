import {Component, EventEmitter, Output} from '@angular/core';
import {NovelService} from '../../services/novel.service';
import {Station} from '../../model/station.model';
import {ItemFormComponent} from '../item-form/item-form.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-novel-form',
  templateUrl: './novel-form.component.html',
  styleUrls: ['./novel-form.component.scss']
})
export class NovelFormComponent {
  @Output() stationSelected = new EventEmitter();
  itemName = '';

  constructor(public readonly novelService: NovelService,
              private readonly dialog: MatDialog) {
  }
  
  deleteItem(id: number) {
    this.novelService.deleteItem(id);
  }
  
  createItem() {
    if (!!this.itemName.trim()) {
      this.novelService.createItem(this.itemName);
      this.itemName = '';
    }
  }
  
  editItem(id: number) {
    const item = this.novelService.model.items.find(item => item.id === id);
    if (item) {
      this.dialog.open(ItemFormComponent, {data: {item}, disableClose:true})
        .afterClosed().toPromise().then(result => {
          if(result !== null) {
            item.name = result;
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
}

import {Component, EventEmitter, Output} from '@angular/core';
import {NovelService} from '../../services/novel.service';
import {Station} from '../../model/station.model';

@Component({
  selector: 'app-novel-form',
  templateUrl: './novel-form.component.html',
  styleUrls: ['./novel-form.component.scss']
})
export class NovelFormComponent {

  @Output() stationSelected = new EventEmitter();

  constructor(public readonly novelService: NovelService) {
  }

  getEditorialStations(): Station[] {
    return this.novelService.model.stations.filter(s => !!s.comment);
  }
  
  openStation(id: number) {
    this.stationSelected.emit(id + '');
  }
}

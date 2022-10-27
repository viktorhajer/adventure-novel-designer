import {Component, Input, OnChanges} from '@angular/core';
import {Station} from '../../model/station.model';
import {NovelService} from '../../services/novel.service';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import {StationViewerComponent} from '../station-viewer/station-viewer.component';

@Component({
  selector: 'app-station-form',
  templateUrl: './station-form.component.html',
  styleUrls: ['./station-form.component.scss']
})
export class StationFormComponent implements OnChanges {

  @Input() selectedStation: Station = null as any;
  children: Station[] = [];

  constructor(private readonly novelService: NovelService,
              private readonly dialog: MatDialog) {
  }

  ngOnChanges() {
    if (this.selectedStation) {
      this.children = this.novelService.model.relations.filter(r => r.sourceID === this.selectedStation.id).map(r => {
        return this.novelService.model.stations.find(s => s.id === r.targetID) as any;
      })
    }
  }

  viewStation(station: Station) {
    this.dialog.open(StationViewerComponent, {
      panelClass: 'full-modal',
      data: {station}
    }).afterClosed();
  }

}

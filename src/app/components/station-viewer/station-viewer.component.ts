import {Component, Inject} from '@angular/core';
import {Station} from '../../model/station.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-station-viewer',
  templateUrl: './station-viewer.component.html',
  styleUrls: ['./station-viewer.component.scss']
})
export class StationViewerComponent {

  constructor(protected dialogRef: MatDialogRef<StationViewerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { station: Station }) {
  }

  close() {
    this.dialogRef.close();
  }
}

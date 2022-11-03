import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Region} from '../../model/region.model';
import {STATION_COLORS, StationColor} from '../../model/station-color.model';

@Component({
  selector: 'app-region-form',
  templateUrl: './region-form.component.html',
  styleUrls: ['./region-form.component.scss']
})
export class RegionFormComponent {
  colors = STATION_COLORS;
  name: string;
  color: string;
  description: string;

  constructor(protected dialogRef: MatDialogRef<RegionFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { region: Region }) {
    this.name = this.data.region.name;
    this.color =  this.data.region.color;
    this.description =  this.data.region.description;
  }

  update() {
    this.dialogRef.close({name: this.name, color: this.color, description: this.description});
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

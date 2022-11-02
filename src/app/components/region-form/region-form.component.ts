import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Region} from '../../model/region.model';

@Component({
  selector: 'app-region-form',
  templateUrl: './region-form.component.html',
  styleUrls: ['./region-form.component.scss']
})
export class RegionFormComponent {

  name: string;

  constructor(protected dialogRef: MatDialogRef<RegionFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { region: Region }) {
    this.name = this.data.region.name;
  }

  update() {
    this.dialogRef.close(this.name);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

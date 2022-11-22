import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Chapter} from '../../model/chapter.model';
import {STATION_COLORS} from '../../model/station-color.model';

@Component({
  selector: 'app-chapter-form',
  templateUrl: './chapter-form.component.html',
  styleUrls: ['./chapter-form.component.scss']
})
export class ChapterFormComponent {
  colors = STATION_COLORS;
  name: string;
  color: string;
  description: string;

  constructor(protected dialogRef: MatDialogRef<ChapterFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { chapter: Chapter }) {
    this.name = this.data.chapter.name;
    this.color = this.data.chapter.color;
    this.description = this.data.chapter.description;
  }

  update() {
    this.dialogRef.close({name: this.name, color: this.color, description: this.description});
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

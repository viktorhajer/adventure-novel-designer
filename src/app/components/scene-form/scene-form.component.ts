import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Scene} from '../../model/scene.model';
import {STATION_COLORS} from '../../model/station-color.model';

@Component({
  selector: 'app-scene-form',
  templateUrl: './scene-form.component.html',
  styleUrls: ['./scene-form.component.scss']
})
export class SceneFormComponent {
  colors = STATION_COLORS;
  name: string;
  color: string;
  description: string;

  constructor(protected dialogRef: MatDialogRef<SceneFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { scene: Scene }) {
    this.name = this.data.scene.name;
    this.color = this.data.scene.color;
    this.description = this.data.scene.description;
  }

  update() {
    this.dialogRef.close({name: this.name, color: this.color, description: this.description});
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

import {Component, Inject} from '@angular/core';
import {Scene} from '../../model/scene.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-scene-viewer',
  templateUrl: './scene-viewer.component.html',
  styleUrls: ['./scene-viewer.component.scss']
})
export class SceneViewerComponent {

  constructor(protected dialogRef: MatDialogRef<SceneViewerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { scene: Scene }) {
  }

  close() {
    this.dialogRef.close();
  }
}

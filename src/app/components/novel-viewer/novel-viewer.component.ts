import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Novel} from '../../model/novel.model';

@Component({
  selector: 'app-novel-viewer',
  templateUrl: './novel-viewer.component.html',
  styleUrls: ['./novel-viewer.component.scss']
})
export class NovelViewerComponent {

  novel: Novel;

  constructor(protected dialogRef: MatDialogRef<NovelViewerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { novel: Novel }) {
    this.novel = this.data.novel;
  }

  close() {
    this.dialogRef.close();
  }
}

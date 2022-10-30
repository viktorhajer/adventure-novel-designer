import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Novel} from '../../model/novel.model';

@Component({
  selector: 'app-novel-viewer',
  templateUrl: './novel-viewer.component.html',
  styleUrls: ['./novel-viewer.component.scss']
})
export class NovelViewerComponent implements OnInit {

  novel: Novel;

  constructor(protected dialogRef: MatDialogRef<NovelViewerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { novel: Novel }) {
    this.novel = this.data.novel;
  }

  ngOnInit() {
    setTimeout(() => {
      const els = document.getElementsByClassName('anchor');
      Array.prototype.forEach.call(els, (el) => {
        const index = el.classList[1];
        if (index) {
          el.addEventListener('click', () => {
            document.getElementById('chapter_' + index)?.scrollIntoView();
          });
        }
      });
    }, 100);
  }

  close() {
    this.dialogRef.close();
  }
}

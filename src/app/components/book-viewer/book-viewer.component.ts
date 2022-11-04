import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Book} from '../../model/book.model';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrls: ['./book-viewer.component.scss']
})
export class BookViewerComponent implements OnInit {
  book: Book;

  constructor(protected dialogRef: MatDialogRef<BookViewerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { book: Book }) {
    this.book = this.data.book;
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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {MatDialog} from '@angular/material/dialog';
import {StorageService} from '../../services/storage.service';
import {BookListItem} from '../../model/book-list-item.model';
import {firstValueFrom} from 'rxjs';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {

  @Output() openBook = new EventEmitter();
  bookList: BookListItem[] = [];

  constructor(private readonly bookService: BookService,
              private readonly storage: StorageService,
              private readonly dialog: MatDialog) {
  }

  ngOnInit() {
    this.bookList = this.storage.getBookList();
  }

  deleteBook(id: number) {
    firstValueFrom(this.dialog.open(ConfirmDialogComponent, {data: {message: 'Are you sure to delete?'}, disableClose: true})
      .afterClosed()).then(result => {
      if (result) {
        this.storage.deleteBook(id);
        this.bookList = this.storage.getBookList();
      }
    });
  }
}

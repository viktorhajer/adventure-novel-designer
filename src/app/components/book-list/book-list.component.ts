import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BookService} from '../../services/book.service';
import {StorageService} from '../../services/storage.service';
import {BookListItem} from '../../model/book-list-item.model';
import {DownloadService} from '../../services/download.service';
import {DialogService} from '../../services/dialog.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {

  @Output() openBook = new EventEmitter();
  bookList: BookListItem[] = [];

  constructor(private readonly bookService: BookService,
              private readonly downloadService: DownloadService,
              private readonly dialogService: DialogService,
              private readonly storage: StorageService) {
  }

  ngOnInit() {
    this.bookList = this.storage.getBookList();
  }

  download(id: number) {
    this.downloadService.downloadRawBook(JSON.parse(this.storage.openBook(id)));
  }

  deleteBook(id: number) {
    this.dialogService.openConfirmation().then(result => {
      if (result) {
        this.storage.deleteBook(id);
        this.bookList = this.storage.getBookList();
      }
    });
  }
}

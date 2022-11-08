import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {BookListItem} from '../model/book-list-item.model';

const BOOK_PREFIX_KEY = 'RPGD_';
const BOOK_LIST_KEY = 'RPGD_list';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  getBookList(): BookListItem[] {
    const list = this.getObject(BOOK_LIST_KEY);
    if (list && list.list) {
      return list.list;
    }
    return [];
  }

  updateStorage(book: Book) {
    // update book list
    const list = this.getBookList().filter(b => b.id !== book.id);
    list.push({id: book.id, title: book.title});
    this.setObject(BOOK_LIST_KEY, {list});

    // update book
    this.setObject(BOOK_PREFIX_KEY + book.id, book);
  }

  openBook(id: number): string {
    return this.storage.getItem(BOOK_PREFIX_KEY + id) || '';
  }

  deleteBook(id: number) {
    const list = this.getBookList().filter(b => b.id !== id);
    this.setObject(BOOK_LIST_KEY, {list});
    this.storage.removeItem(BOOK_PREFIX_KEY + id);
  }

  private getObject(key: string): any {
    const item = this.storage.getItem(key);
    return item ? JSON.parse(item) : {};
  }

  private setObject(key: string, value: any) {
    this.storage.setItem(key, JSON.stringify(value));
  }
}

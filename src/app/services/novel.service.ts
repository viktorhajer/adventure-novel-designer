import {Injectable} from '@angular/core';
import {Novel} from '../model/novel.model';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class NovelService {
  loaded = false;
  model: Novel;

  constructor(private readonly dialog: MatDialog) {
    this.model = new Novel();
  }

  loadModel(content: string) {
    try {
      this.model = JSON.parse(content);
      this.loaded = true;
    } catch (e) {
      this.dialog.open(ErrorDialogComponent, {
        panelClass: 'full-modal',
        data: {message: 'Failed to load the model due syntax error.'}
      }).afterClosed();
    }
  }
}

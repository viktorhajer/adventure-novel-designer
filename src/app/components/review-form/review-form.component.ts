import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Station} from '../../model/station.model';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent {

  station: Station = null as any;
  history: number[] = [];
  children: number[] = [];

  constructor(private dialogRef: MatDialogRef<ReviewFormComponent>,
              private readonly bookService: BookService,
              @Inject(MAT_DIALOG_DATA) public data: { id: number }) {
    if (this.data.id) {
      this.open(this.data.id);
    } else {
      this.station = this.bookService.model.stations.find(s => s.starter) as Station;
      if (!this.station) {
        this.station = this.bookService.model.stations[0];
      }
    }
    if (this.station) {
      this.children = this.bookService.model.relations.filter(r => r.sourceId === this.station.id).map(r => r.targetId);
    }
  }

  open(stationId: number, skipHistory = false) {
    if (!skipHistory && this.station) {
      this.history.push(this.station.id);
    }
    this.station = this.bookService.model.stations.find(s => s.id === stationId) as Station;
    if (this.station) {
      this.children = this.bookService.model.relations.filter(r => r.sourceId === this.station.id).map(r => r.targetId);
    }
  }

  back() {
    if (this.history.length) {
      this.open(this.history.pop() as number, true);
    }
  }

  close() {
    this.dialogRef.close();
  }
}

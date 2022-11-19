import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {Station} from '../../model/station.model';

@Component({
  selector: 'app-index-editor',
  templateUrl: './index-editor.component.html',
  styleUrls: ['./index-editor.component.scss']
})
export class IndexEditorComponent {

  maximum = -1;
  minimum = 10000000000;
  average = 0;
  total = 0;
  relationsDistances: {s: number, t: number, d: number, h: number}[] = [];

  constructor(private readonly dialogRef: MatDialogRef<IndexEditorComponent>,
              private readonly bookService: BookService) {
    const nums: number[] = [];
    this.bookService.model.stations.forEach(s => nums[s.id] = s.index);
    this.relationsDistances = this.bookService.model.relations.map(r => ({s: r.sourceId, t: r.targetId, d: Math.abs(nums[r.sourceId] - nums[r.targetId]), h: 0}));
    
    this.relationsDistances.forEach(rd => {
      this.maximum = rd.d > this.maximum ? rd.d : this.maximum;
      this.minimum = rd.d < this.minimum ? rd.d : this.minimum; 
    });
    this.relationsDistances.forEach(rd => {
      rd.h = Math.round(rd.d / this.maximum * 90);
      this.total += rd.d;
    });
    this.average = Math.round(this.total / this.relationsDistances.length);
  }
  
  openStation(id: number) {
    this.dialogRef.close(id);
  }

  close() {
    this.dialogRef.close();
  }
}

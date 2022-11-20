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

  maximumPC = -1;
  minimumPC = 10000000000;
  maximumSS = -1;
  minimumSS = 10000000000;
  averagePC = 0;
  averageSS = 0;
  totalPC = 0;
  totalSS = 0;
  lastGeneration = 0;
  relationsDistancesPC: {s: number, t: number, d: number, h: number}[] = [];
  relationsDistancesSS: {s: number, t: number, d: number, h: number}[] = [];
  pcSelected = true;

  constructor(private readonly dialogRef: MatDialogRef<IndexEditorComponent>,
              public readonly bookService: BookService) {
    this.refreshStatistics();
  }
  
  refreshStatistics() {
    this.reInit();
    const nums: number[] = [];
    this.bookService.model.stations.forEach(s => nums[s.id] = s.index);
    
    // Parent - child
    this.relationsDistancesPC = this.bookService.model.relations
      .map(r => ({s: r.sourceId, t: r.targetId, d: Math.abs(nums[r.sourceId] - nums[r.targetId]), h: 0}));
    this.relationsDistancesPC.forEach(rd => {
      this.maximumPC = rd.d > this.maximumPC ? rd.d : this.maximumPC;
      this.minimumPC = rd.d < this.minimumPC ? rd.d : this.minimumPC; 
      this.totalPC += rd.d;
    });
    this.relationsDistancesPC.forEach(rd => {
      rd.h = Math.round(rd.d / this.maximumPC * 90);
    });
    this.averagePC = Math.round(this.totalPC / this.relationsDistancesPC.length);
    
    // Siblings
    this.bookService.model.stations.forEach(station => {
      const rs = this.bookService.model.relations.filter(r => r.sourceId === station.id)
        .map(r => ({s: r.sourceId, t: r.targetId, n: nums[r.targetId]})).sort((n1, n2) => n1.n - n2.n);
      if (rs.length > 1) {
        for (let i = 1; i < rs.length; i++) {
          this.relationsDistancesSS.push({s: rs[i].s, t: rs[i].t, d: Math.abs(rs[i - 1].n - rs[i].n), h: 0})
        }
      }
    });
    this.relationsDistancesSS.forEach(rd => {
      this.maximumSS = rd.d > this.maximumSS ? rd.d : this.maximumSS;
      this.minimumSS = rd.d < this.minimumSS ? rd.d : this.minimumSS; 
      this.totalSS += rd.d;
    });
    console.log(this.relationsDistancesSS);
    this.relationsDistancesSS.forEach(rd => {
      rd.h = Math.round(rd.d / this.maximumSS * 90);
    });
    this.averageSS = Math.round(this.totalSS / this.relationsDistancesSS.length);
  }
  
  generate() {
    this.bookService.finalize(false, false).then(result => {
      this.lastGeneration = result[1];
      this.refreshStatistics();
    });
  }
  
  togglePCSelected() {
    this.pcSelected = !this.pcSelected;
  }
  
  openStation(id: number) {
    this.dialogRef.close(id);
  }

  close() {
    this.dialogRef.close();
  }
  
  private reInit() {
    this.maximumPC = -1;
    this.minimumPC = 10000000000;
    this.maximumSS = -1;
    this.minimumSS = 10000000000;
    this.relationsDistancesPC = [];
    this.relationsDistancesSS = [];
    this.averagePC = 0;
    this.averageSS = 0;
    this.totalPC = 0;
    this.totalSS = 0;
  }
}

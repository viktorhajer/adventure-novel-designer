import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {Station} from '../../model/station.model';
import {map, startWith} from 'rxjs/operators';

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
  relationsDistancesPC: IndexStatus[] = [];
  relationsDistancesSS: IndexStatus[] = [];
  pcSelected = true;
  fineTuneMethod = 1;
  fineTuneIndex;
  stationControl = new FormControl('');
  filteredStationControlOptions: Observable<Station[]> = null as any;

  constructor(private readonly dialogRef: MatDialogRef<IndexEditorComponent>,
              public readonly bookService: BookService) {
    this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
    this.refreshStatistics();
  }

  refreshStatistics() {
    this.reInit();
    const nums: number[] = [];
    this.bookService.model.stations.forEach(s => nums[s.id] = s.index);

    // Parent - child
    this.relationsDistancesPC = this.bookService.model.relations
      .map(r => ({s: r.sourceId, st: this.getStationTitle(r.sourceId), sn: nums[r.sourceId],
        t: r.targetId, tt: this.getStationTitle(r.targetId), tn: nums[r.targetId],
        d: Math.abs(nums[r.sourceId] - nums[r.targetId]), h: 0}));
    this.relationsDistancesPC.forEach(rd => {
      this.maximumPC = rd.d > this.maximumPC ? rd.d : this.maximumPC;
      this.minimumPC = rd.d < this.minimumPC ? rd.d : this.minimumPC;
      this.totalPC += rd.d;
    });
    this.relationsDistancesPC.forEach(rd => {
      rd.h = Math.round(rd.d / this.maximumPC * 90);
    });
    this.averagePC = Math.round(this.totalPC / this.relationsDistancesPC.length);
    this.relationsDistancesPC.sort((r1, r2) => r1.sn - r2.sn);

    // Siblings
    this.bookService.model.stations.forEach(station => {
      const rs = this.bookService.model.relations.filter(r => r.sourceId === station.id)
        .map(r => ({s: r.sourceId, t: r.targetId, n: nums[r.targetId]})).sort((n1, n2) => n1.n - n2.n);
      if (rs.length > 1) {
        for (let i = 1; i < rs.length; i++) {
          this.relationsDistancesSS.push({s: rs[i].t, st: this.getStationTitle(rs[i-1].t), sn: nums[rs[i-1].t],
            t: rs[i].t, tt: this.getStationTitle(rs[i].t), tn: nums[rs[i].t],
            d: Math.abs(rs[i - 1].n - rs[i].n), h: 0});
        }
      }
    });
    this.relationsDistancesSS.forEach(rd => {
      this.maximumSS = rd.d > this.maximumSS ? rd.d : this.maximumSS;
      this.minimumSS = rd.d < this.minimumSS ? rd.d : this.minimumSS;
      this.totalSS += rd.d;
    });
    this.relationsDistancesSS.forEach(rd => {
      rd.h = Math.round(rd.d / this.maximumSS * 90);
    });
    this.averageSS = Math.round(this.totalSS / this.relationsDistancesSS.length);
    this.relationsDistancesSS.sort((r1, r2) => r1.sn - r2.sn);
  }

  generate() {
    this.bookService.finalize(false, false).then(result => {
      this.lastGeneration = result[1];
      this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
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

  changeIndex(title: HTMLInputElement) {
    const station = this.bookService.model.stations.find(s => s.index + '. ' + s.title === title.value) as Station;
    const starter = this.bookService.model.stations.find(s => s.starter) as Station;
    if (!!starter && this.fineTuneIndex !== starter.index && station && station.index !== this.fineTuneIndex && !station.starter) {
      if (this.fineTuneMethod === 1) {
        const station2 = this.bookService.model.stations.find(s => s.index === this.fineTuneIndex) as Station;
        if (station2) {
          station2.index = station.index;
          station.index = this.fineTuneIndex;
        }
      } else {
        const originIndex = station.index;
        if (originIndex > this.fineTuneIndex) {
          this.bookService.model.stations.filter(s => s.index >= this.fineTuneIndex && s.index < originIndex).forEach(s => s.index++);
        } else {
          this.bookService.model.stations.filter(s => s.index > originIndex && s.index <= this.fineTuneIndex).forEach(s => s.index--);
        }
        station.index = this.fineTuneIndex;
      }
      this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
      title.value = '';
      this.refreshStatistics();
    }
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

    this.filteredStationControlOptions = this.stationControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterStation(value || '')),
    );
  }

  private filterStation(value: string): Station[] {
    const filterValue = value.toLowerCase();
    return this.bookService.model.stations.filter(s =>
      (s.title.toLowerCase().includes(filterValue) || (s.index+'').includes(filterValue)) && !s.starter);
  }

  private getStationTitle(id: number): string {
    return this.bookService.getStation(id)?.title;
  }
}

class IndexStatus {
  s: number = 0;
  st: string = '';
  sn: number = 0;
  t: number = 0;
  tt: string = '';
  tn: number = 0;
  d: number = 0;
  h: number = 0;
}

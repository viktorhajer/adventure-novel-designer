import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {Scene} from '../../model/scene.model';
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
  sceneControl = new FormControl('');
  filteredControlOptions: Observable<Scene[]> = null as any;

  constructor(private readonly dialogRef: MatDialogRef<IndexEditorComponent>,
              public readonly bookService: BookService) {
    this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
    this.refreshStatistics();
  }

  refreshStatistics() {
    this.reInit();
    const nums: number[] = [];
    this.bookService.model.scenes.forEach(s => nums[s.id] = s.index);

    // Parent - child
    this.relationsDistancesPC = this.bookService.model.relations
      .map(r => ({s: r.sourceId, st: this.getSceneTitle(r.sourceId), sn: nums[r.sourceId],
        t: r.targetId, tt: this.getSceneTitle(r.targetId), tn: nums[r.targetId],
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
    this.bookService.model.scenes.forEach(scene => {
      const rs = this.bookService.model.relations.filter(r => r.sourceId === scene.id)
        .map(r => ({s: r.sourceId, t: r.targetId, n: nums[r.targetId]})).sort((n1, n2) => n1.n - n2.n);
      if (rs.length > 1) {
        for (let i = 1; i < rs.length; i++) {
          this.relationsDistancesSS.push({s: rs[i].t, st: this.getSceneTitle(rs[i-1].t), sn: nums[rs[i-1].t],
            t: rs[i].t, tt: this.getSceneTitle(rs[i].t), tn: nums[rs[i].t],
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
    this.bookService.finalize(true).then(result => {
      this.lastGeneration = result[1];
      this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
      this.refreshStatistics();
    });
  }

  togglePCSelected() {
    this.pcSelected = !this.pcSelected;
  }

  openScene(id: number) {
    this.dialogRef.close(id);
  }

  close() {
    this.dialogRef.close();
  }

  changeIndex(title: HTMLInputElement) {
    const scene = this.bookService.model.scenes.find(s => s.index + '. ' + s.title === title.value) as Scene;
    const starter = this.bookService.model.scenes.find(s => s.starter) as Scene;
    if (!!starter && this.fineTuneIndex !== starter.index && scene && scene.index !== this.fineTuneIndex && !scene.starter) {
      if (this.fineTuneMethod === 1) {
        const scene2 = this.bookService.model.scenes.find(s => s.index === this.fineTuneIndex) as Scene;
        if (scene2) {
          scene2.index = scene.index;
          scene.index = this.fineTuneIndex;
        }
      } else {
        const originIndex = scene.index;
        if (originIndex > this.fineTuneIndex) {
          this.bookService.model.scenes.filter(s => s.index >= this.fineTuneIndex && s.index < originIndex).forEach(s => s.index++);
        } else {
          this.bookService.model.scenes.filter(s => s.index > originIndex && s.index <= this.fineTuneIndex).forEach(s => s.index--);
        }
        scene.index = this.fineTuneIndex;
      }
      this.fineTuneIndex = this.bookService.model.numberingOffset + 2;
      title.value = '';
      this.refreshStatistics();
    }
  }

  toggleMethod() {
    this.fineTuneMethod = (this.fineTuneMethod + 1) % 2;
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

    this.filteredControlOptions = this.sceneControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterScene(value || '')),
    );
  }

  private filterScene(value: string): Scene[] {
    const filterValue = value.toLowerCase();
    return this.bookService.model.scenes.filter(s =>
      (s.title.toLowerCase().includes(filterValue) || (s.index+'').includes(filterValue)) && !s.starter);
  }

  private getSceneTitle(id: number): string {
    return this.bookService.getScene(id)?.title;
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

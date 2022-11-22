import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Scene} from '../../model/scene.model';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent {

  scene: Scene = null as any;
  history: number[] = [];
  children: number[] = [];

  constructor(private dialogRef: MatDialogRef<ReviewFormComponent>,
              private readonly bookService: BookService,
              @Inject(MAT_DIALOG_DATA) public data: { id: number }) {
    if (this.data.id) {
      this.open(this.data.id);
    } else {
      this.scene = this.bookService.model.scenes.find(s => s.starter) as Scene;
      if (!this.scene) {
        this.scene = this.bookService.model.scenes[0];
      }
    }
    if (this.scene) {
      this.children = this.bookService.model.relations.filter(r => r.sourceId === this.scene.id).map(r => r.targetId);
    }
  }

  open(sceneId: number, skipHistory = false) {
    if (!skipHistory && this.scene) {
      this.history.push(this.scene.id);
    }
    this.scene = this.bookService.model.scenes.find(s => s.id === sceneId) as Scene;
    if (this.scene) {
      this.children = this.bookService.model.relations.filter(r => r.sourceId === this.scene.id).map(r => r.targetId);
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

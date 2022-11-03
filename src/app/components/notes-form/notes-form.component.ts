import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NovelService} from '../../services/novel.service';

@Component({
  selector: 'app-notes-form',
  templateUrl: './notes-form.component.html',
  styleUrls: ['./notes-form.component.scss']
})
export class NotesFormComponent {

  notes: string;

  constructor(private readonly dialogRef: MatDialogRef<NotesFormComponent>,
              private readonly novelService: NovelService) {
    this.notes = this.novelService.model.notes;
  }

  update() {
    this.novelService.model.notes = this.notes;
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}

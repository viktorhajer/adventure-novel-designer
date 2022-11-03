import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-notes-form',
  templateUrl: './notes-form.component.html',
  styleUrls: ['./notes-form.component.scss']
})
export class NotesFormComponent {

  notes: string;

  constructor(private readonly dialogRef: MatDialogRef<NotesFormComponent>,
              private readonly bookService: BookService) {
    this.notes = this.bookService.model.notes;
  }

  update() {
    this.bookService.model.notes = this.notes;
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}

import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {Character} from '../../model/character.model';

@Component({
  selector: 'app-character-viewer',
  templateUrl: './character-viewer.component.html',
  styleUrls: ['./character-viewer.component.scss']
})
export class CharacterViewerComponent {

  characters: Character[] = [];

  constructor(private readonly dialogRef: MatDialogRef<CharacterViewerComponent>,
              private readonly bookService: BookService) {
    this.characters = this.bookService.model.characters;
  }

  cancel() {
    this.dialogRef.close();
  }
}

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Character} from '../../model/character.model';

@Component({
  selector: 'app-character-form',
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.scss']
})
export class CharacterFormComponent {
  name: string;
  description: string;

  constructor(protected dialogRef: MatDialogRef<CharacterFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { character: Character }) {
    this.name = this.data.character.name;
    this.description = this.data.character.description;
  }

  update() {
    this.dialogRef.close({name: this.name, description: this.description});
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

import {Component, Inject} from '@angular/core';
import {Relation} from '../../model/relation.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-relation-form',
  templateUrl: './relation-form.component.html',
  styleUrls: ['./relation-form.component.scss']
})
export class RelationFormComponent {

  comment: string;

  constructor(protected dialogRef: MatDialogRef<RelationFormComponent>,
  
              @Inject(MAT_DIALOG_DATA) public data: { relation: Relation }) {
    this.comment = this.data.relation.comment;
  }

  update() {
    this.dialogRef.close(this.comment);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

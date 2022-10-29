import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent {

  constructor(protected dialogRef: MatDialogRef<ConfirmDeleteComponent>) {
  }

  ok() {
    this.dialogRef.close(true);
  }
  
  cancel() {
    this.dialogRef.close(false);
  }
}

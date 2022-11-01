import {Component, Inject} from '@angular/core';
import {Item} from '../../model/item.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent {

  name: string;

  constructor(protected dialogRef: MatDialogRef<ItemFormComponent>,
  
              @Inject(MAT_DIALOG_DATA) public data: { item: Item }) {
    this.name = this.data.item.name;
  }

  update() {
    this.dialogRef.close(this.name);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

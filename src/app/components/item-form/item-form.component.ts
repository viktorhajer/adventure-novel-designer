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
  description: string;

  constructor(protected dialogRef: MatDialogRef<ItemFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { item: Item }) {
    this.name = this.data.item.name;
    this.description = this.data.item.description;
  }

  update() {
    this.dialogRef.close({name: this.name, description: this.description});
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

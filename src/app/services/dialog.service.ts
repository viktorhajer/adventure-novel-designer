import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {ConfirmDialogComponent} from '../components/confirm-dialog/confirm-dialog.component';
import {DialogComponent} from '../components/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private readonly dialog: MatDialog) {
  }

  openConfirmation(message = 'Are you sure to delete?'): Promise<boolean> {
    return firstValueFrom(this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {message},
      backdropClass: 'panel-backdrop',
      disableClose: true
    }).afterClosed());
  }

  openInfo(message: string): Promise<boolean> {
    return this.openDialog(message, true, false, false);
  }

  openWarning(message: string): Promise<boolean> {
    return this.openDialog(message, false, true, false);
  }

  openError(message: string): Promise<boolean> {
    return this.openDialog(message, false, false, true);
  }

  private openDialog(message: string, info: boolean, warning: boolean, error: boolean): Promise<boolean> {
    return firstValueFrom(this.dialog.open(DialogComponent, {
      width: '300px',
      backdropClass: 'panel-backdrop',
      data: {message, info, warning, error}
    }).afterClosed());
  }
}

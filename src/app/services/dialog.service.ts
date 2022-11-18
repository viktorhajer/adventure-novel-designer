import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom, Observable} from 'rxjs';
import {ConfirmDialogComponent} from '../components/confirm-dialog/confirm-dialog.component';
import {DialogComponent} from '../components/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private readonly dialog: MatDialog) {
  }

  openConfirmation(message = 'Are you sure to delete?', okTitle = 'OK', cancelTitle = 'Cancel'): Promise<boolean> {
    return firstValueFrom(this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {message, okTitle, cancelTitle},
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

  openCustomDialog(component: any, config: any, data?: any): Observable<any> {
    const conf = Object.assign({backdropClass: 'panel-backdrop'}, config);
    if (data) {
      conf.data = data;
    }
    return this.dialog.open(component, conf).afterClosed();
  }

  private openDialog(message: string, info: boolean, warning: boolean, error: boolean): Promise<boolean> {
    return firstValueFrom(this.openCustomDialog(DialogComponent, {width: '300px'}, {message, info, warning, error}));
  }
}

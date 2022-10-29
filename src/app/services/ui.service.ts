import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  expanded = false;
  
  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}

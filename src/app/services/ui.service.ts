import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  expanded = false;

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  getColorHex(colorStr: string): string {
    const colorMap = {
      'white': '#ffffff',
      'red': '#f9d9cf',
      'blue': '#9fd5ff',
      'green': '#dff8ca',
      'yellow': '#fff1a3',
      'violet': '#e9b1e9',
      'orange': '#ffd484',
      'gray': '#d5d5d5',
      'dgray': '#787878'
    } as any;
    return colorMap[colorStr] ? colorMap[colorStr] : '#ffffff';
  }
}

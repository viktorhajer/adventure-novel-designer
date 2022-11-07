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
      'pink': '#ffacb6',
      'peach': '#fdc68d',
      'red': '#e27878',
      'cyan': '#50e9e9',
      'blue': '#9fd5ff',
      'dblue': '#4795d1',
      'green': '#dff8ca',
      'dgreen': '#a2e569',
      'yellow': '#fff1a3',
      'gold': '#ffd700',
      'violet': '#e9b1e9',
      'dviolet': '#e46ce4',
      'orange': '#ffa500',
      'gray': '#d5d5d5',
      'dgray': '#787878'
    } as any;
    return colorMap[colorStr] ? colorMap[colorStr] : '#ffffff';
  }
}

export class StationColor {
  constructor(public title: string, public value = '') {
  }
}

export const STATION_COLORS = [
  new StationColor('White', 'white'),
  new StationColor('Gray', 'gray'),
  new StationColor('Dark Gray', 'dgray'),
  new StationColor('Red', 'red'),
  new StationColor('Orange', 'orange'),
  new StationColor('Yellow', 'yellow'),
  new StationColor('Violet', 'violet'),
  new StationColor('Green', 'green'),
  new StationColor('Blue', 'blue')

];

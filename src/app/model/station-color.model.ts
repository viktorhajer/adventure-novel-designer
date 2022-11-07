export class StationColor {
  constructor(public title: string, public value = '') {
  }
}

export const STATION_COLORS = [
  new StationColor('White', 'white'),
  new StationColor('Gray', 'gray'),
  new StationColor('Dark Gray', 'dgray'),
  new StationColor('Red', 'red'),
  new StationColor('Pink', 'pink'),
  new StationColor('Peach', 'peach'),
  new StationColor('Orange', 'orange'),
  new StationColor('Yellow', 'yellow'),
  new StationColor('Gold', 'gold'),
  new StationColor('Violet', 'violet'),
  new StationColor('Dark Violet', 'dviolet'),
  new StationColor('Green', 'green'),
  new StationColor('Dark Green', 'dgreen'),
  new StationColor('Cyan', 'cyan'),
  new StationColor('Blue', 'blue'),
  new StationColor('Dark Blue', 'dblue')
];

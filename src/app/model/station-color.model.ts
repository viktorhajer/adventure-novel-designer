export class StationColor {
  constructor(public title: string, public value = '') {
  }
}

export const STATION_COLORS = [
  new StationColor('White', ''),
  new StationColor('Red', 'red'),
  new StationColor('Blue', 'blue'),
  new StationColor('Green', 'green')
];

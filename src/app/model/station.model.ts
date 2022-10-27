export class Station {
  constructor(public readonly id: number, public sketch: string, public story = '', public exit = false) {
  }
}

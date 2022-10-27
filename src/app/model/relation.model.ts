export class Relation {
  constructor(public readonly sourceID: number, public readonly targetID: number, public readonly comment = '') {
  }
}

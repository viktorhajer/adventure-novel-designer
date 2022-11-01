export class Relation {
  constructor(public sourceId: number, public targetId: number, public comment = '', public condition = false) {
  }
}

export class Station {
  constructor(public id: number, public title = '', public story = '',
              public color = '', public comment = '', public index = 0,
              public starter = false, public life = 0, public winner = false,
              public looser = false, public sceneId = 0, public question = '',
              public questionnaire = false) {
  }
}

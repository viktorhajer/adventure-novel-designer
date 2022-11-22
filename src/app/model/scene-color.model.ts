export class SceneColor {
  constructor(public title: string, public value = '') {
  }
}

export const SCENE_COLORS = [
  new SceneColor('White', 'white'),
  new SceneColor('Gray', 'gray'),
  new SceneColor('Dark Gray', 'dgray'),
  new SceneColor('Red', 'red'),
  new SceneColor('Pink', 'pink'),
  new SceneColor('Peach', 'peach'),
  new SceneColor('Orange', 'orange'),
  new SceneColor('Yellow', 'yellow'),
  new SceneColor('Gold', 'gold'),
  new SceneColor('Violet', 'violet'),
  new SceneColor('Dark Violet', 'dviolet'),
  new SceneColor('Green', 'green'),
  new SceneColor('Dark Green', 'dgreen'),
  new SceneColor('Cyan', 'cyan'),
  new SceneColor('Blue', 'blue'),
  new SceneColor('Dark Blue', 'dblue')
];

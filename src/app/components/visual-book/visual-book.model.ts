export class VisualModel {
  nodes: VisualNode[] = [];
  edges: VisualEdge[] = [];
}

export class VisualEdge {
  sourceId: string = '';
  targetId: string = '';
  comment: string = '';
  condition: boolean = false;
}

export class VisualNode {
  id: string = '';
  title: string = '';
  color: string = '';
  starter: boolean = false;
  winner: boolean = false;
  looser: boolean = false;
  alert: boolean = false;
  warning: boolean = false;
  heart: number = 0;
  skull: number = 0;
  present: boolean = false;
}

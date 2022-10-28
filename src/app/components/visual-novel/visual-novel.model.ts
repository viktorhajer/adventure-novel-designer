export class VisualNovel {
  nodes: VisualNovelNode[] = [];
  edges: VisualNovelEdge[] = [];
}

export class VisualNovelEdge {
  sourceID: string = '';
  targetID: string = '';
  comment: string = '';
}

export class VisualNovelNode {
  id: string = '';
  title: string = '';
  color: string = '';
  starter: boolean = false;
  alert: boolean = false;
  warning: boolean = false;
}

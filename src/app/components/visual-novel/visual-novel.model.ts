export class VisualNovel {
  nodes: VisualNovelNode[] = [];
  edges: VisualNovelEdge[] = [];
}

export class VisualNovelEdge {
  sourceId: string = '';
  targetId: string = '';
  comment: string = '';
  condition: boolean = false;
}

export class VisualNovelNode {
  id: string = '';
  title: string = '';
  color: string = '';
  starter: boolean = false;
  alert: boolean = false;
  warning: boolean = false;
}

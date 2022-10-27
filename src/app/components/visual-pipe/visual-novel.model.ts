export class VisualNovel {
  nodes: VisualNovelNode[] = [];
  edges: VisualNovelEdge[] = [];
}

export class VisualNovelEdge {
  sourceID: string = '';
  targetID: string = '';
}

export class VisualNovelNode {
  id: string = '';
  title: string = '';
}

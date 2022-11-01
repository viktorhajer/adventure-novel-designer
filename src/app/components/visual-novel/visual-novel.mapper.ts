import {VisualNovel, VisualNovelEdge, VisualNovelNode} from './visual-novel.model';
import {Novel} from '../../model/novel.model';
import {Station} from '../../model/station.model';
import {Relation} from '../../model/relation.model';

export const ID_PREFIX = 'node_';

export class VisualNovelMapper {

  static mapNovel(novel: Novel): VisualNovel {
    const nodes = novel && novel.stations ? novel.stations.map(c => VisualNovelMapper.mapStationsToNode(c)) : [];
    if (nodes.length) {
      const allEdges = novel.relations ?
        novel.relations.map(r => VisualNovelMapper.mapRelationToEdge(r)).filter(e => !!e) : [];
      const uniqueEdges = allEdges.filter((edge, index, self) =>
        self.map(e => e.sourceId + e.targetId).indexOf(edge.sourceId + edge.targetId) === index);
      return {nodes, edges: uniqueEdges};
    }
    return {nodes: [], edges: []};
  }

  private static mapStationsToNode(station: Station): VisualNovelNode {
    const node = new VisualNovelNode();
    node.id = ID_PREFIX + station.id;
    node.title = station.title;
    node.color = station.color;
    node.starter = station.starter;
    node.alert = !station.story.trim().length;
    node.warning = !!station.comment.trim().length;
    return node;
  }

  private static mapRelationToEdge(relation: Relation): VisualNovelEdge {
    if (relation.sourceId && relation.targetId) {
      return {sourceId: ID_PREFIX + relation.sourceId, targetId: ID_PREFIX + relation.targetId, comment: relation.comment, condition: false};
    }
    return null as any;
  }
}

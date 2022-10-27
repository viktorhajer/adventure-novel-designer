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
        self.map(e => e.sourceID + e.targetID).indexOf(edge.sourceID + edge.targetID) === index);
      return {nodes, edges: uniqueEdges};
    }
    return {nodes: [], edges: []};
  }

  private static mapStationsToNode(station: Station): VisualNovelNode {
    const node = new VisualNovelNode();
    node.id = ID_PREFIX + station.id;
    node.title = station.title;
    return node;
  }

  private static mapRelationToEdge(relation: Relation): VisualNovelEdge {
    if (relation.sourceID && relation.targetID) {
      return {sourceID: ID_PREFIX + relation.sourceID, targetID: ID_PREFIX + relation.targetID};
    }
    return null as any;
  }
}

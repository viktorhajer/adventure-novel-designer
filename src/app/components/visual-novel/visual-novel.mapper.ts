import {VisualNovel, VisualNovelEdge, VisualNovelNode} from './visual-novel.model';
import {Novel} from '../../model/novel.model';
import {Station} from '../../model/station.model';
import {Relation} from '../../model/relation.model';
import {Injectable} from '@angular/core';
import {NovelService} from '../../services/novel.service';

export const ID_PREFIX = 'node_';

@Injectable({
  providedIn: 'root'
})
export class VisualNovelMapper {

  constructor(private readonly novelService: NovelService) {
  }

  mapNovel(novel: Novel, regionId = 0, color = ''): VisualNovel {
    const nodes = novel && novel.stations ? novel.stations
      .filter(station => regionId === 0 || station.regionId === regionId)
      .filter(station => color === '' || station.color === color)
      .map(station => {
        const hasItems = novel.stationItems.some(si => si.stationId === station.id);
        return this.mapStationsToNode(station, hasItems);
      }) : [];
    if (nodes.length) {
      const ids = novel.stations
        .filter(station => regionId === 0 || station.regionId === regionId)
        .filter(station => color === '' || station.color === color)
        .map(s => s.id);
      const allEdges = novel.relations ? novel.relations
        .filter(r => ids.includes(r.sourceId) && ids.includes(r.targetId))
        .map(r => this.mapRelationToEdge(r)).filter(e => !!e) : [];
      const uniqueEdges = allEdges.filter((edge, index, self) =>
        self.map(e => e.sourceId + e.targetId).indexOf(edge.sourceId + edge.targetId) === index);
      return {nodes, edges: uniqueEdges};
    }
    return {nodes: [], edges: []};
  }

  private mapStationsToNode(station: Station, hasItems: boolean): VisualNovelNode {
    const node = new VisualNovelNode();
    node.id = ID_PREFIX + station.id;
    node.title = station.title;
    node.color = station.color;
    node.starter = station.starter;
    node.winner = station.winner;
    node.looser = station.looser;
    node.alert = !station.story.trim().length;
    node.warning = !!station.comment.trim().length;
    node.heart = this.novelService.model.mortality && station.life > 0 ? Math.abs(station.life) : 0;
    node.skull = this.novelService.model.mortality && station.life < 0 ? Math.abs(station.life) : 0;
    node.present = hasItems;
    return node;
  }

  private mapRelationToEdge(relation: Relation): VisualNovelEdge {
    if (relation.sourceId && relation.targetId) {
      return {
        sourceId: ID_PREFIX + relation.sourceId, targetId: ID_PREFIX + relation.targetId,
        comment: relation.comment, condition: relation.condition
      };
    }
    return null as any;
  }
}

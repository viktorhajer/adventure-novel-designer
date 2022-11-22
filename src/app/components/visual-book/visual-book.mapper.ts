import {Book} from '../../model/book.model';
import {Station} from '../../model/station.model';
import {Relation} from '../../model/relation.model';
import {Injectable} from '@angular/core';
import {BookService} from '../../services/book.service';
import {VisualEdge, VisualModel, VisualNode} from './visual-book.model';

export const ID_PREFIX = 'node_';

@Injectable({
  providedIn: 'root'
})
export class VisualBookMapper {

  constructor(private readonly bookService: BookService) {
  }

  mapModel(book: Book, chapterId = 0, color = ''): VisualModel {
    const nodes = book && book.stations ? book.stations
      .filter(station => chapterId === 0 || station.chapterId === chapterId)
      .filter(station => color === '' || station.color === color)
      .map(station => {
        const hasItems = book.stationItems.some(si => si.stationId === station.id);
        return this.mapStationsToNode(book, station, hasItems);
      }) : [];
    if (nodes.length) {
      const ids = book.stations
        .filter(station => chapterId === 0 || station.chapterId === chapterId)
        .filter(station => color === '' || station.color === color)
        .map(s => s.id);
      const allEdges = book.relations ? book.relations
        .filter(r => ids.includes(r.sourceId) && ids.includes(r.targetId))
        .map(r => this.mapRelationToEdge(r)).filter(e => !!e) : [];
      const uniqueEdges = allEdges.filter((edge, index, self) =>
        self.map(e => e.sourceId + e.targetId).indexOf(edge.sourceId + edge.targetId) === index);
      return {nodes, edges: uniqueEdges};
    }
    return {nodes: [], edges: []};
  }

  private mapStationsToNode(book: Book, station: Station, hasItems: boolean): VisualNode {
    const node = new VisualNode();
    node.id = ID_PREFIX + station.id;
    node.title = station.title;
    if (book.showChapters) {
      const chapter = station.chapterId ? book.chapters.find(c => c.id === station.chapterId) : null as any;
      node.color = chapter ? chapter.color : 'white';
    } else {
      node.color = station.color;
    }
    node.starter = station.starter;
    node.winner = station.winner;
    node.looser = station.looser;
    node.alert = !station.story.trim().length;
    node.warning = !!station.comment.trim().length;
    node.heart = this.bookService.model.mortality && station.life > 0 ? Math.abs(station.life) : 0;
    node.skull = this.bookService.model.mortality && station.life < 0 ? Math.abs(station.life) : 0;
    node.present = hasItems;
    return node;
  }

  private mapRelationToEdge(relation: Relation): VisualEdge {
    if (relation.sourceId && relation.targetId) {
      return {
        sourceId: ID_PREFIX + relation.sourceId, targetId: ID_PREFIX + relation.targetId,
        comment: relation.comment, condition: relation.condition
      };
    }
    return null as any;
  }
}

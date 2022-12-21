import {Book} from '../../model/book.model';
import {Scene} from '../../model/scene.model';
import {Relation} from '../../model/relation.model';
import {Injectable} from '@angular/core';
import {BookService} from '../../services/book.service';
import {VisualEdge, VisualModel, VisualNode} from '../../model/visual-book.model';

export const ID_PREFIX = 'node_';

@Injectable({
  providedIn: 'root'
})
export class VisualBookMapper {

  constructor(private readonly bookService: BookService) {
  }

  mapModel(book: Book, chapterId = 0, color = ''): VisualModel {
    const nodes = book && book.scenes ? book.scenes
      .filter(scene => chapterId === 0 || scene.chapterId === chapterId)
      .filter(scene => color === '' || scene.color === color)
      .map(scene => {
        const hasItems = book.sceneItems.some(si => si.sceneId === scene.id);
        return this.mapSceneToNode(book, scene, hasItems);
      }) : [];
    if (nodes.length) {
      const ids = book.scenes
        .filter(scene => chapterId === 0 || scene.chapterId === chapterId)
        .filter(scene => color === '' || scene.color === color)
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

  private mapSceneToNode(book: Book, scene: Scene, hasItems: boolean): VisualNode {
    const node = new VisualNode();
    node.id = ID_PREFIX + scene.id;
    node.title = scene.title;
    if (book.showChapters) {
      const chapter = scene.chapterId ? book.chapters.find(c => c.id === scene.chapterId) : null as any;
      node.color = chapter ? chapter.color : 'white';
    } else {
      node.color = scene.color;
    }
    node.starter = scene.starter;
    node.winner = scene.winner;
    node.looser = scene.looser;
    node.alert = !scene.story.trim().length;
    node.warning = !!scene.comment.trim().length;
    node.heart = this.bookService.model.mortality && scene.life > 0 ? Math.abs(scene.life) : 0;
    node.skull = this.bookService.model.mortality && scene.life < 0 ? Math.abs(scene.life) : 0;
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

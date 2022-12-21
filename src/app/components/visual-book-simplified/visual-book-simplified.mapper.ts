import {Book} from '../../model/book.model';
import {Scene} from '../../model/scene.model';
import {Relation} from '../../model/relation.model';
import {VisualEdge, VisualModel, VisualNode} from '../../model/visual-book.model';

export const ID_PREFIX = 'node_';

export class VisualBookSimplifiedMapper {

  static mapModel(book: Book): VisualModel {

    if (book && book.scenes) {
      let scenes: Scene[]  = JSON.parse(JSON.stringify(book.scenes));
      let relations: Relation[]  = JSON.parse(JSON.stringify(book.relations));

      const onlyNodes = book.scenes.filter(s => {
        return book.relations.filter(r => r.sourceId === s.id).length === 1;
      });
      scenes.forEach(s => s.life = 1);
      for (const scene of scenes) {
        if (onlyNodes.some(s => s.id === scene.id)) {
          const relation = relations.find(r => r.sourceId === scene.id);
          if (relation) {
            relations.filter(r => r.targetId === scene.id).forEach(r => r.targetId = relation.targetId)
            relations = relations.filter(r => r.sourceId !== scene.id);
            const scene2 = scenes.find(s => s.id === relation.targetId);
            if (scene2) {
              scene.looser = scene.looser || scene2.looser;
              scene.winner = scene.winner || scene2.winner;
              scene2.starter = scene.starter || scene2.starter;
              scene2.life = scene.life + scene2.life;
              scene2.color = scene2.life > 3 ? 'red' : 'green';
            }
            scene.title = '';
          }
        }
      }
      scenes = scenes.filter(s => !!s.title);
      scenes.forEach(s => {
          if (s.life === 1) {
            s.color = '';
          } else {
            s.title = `(${s.life}) ${s.title}`
          }
      });

      const nodes = scenes.map(scene => VisualBookSimplifiedMapper.mapSceneToNode(scene));
      if (nodes.length) {
        const ids = book.scenes.map(s => s.id);
        const allEdges = relations ? relations.filter(r => ids.includes(r.sourceId) && ids.includes(r.targetId))
          .map(r => VisualBookSimplifiedMapper.mapRelationToEdge(r)).filter(e => !!e): [];
        const uniqueEdges = allEdges.filter((edge, index, self) =>
          self.map(e => e.sourceId + e.targetId).indexOf(edge.sourceId + edge.targetId) === index);
        return {nodes, edges: uniqueEdges};
      }
    }
    return {nodes: [], edges: []};
  }

  private static mapSceneToNode(scene: Scene): VisualNode {
    const node = new VisualNode();
    node.id = ID_PREFIX + scene.id;
    node.title = scene.title;
    node.color = scene.color;
    node.starter = scene.starter;
    node.winner = scene.winner;
    node.looser = scene.looser;
    node.alert = false;
    node.warning = false;
    node.heart = 0;
    node.skull = 0;
    node.present = false;
    return node;
  }

  private static mapRelationToEdge(relation: Relation): VisualEdge {
    if (relation.sourceId && relation.targetId) {
      return {
        sourceId: ID_PREFIX + relation.sourceId, targetId: ID_PREFIX + relation.targetId,
        comment: '', condition: false
      };
    }
    return null as any;
  }
}

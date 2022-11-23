import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {Scene} from '../model/scene.model';
import {Item} from '../model/item.model';
import {SceneItem} from '../model/scene-item.model';
import {BookCorrectorService} from './book-corrector.service';
import {DialogService} from './dialog.service';
import {GrammerService} from './grammer.service';

const NUMBER_OF_MAX_GENERATION = 100000;

@Injectable({
  providedIn: 'root'
})
export class BookService {
  loaded = false;
  model: Book;
  maxSceneID = 1;

  constructor(private readonly dialogService: DialogService,
              private readonly corrector: BookCorrectorService) {
    this.model = new Book();
  }

  clearModel() {
    this.model = new Book();
    this.loaded = false;
  }

  loadModel(content: string) {
    try {
      this.model = JSON.parse(content);
      this.corrector.fixModel(this.model);
      this.loaded = true;
      this.setMaxSceneID();
    } catch (e) {
      this.dialogService.openError('Failed to load the model due syntax error.');
    }
  }

  getScene(id: number): Scene {
    const scene = this.model.scenes.find(s => s.id === id);
    return !!scene ? scene : null as any;
  }

  getScenes(exceptId: number): Scene[] {
    let filtered = this.model.scenes.filter(s => s.id !== exceptId);
    const children = this.model.relations.filter(r => r.sourceId === exceptId).map(r => r.targetId);
    return filtered.filter(s => !children.includes(s.id));
  }

  getNumberOfBranches() {
    const counts: any[] = [];
    this.model.scenes.forEach(s => counts.push({id: s.id, count: this.model.relations.filter(r => r.sourceId === s.id).length}));
    return counts.filter(c => c.count > 1).length;
  }

  getNumberOfWinners() {
    return this.model.scenes.filter(s => s.winner).length;
  }

  getNumberOfLooser() {
    return this.model.scenes.filter(s => s.looser).length;
  }

  getItem(id: number): Item {
    return this.model.items.find(i => i.id === id) as any;
  }

  getItems(exceptId: number): Item[] {
    const expectItems = this.model.sceneItems.filter(si => si.sceneId === exceptId).map(si => si.itemId);
    return this.model.items.filter(item => !expectItems.includes(item.id));
  }

  getSceneItems(sceneId: number): { item: Item, sceneItem: SceneItem }[] {
    const sceneItems = this.model.sceneItems.filter(si => si.sceneId === sceneId);
    return sceneItems.map(si => {
      const item = this.model.items.find(item => item.id === si.itemId) as any;
      return {item, sceneItem: si};
    });
  }

  createScene(scene: Scene, parentId?: number, comment = '') {
    scene.id = ++this.maxSceneID;
    this.model.scenes.push(scene);
    if (!!parentId && !this.getScene(parentId).winner && !this.getScene(parentId).looser) {
      this.model.relations.push({
        sourceId: parentId,
        targetId: scene.id,
        comment,
        condition: false
      });
    }
  }

  updateScene(scene: Scene) {
    const originScene = this.model.scenes.find(s => s.id === scene.id);
    if (originScene) {
      originScene.title = scene.title;
      originScene.story = scene.story;
      originScene.comment = scene.comment;
      originScene.question = scene.question;
      originScene.chapterId = scene.chapterId;
      originScene.color = scene.color;
      originScene.starter = scene.starter;
      originScene.winner = scene.winner;
      originScene.looser = scene.looser;
      originScene.life = scene.life;
      if (scene.winner || scene.looser) {
        this.model.relations = this.model.relations.filter(r => r.sourceId !== scene.id);
      }
      if (this.model.questionnaire) {
        originScene.questionnaire = scene.questionnaire;
      }
      if (scene.starter) {
        this.model.scenes.filter(s => s.id !== scene.id).forEach(s => s.starter = false);
      }
    }
  }

  deleteScene(id: number) {
    this.model.scenes = this.model.scenes.filter(s => s.id !== id);
    this.model.relations = this.model.relations.filter(r => r.sourceId !== id && r.targetId !== id);
    this.model.sceneItems = this.model.sceneItems.filter(si => si.sceneId !== id);
  }

  createRelation(sourceId: number, targetId: number, comment = '', condition = false) {
    this.model.relations.push({sourceId, targetId, comment, condition});
  }

  deleteRelation(sourceId: number, targetId: number) {
    this.model.relations = this.model.relations.filter(r => !(r.sourceId === sourceId && r.targetId === targetId));
  }

  createItem(name: string) {
    const id = this.getNewId(this.model.items);
    this.model.items.push({id, name, description: ''});
  }

  deleteItem(id: number) {
    this.model.items = this.model.items.filter(i => i.id !== id);
    this.model.sceneItems = this.model.sceneItems.filter(si => si.itemId !== id);
  }

  setItem(sceneId: number, itemId: number, count: number) {
    this.model.sceneItems.push({sceneId, itemId, count});
  }

  deleteSceneItem(sceneId: number, itemId: number) {
    this.model.sceneItems = this.model.sceneItems.filter(si => !(si.sceneId === sceneId && si.itemId === itemId));
  }

  getChildren(id: number): Scene[] {
    return this.model.relations.filter(r => r.sourceId === id).map(r => this.model.scenes.find(s => s.id === r.targetId) as any);
  }

  createChapter(name: string) {
    const id = this.getNewId(this.model.chapters);
    this.model.chapters.push({id, name, color: '#ffffff', description: ''});
  }

  deleteChapter(id: number) {
    this.model.chapters = this.model.chapters.filter(i => i.id !== id);
    this.model.scenes.filter(s => s.chapterId === id).forEach(s => s.chapterId = 0);
  }

  createCharacter(name: string) {
    const id = this.getNewId(this.model.characters);
    this.model.characters.push({id, name, description: ''});
  }

  deleteCharacter(id: number) {
    this.model.characters = this.model.characters.filter(i => i.id !== id);
  }

  finalize(regenerate = false): Promise<any[]> {
    if (this.isValidBook()) {
      let generation = 0;
      const hasIndex = !this.model.scenes.some(s => s.index === 0);
      let hasIndexError = false;
      if (!hasIndex || regenerate) {
        do {
          generation++;
          this.generateIndexes();
          if (generation > NUMBER_OF_MAX_GENERATION) {
            hasIndexError = true;
            break;
          }
        } while (!this.validateIndexes());
      }
      const scenes = this.sortAndReplaceMacros();
      if (hasIndexError) {
        this.dialogService.openError(`Number of index generations has reached the maximum (${NUMBER_OF_MAX_GENERATION}). ` +
          'Please try it again, or consider turning off the index validation.');
      }
      return Promise.resolve([scenes, generation]);
    }
    return Promise.resolve([[], 0]);
  }

  validateMacros() {
    const messages = [];
    for (const s of this.model.scenes) {
      const childrenNumber = this.model.relations.filter(r => r.sourceId === s.id).length;
      for (let i = 1; i < (childrenNumber + 1); i++) {
        if (s.story.indexOf('##' + i) === -1) {
          messages.push(s.title + ': ##' + i);
        }
      }
    }
    if (messages.length) {
      this.dialogService.openWarning('Unused macro(s): ' + messages.join(', '));
    }
  }

  private sortAndReplaceMacros(): Scene[] {
    const scenes = (JSON.parse(JSON.stringify(this.model.scenes)) as Scene[])
      .sort((s1, s2) => s1.index > s2.index ? 1 : -1);
    scenes.forEach(s => {
      let i = 1;
      this.getChildren(s.id).forEach(c => {
        s.story = s.story
          .replace(`[##${i}]`, GrammerService.getArticle(c.index) + this.addAnchor(c.index, c.index + GrammerService.getAffix(c.index)))
          .replace(`(##${i})`, GrammerService.getArticle(c.index) + this.addAnchor(c.index, c.index + GrammerService.getAffix2(c.index)))
          .replace(`##${i}`, GrammerService.getArticle(c.index) + this.addAnchor(c.index, c.index + ''));
        i++;
      });
    });
    return scenes;
  }

  private isValidBook() {
    let message = '';

    // No scene
    if (this.model.scenes.length === 0) {
      message = 'Please create at least one scene.';
    }

    // One starter
    if (!message) {
      const starters = this.model.scenes.filter(s => s.starter);
      if (starters.length !== 1) {
        if (starters.length === 0) {
          message = 'Missing first scene.';
        } else {
          message = 'More than one first scenes: ' + starters.map(s => s.title).join(', ') + '.';
        }
      }
    }

    // Shadow starter
    if (!message) {
      const targetIds = this.model.relations.map(r => r.targetId);
      const abandonedStarters = this.model.scenes.filter(s => !s.starter && !targetIds.includes(s.id));
      if (abandonedStarters.length) {
        message = 'Abandoned scenes (where there is no route and not first scene): '
          + abandonedStarters.map(s => s.title).join(', ');
      }
    }
    if (message) {
      this.dialogService.openError(message);
    }
    return !message.length;
  }

  private addAnchor(index: number, indexStr: string): string {
    return `<span class="anchor ${index}">${indexStr}</span>`;
  }

  private generateIndexes() {
    let index = 0;
    let scenes = [...this.model.scenes];
    const starter = scenes.find(s => s.starter);
    if (starter) {
      index++;
      starter.index = index + this.model.numberingOffset;
      scenes = scenes.filter(s => s.id !== starter.id);
    }
    while (scenes.length) {
      index++;
      const id = scenes[Math.floor(Math.random() * scenes.length)].id;
      this.getScene(id).index = index + this.model.numberingOffset;
      scenes = scenes.filter(s => s.id !== id);
    }
  }

  private validateIndexes(): boolean {
    let wrongPCIndex = 0;
    let wrongSSIndex = 0;
    if (this.model.scenes.length > 10 && (this.model.validationPC || this.model.validationSS)) {
      const nums: number[] = [];
      this.model.scenes.forEach(s => nums[s.id] = s.index);

      // check parent-child distance
      if (this.model.validationPC) {
        for (const r of this.model.relations) {
          if (Math.abs(nums[r.sourceId] - nums[r.targetId]) < this.model.validationPCD) {
            wrongPCIndex++;
          }
        }
      }

      // check siblings distance
      if (this.model.validationSS) {
        this.model.scenes.forEach(scene => {
          const rs = this.model.relations.filter(r => r.sourceId === scene.id)
            .map(r => nums[r.targetId]).sort((n1, n2) => n1 - n2);
          if (rs.length > 1) {
            for (let i = 1; i < rs.length; i++) {
              if (Math.abs(rs[i - 1] - rs[i]) < this.model.validationSSD) {
                wrongSSIndex++;
              }
            }
          }
        });
      }

      // DEBUG
      /*if (wrongPCIndex > 0 || wrongSSIndex > 0) {
        console.log('-------------');
        console.log(' Number of wrong parent-child index: ' + wrongPCIndex);
        console.log(' Number of wrong siblings index: ' + wrongSSIndex);
      } else {
        console.log('-------------');
        console.log(' No wrong index.');
      }*/
    }
    return wrongPCIndex === 0 && wrongSSIndex === 0;
  }

  private setMaxSceneID() {
    let max = 0;
    this.model.scenes.forEach(s => {
      max = s.id > max ? s.id : max;
    });
    this.maxSceneID = max;
  }

  private getNewId(list: { id: number }[]): number {
    let max = 0;
    list.forEach(entity => {
      max = entity.id > max ? entity.id : max;
    });
    return max + 1;
  }
}

import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {SCENE_COLORS} from '../model/scene-color.model';
import {Scene} from '../model/scene.model';

@Injectable({
  providedIn: 'root'
})
export class BookCorrectorService {

  fixModel(model: Book) {
    const colors = SCENE_COLORS.map(c => c.value);
    const scenesIds = model.scenes.map(s => s.id);
    const chapterIds = model.chapters.map(r => r.id);
    const itemIds = model.items.map(i => i.id);

    // fix settings
    model.title = !!model.title && !!model.title.trim() ? model.title.trim() : ('Book_' + Date.now());
    model.mortality = !!model.mortality;
    model.showChapters = !!model.showChapters;

    // fix scenes
    model.scenes.forEach(scene => {
      scene.title = !!scene.title && !!scene.title.trim() ? scene.title.trim() : ('Scene_' + Date.now());
      scene.index = !!scene.index ? scene.index : 0;
      scene.life = !!scene.life ? scene.life : 0;
      scene.starter = !!scene.starter;
      scene.looser = !!scene.starter;
      scene.winner = !!scene.starter;
      this.fixSceneColors(colors, scene);
      this.fixStarterWinnerLooser(scene);
      this.fixChapters(chapterIds, scene);
    });

    // fix relations
    model.relations = model.relations.filter(r => scenesIds.includes(r.sourceId) && scenesIds.includes(r.targetId));
    model.relations.forEach(r => r.condition = !!r.condition);

    // fix chapters
    model.chapters.forEach(chapter => {
      chapter.name = !!chapter.name && !!chapter.name.trim() ? chapter.name.trim() : ('Chapter_' + Date.now());
      chapter.color = !!chapter.color && colors.includes(chapter.color.trim()) ? chapter.color.trim() : 'white';
    });

    // fix items
    model.items.forEach(item => item.name = !!item.name && !!item.name.trim() ? item.name.trim() : ('Item_' + Date.now()));

    // fix scene items
    model.sceneItems = model.sceneItems.filter(si => scenesIds.includes(si.sceneId) && itemIds.includes(si.itemId));
    model.sceneItems.forEach(si => si.count = isNaN(+si.count) || +si.count === 0 ? 1 : +si.count);

    // fix characters
    model.characters.forEach(c => c.name = !!c.name && !!c.name.trim() ? c.name.trim() : ('Character_' + Date.now()));

    // fix: only one starter
    if (model.scenes.filter(s => s.starter).length > 1) {
      const first = model.scenes.find(s => s.starter);
      model.scenes.forEach(s => s.starter = false);
      if (first) {
        first.starter = true;
      }
    }
  }

  private fixChapters(chapterIds: number[], scene: Scene) {
    scene.chapterId = !!scene.chapterId && chapterIds.includes(scene.chapterId) ? scene.chapterId : 0;
  }

  private fixSceneColors(colors: string[], scene: Scene) {
    scene.color = !!scene.color && colors.includes(scene.color.trim()) ? scene.color.trim() : 'white';
  }

  private fixStarterWinnerLooser(scene: Scene) {
    if (scene.starter) {
      scene.winner = false;
      scene.looser = false;
    } else if (scene.winner) {
      scene.starter = false;
      scene.looser = false;
    } else if (scene.looser) {
      scene.starter = false;
      scene.winner = false;
    }
  }
}

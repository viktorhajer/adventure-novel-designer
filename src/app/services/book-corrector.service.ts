import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {STATION_COLORS} from '../model/station-color.model';
import {Station} from '../model/station.model';

@Injectable({
  providedIn: 'root'
})
export class BookCorrectorService {

  fixModel(model: Book) {
    const colors = STATION_COLORS.map(c => c.value);
    const stationIds = model.stations.map(s => s.id);
    const sceneIds = model.scenes.map(r => r.id);
    const itemIds = model.items.map(i => i.id);

    // fix settings
    model.title = !!model.title && !!model.title.trim() ? model.title.trim() : ('Book_' + Date.now());
    model.mortality = !!model.mortality;
    model.showScenes = !!model.showScenes;

    // fix stations
    model.stations.forEach(station => {
      station.title = !!station.title && !!station.title.trim() ? station.title.trim() : ('Station_' + Date.now());
      station.index = !!station.index ? station.index : 0;
      station.life = !!station.life ? station.life : 0;
      station.starter = !!station.starter;
      station.looser = !!station.starter;
      station.winner = !!station.starter;
      this.fixStationColors(colors, station);
      this.fixStarterWinnerLooser(station);
      this.fixScenes(sceneIds, station);
    });

    // fix relations
    model.relations = model.relations.filter(r => stationIds.includes(r.sourceId) && stationIds.includes(r.targetId));
    model.relations.forEach(r => r.condition = !!r.condition);

    // fix scenes
    model.scenes.forEach(scene => {
      scene.name = !!scene.name && !!scene.name.trim() ? scene.name.trim() : ('Scene_' + Date.now());
      scene.color = !!scene.color && colors.includes(scene.color.trim()) ? scene.color.trim() : 'white';
    });

    // fix items
    model.items.forEach(item => item.name = !!item.name && !!item.name.trim() ? item.name.trim() : ('Item_' + Date.now()));

    // fix station items
    model.stationItems = model.stationItems.filter(si => stationIds.includes(si.stationId) && itemIds.includes(si.itemId));
    model.stationItems.forEach(si => si.count = isNaN(+si.count) || +si.count === 0 ? 1 : +si.count);

    // fix characters
    model.characters.forEach(c => c.name = !!c.name && !!c.name.trim() ? c.name.trim() : ('Character_' + Date.now()));

    // fix: only one starter
    if (model.stations.filter(s => s.starter).length > 1) {
      const first = model.stations.find(s => s.starter);
      model.stations.forEach(s => s.starter = false);
      if (first) {
        first.starter = true;
      }
    }
  }

  private fixScenes(sceneIds: number[], station: Station) {
    station.sceneId = !!station.sceneId && sceneIds.includes(station.sceneId) ? station.sceneId : 0;
  }

  private fixStationColors(colors: string[], station: Station) {
    station.color = !!station.color && colors.includes(station.color.trim()) ? station.color.trim() : 'white';
  }

  private fixStarterWinnerLooser(station: Station) {
    if (station.starter) {
      station.winner = false;
      station.looser = false;
    } else if (station.winner) {
      station.starter = false;
      station.looser = false;
    } else if (station.looser) {
      station.starter = false;
      station.winner = false;
    }
  }
}

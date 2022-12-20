import {Injectable} from '@angular/core';
import {BookService} from './book.service';
import {DialogService} from './dialog.service';
import {Scene} from '../model/scene.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationCycleService {

  cycles: Scene[][] = [];

  constructor(private readonly bookService: BookService,
              private readonly dialogService: DialogService) {
  }

  isCyclic(): boolean {
    const start = this.bookService.model.scenes.find(s => s.starter);
    this.cycles = [];
    if (!start) {
      this.dialogService.openError('Please select first scene.');
    } else {

      const visited = {} as any;
      const recStack = {} as any;

      this.bookService.model.scenes.forEach(scene => {
        visited[scene.id] = false;
        recStack[scene.id] = false;
      });

      for (const scene of this.bookService.model.scenes) {
        this.isCyclicScene(scene, visited, recStack, [scene]);
      }
    }
    return !!this.cycles.length;
  }

  private isCyclicScene(scene: Scene, visited: boolean[], recStack: boolean[], route: Scene[]): Scene[] {

    if (recStack[scene.id]) {
      const index = route.findIndex(scene => scene.id === route[route.length - 1].id);
      return route.slice(index, route.length - 1);
    }

    if (visited[scene.id]) {
      return [];
    }

    visited[scene.id] = true;
    recStack[scene.id] = true;
    const children = this.bookService.getChildren(scene.id);

    for (const child of children) {
      const subRoute = this.isCyclicScene(child, visited, recStack, [...route, child]);
      if (subRoute.length) {
        this.cycles.push(subRoute);
      }
    }
    recStack[scene.id] = false;
    return [];
  }
}

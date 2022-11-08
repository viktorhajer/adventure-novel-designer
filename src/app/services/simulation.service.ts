import {Injectable} from '@angular/core';
import {BookService} from './book.service';
import {Relation} from '../model/relation.model';
import {StationItem} from '../model/simulation.model';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';

export const INFINITY = 9999999;

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  constructor(private readonly bookService: BookService,
              private readonly dialog: MatDialog) {
  }

  start(endId: number): StationItem {
    const start = this.bookService.model.stations.find(s => s.starter);
    if (!start) {
      this.dialog.open(ErrorDialogComponent, {
        width: '300px',
        panelClass: 'full-modal',
        data: {message: 'Please select first station.'}
      }).afterClosed();
    } else {
      const rawPath = this.findShortestPath(this.bookService.model.relations, start.id, endId);
      return {
        distance: rawPath.distance,
        path: rawPath.path.map(id => this.bookService.getStation(id))
      }
    }
    return null as any;
  }

  private findShortestPath(relations: Relation[], startId: number, endId: number): RawSimulation {
    // setup start node
    const distances: Distance[] = [];
    distances.push({id: endId, distance: INFINITY});
    distances.push(...relations.filter(r => r.sourceId === startId).map(r => ({id: r.targetId, distance: 1})));

    // track paths
    const parents: Parent[] = [];
    parents.push({id: endId, parentId: 0});
    relations.filter(r => r.sourceId === startId).forEach(r => parents.push({id: r.targetId, parentId: startId}));

    // track nodes that have already been visited
    const visited: number[] = [];

    // find the nearest node
    let node = this.shortestDistanceNode(distances, visited);
    while (node) {
      // find its distance from the start node & its child nodes
      const distance = distances.find(d => d.id === node.id);
      const childrenIds = relations.filter(r => r.sourceId === node.id).map(r => r.targetId);

      // for each of those child nodes
      for (let childId of childrenIds) {

        // make sure each child node is not the start node
        if (childId === startId) {
          continue;
        } else {
          // save the distance from the start node to the child node
          let newDistance = (distance?.distance || 0) + 1;
          if (!distances.find(d => d.id === childId) || (distances.find(d => d.id === childId)?.distance || INFINITY) > newDistance) {
            const dist = distances.find(d => d.id === childId);
            if (dist) {
              dist.distance = newDistance;
            } else {
              distances.push({id: childId, distance: newDistance});
            }
            const parent = parents.find(d => d.id === childId);
            if (parent) {
              parent.parentId = node.id;
            } else {
              parents.push({id: childId, parentId: node.id});
            }
          }
        }
      }
      // move the node to the visited set
      visited.push(node.id);
      // move to the nearest neighbor node
      node = this.shortestDistanceNode(distances, visited);
    }

    // using the stored paths from start node to end node
    // record the shortest path
    const shortestPath = [endId];
    let parent = parents.find(p => p.id === endId);
    while (parent) {
      shortestPath.push(parent.parentId);
      parent = parents.find(p => p.id === parent?.parentId);
    }
    shortestPath.reverse();

    return {
      distance: distances.find(d => d.id === endId)?.distance || 0,
      path: shortestPath
    };
  }

  private shortestDistanceNode(distances: Distance[], visitedIDs: number[]) {
    let shortest: Distance = null as any;
    for (let node of distances) {
      let currentIsShortest =
        !shortest || node.distance < shortest.distance;
      if (currentIsShortest && !visitedIDs.includes(node.id)) {
        shortest = node;
      }
    }
    return shortest;
  }
}

class Distance {
  id: number = 0;
  distance: number = 0;
}

class Parent {
  id: number = 0;
  parentId: number = 0;
}

class RawSimulation {
  path: number[] = [];
  distance: number = 0;
}

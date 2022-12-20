import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {Simulation} from '../../model/simulation.model';
import {Scene} from '../../model/scene.model';
import {INFINITY, SimulationShortestWayService} from '../../services/simulation-shortest-way.service';
import {SimulationCycleService} from '../../services/simulation-cycle.service';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit {

  error = '';
  simulation: Simulation = null as any;
  destinations: Scene[] = [];
  destinationLife: number[] = [];
  selectedDestinationId = 0;
  cycles: Scene[][] = [];

  constructor(private readonly dialogRef: MatDialogRef<SimulationComponent>,
              private readonly bookService: BookService,
              private readonly cycleService: SimulationCycleService,
              private readonly shortestWayService: SimulationShortestWayService) {
  }

  ngOnInit() {
    this.destinations = this.bookService.model.scenes.filter(s => s.winner);
    if (this.destinations.length) {
      this.selectedDestinationId = this.destinations[0].id;
    }
  }

  start() {
    this.checkCycles();
    if (!!this.selectedDestinationId) {
      this.simulation = this.shortestWayService.start(this.selectedDestinationId);
      if (this.simulation.distance === INFINITY) {
        this.simulation = null as any;
        this.error = 'No route found between the two scenes.';
        return;
      }

      if (this.bookService.model.mortality) {
        let index = 0;
        for (const scene of this.simulation.path) {
          this.destinationLife[index] = index === 0 ? scene.life : this.destinationLife[index - 1] + scene.life;
          index++;
        }
      }
    }
  }

  checkCycles() {
    if (!this.cycles.length) {
      this.cycles = [];
      if (this.cycleService.isCyclic()) {
        this.cycles = this.cycleService.cycles;
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}

import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BookService} from '../../services/book.service';
import {INFINITY, SimulationService} from '../../services/simulation.service';
import {Simulation} from '../../model/simulation.model';
import {Scene} from '../../model/scene.model';

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

  constructor(private readonly dialogRef: MatDialogRef<SimulationComponent>,
              private readonly bookService: BookService,
              private readonly simulationService: SimulationService) {
  }

  ngOnInit() {
    this.destinations = this.bookService.model.scenes.filter(s => s.winner);
    if (this.destinations.length) {
      this.selectedDestinationId = this.destinations[0].id;
    }
  }

  start() {
    if (!!this.selectedDestinationId) {
      this.simulation = this.simulationService.start(this.selectedDestinationId);
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

  clear() {
    this.simulation = null as any;
    this.error = '';
  }

  close() {
    this.dialogRef.close();
  }
}

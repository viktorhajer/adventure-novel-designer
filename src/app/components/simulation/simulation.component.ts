import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NovelService} from '../../services/novel.service';
import {INFINITY, SimulationService} from '../../services/simulation.service';
import {StationItem} from '../../model/simulation.model';
import {Station} from '../../model/station.model';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit {

  error = '';
  simulation: StationItem = null as any;
  destinations: Station[] = [];
  destinationLife: number[] = [];
  selectedDestinationId = 0;

  constructor(private readonly dialogRef: MatDialogRef<SimulationComponent>,
              private readonly novelService: NovelService,
              private readonly simulationService: SimulationService) {
  }

  ngOnInit() {
    this.destinations = this.novelService.model.stations.filter(s => s.winner);
    if (this.destinations.length) {
      this.selectedDestinationId = this.destinations[0].id;
    }
  }

  start() {
    if (!!this.selectedDestinationId) {
      this.simulation = this.simulationService.start(this.selectedDestinationId);
      if (this.simulation.distance === INFINITY) {
        this.simulation = null as any;
        this.error = 'No route found between the two stations.'
      } else if (this.novelService.model.mortality) {
        let index = 0;
        for (const station of this.simulation.path) {
          this.destinationLife[index] = index === 0 ? station.life : this.destinationLife[index - 1] + station.life;
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

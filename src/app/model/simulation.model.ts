import {Scene} from './scene.model';

export class Simulation {
  path: SimulationScene[] = [];
  distance = 0;
  totalChoices = 0;
}

export class SimulationScene extends Scene {
  choices: number = 1;
}

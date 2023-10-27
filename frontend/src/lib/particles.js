import { Particle, SimulationMagnitude } from './main'

export const ELECTRON = new Particle(
    new SimulationMagnitude(-1.60217663e-19, 'Charge', 'C'),
    new SimulationMagnitude(9.1093837e-31, "Mass", "Kg")
)

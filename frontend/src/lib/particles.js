import { Particle, SimulationMagnitude } from './main'

const E = -1.60217663e-19

export const ELECTRON = new Particle(
    new SimulationMagnitude(E, 'Charge', 'C'),
    new SimulationMagnitude(9.1093837e-31, 'Mass', 'Kg')
)

export const PROTON = new Particle(
    new SimulationMagnitude(-E, 'Charge', 'C'),
    new SimulationMagnitude(1.6726e-27, 'Mass', 'Kg')
)

export const ALFA = new Particle(
    new SimulationMagnitude(-2 * E, 'Charge', 'C'),
    new SimulationMagnitude(6.64216e-27, 'Mass', 'Kg')
)

export const MUON = new Particle(
    new SimulationMagnitude(E, 'Charge', 'C'),
    new SimulationMagnitude(1.6942422e-25, 'Mass', 'Kg')
)

export const TAUON = new Particle(
    new SimulationMagnitude(E, 'Charge', 'C'),
    new SimulationMagnitude(3.18026887e10 - 27, 'Mass', 'Kg')
)

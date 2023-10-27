export class Axis {
    /**
     * Constructs an axis
     * @param {Number} min minimmum of this axis
     * @param {Number} max maximum of this axis
     */
    constructor(min, max) {
        this.min = min
        this.max = max
    }
}

export class Particle {
    /**
     * Represents a particle to be launched.
     *
     * @param {SimulationMagnitude} charge The charge of the particle
     * @param {SimulationMagnitude} mass The mass of the particle
     */
    constructor(charge, mass) {
        this.charge = charge
        this.mass = mass
    }
}

export class SimulationInput {
    /**
     * Represents the user most likely input of the simulation.
     *
     * Unites a particle and it's velocity in one single class.
     * @param {Particle} particle
     * @param {SimulationMagnitude} initialVelocity The initial velocity of the particle
     */
    constructor(particle, initialVelocity) {
        this.particle = particle
        this.initialVelocity = initialVelocity
    }
}

export class SimulationContext {
    /**
     * Constructs a simulation context for the given data.
     *
     * This class is used to save data of the fields.
     * @param {Axis} axis x-Axis data
     * @param {Object} figure Data of the figure to simulate
     * @param {SimulationInput} input The input of the simulation
     */
    constructor(axis, figure, input) {
        this.axis = axis
        this.figure = figure
        this.input = input
    }
}

export class SimulationMagnitude {
    /**
     * Constructs a magnitude to be used inside a simulation context.
     *
     * This class can be used to represent a value that the user needs to input.
     * @param {Number} value The value of this magnitude
     * @param {String} name The name of this magnitude
     * @param {String} unit The unit of this magnitude
     */
    constructor(value, name, unit) {
        this.value = value
        this.name = name
        this.unit = unit
    }
}

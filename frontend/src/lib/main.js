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

    // get min() {
    //     return this.min
    // }
    // get max() {
    //     return this.max
    // }

    // set min(m) {
    //     this.min = m
    // }
    // set max(m) {
    //     this.max = m
    // }
}

export class SimulationContext {
    /**
     * Constructs a simulation context for the given data.
     *
     * This class is used to save data of the fields.
     * @param {Axis} axis x-Axis data
     * @param {Object} figure Data of the figure to simulate
     * @param {Number[]} points Array of starting points that have been simulated
     */
    constructor(axis, figure, points) {
        this.axis = axis
        this.figure = figure
        this.points = points
    }

    // get axis() {
    //     return this.axis
    // }
    // get figure() {
    //     return this.figure
    // }
    // get points() {
    //     return this.points
    // }

    // set axis(a) {
    //     return (this.axis = a)
    // }
    // set figure(f) {
    //     return (this.figure = f)
    // }
    // set points(p) {
    //     return (this.points = p)
    // }
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

    // get value() {
    //     return this.value
    // }
    // get name() {
    //     return this.name
    // }
    // get unit() {
    //     return this.unit
    // }

    // set value(v) {
    //     return (this.value = v)
    // }
    // set name(n) {
    //     return (this.name = n)
    // }
    // set unit(u) {
    //     return (this.unit = u)
    // }
}

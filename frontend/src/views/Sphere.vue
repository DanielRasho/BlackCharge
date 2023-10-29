<template>
    <main>
        <div id="canvas" class="canvas"></div>
        <fieldsContainer
            :fields="fields"
            @changesSubmited="updateFields($event)"
            @startSimulation="startSimulation($event)"
        >
            <p>
                NOTE: The sphere drawing is only scaled according to the X-Axis.
                The particle will go up according to the Y-Axis scale.
            </p>
            <p>
                The simulation IS NOT running in real time. 1s in the simulation
                is not 1s in real life. You can open the console to see the real
                data.
            </p>
        </fieldsContainer>
    </main>
</template>

<script setup>
import fieldsContainer from '@/components/organism/fieldsContainer.vue'
import { onMounted, ref, toRaw } from 'vue'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'
import { initializePlane } from '../lib/plane.js'
import {
    SimulationMagnitude,
    SimulationContext,
    Axis,
    EPSILON_0,
    floatEquals,
    SimulationInput,
    Particle,
    LIGHT_SPEED
} from '../lib/main'
import { ELECTRON } from '../lib/particles'

let two = new Two()
const rows = 11
const columns = 25
const testingInitialVelocity = 1

let metersToPixels_X_Converter = 1
let metersToPixels_Y_Converter = 1

/**
 * Computes the position of the origin with the given sphere radius.
 * @param {Number} radiusInPixels
 */
const getOriginPos = (radiusInPixels) =>
    new Two.Vector(two.width / 2, two.height - radiusInPixels)

/**
 * Computes the radius of the sphere in Pixels.
 * @param {SimulationContext} context
 */
const getRadiusInPixels = (context) =>
    context.figure.radius.value * metersToPixels_X_Converter

class SphereData {
    /**
     * Constructs an object that holds all the data related to the sphere.
     *
     * @param {SimulationMagnitude} radius The radius of the sphere
     * @param {SimulationMagnitude} charge The charge of the sphere
     */
    constructor(radius, charge) {
        this.radius = radius
        this.charge = charge
    }
}

onMounted(async () => {
    let elem = document.querySelector('#canvas')
    two = new Two({
        fullscreen: false,
        width: elem.offsetWidth,
        height: elem.offsetHeight
    }).appendTo(elem)

    drawCanvas(fields.value)
})

let data = new SphereData(
    new SimulationMagnitude(4e-3, 'Radius', 'm'),
    new SimulationMagnitude(1e-26, 'Charge', 'C')
)
let x_axis = new Axis(-2e-2, 2e-2)
let y_axis = new Axis(-2, 2)

let fields = ref(
    new SimulationContext(
        x_axis,
        y_axis,
        data,
        new SimulationInput(
            ELECTRON,
            new SimulationMagnitude(1, 'Velocity', 'm/s')
        )
    )
)

const updateFields = (newValue) => {
    fields.value = newValue
    two.clear()
    drawCanvas(toRaw(newValue))
}

/**
 *
 * @param {SimulationInput} simInput
 */
const startSimulation = (simInput) => {
    two.clear()
    drawCanvas(toRaw(fields.value))

    const context = toRaw(fields.value)
    const radius = getRadiusInPixels(context)
    const originPos = getOriginPos(radius)
    const angle = HALF_PI
    const initialPosition = new Two.Vector(
        originPos.x + radius * Math.cos(angle),
        originPos.y - radius * Math.sin(angle)
    )

    const escapeVelocity = computeEscapeVelocity(
        context.figure,
        simInput.particle
    )
    const isBlackHole = escapeVelocity >= LIGHT_SPEED
    const maxHeight = isBlackHole
        ? Infinity
        : computeHeight(
              simInput.initialVelocity.value,
              computeAcceleration(context.figure, simInput.particle)
          )

    const escapeVelocityDisplay = `Escape Velocity: ${escapeVelocity} m/s.`
    two.makeText(escapeVelocityDisplay, 10, 10, {
        alignment: 'left',
        fill: 'green'
    })

    const maxHeightDisplay = `Maximum Height: ${maxHeight} ${ isBlackHole ? "" : "m"}`
    two.makeText(maxHeightDisplay, 10, 23, {
        alignment: 'left',
        fill: 'green'
    })

    two.makeText(
        isBlackHole ? 'ITS AN ELECTROSTATIC BLACK HOLE!' : '',
        10,
        36,
        {
            alignment: 'left',
            fill: 'green'
        }
    )

    if (!isBlackHole) {
        const dinamicHeightDisplayPosition = new Two.Vector(initialPosition.x + 20, initialPosition.y - maxHeight * metersToPixels_Y_Converter)
        two.makeText(`${maxHeight} m`, dinamicHeightDisplayPosition.x, dinamicHeightDisplayPosition.y, {
            alignment: 'left',
            fill: 'orange'
        })
        const line = two.makeLine(initialPosition.x, initialPosition.y, initialPosition.x, dinamicHeightDisplayPosition.y)
        line.fill = line.stroke = 'orange'
        line.linewidth = 5
        line.dashes = [6,5]
    }

    console.log('Starting simulation...')
    console.dir(context)

    let point = two.makeCircle(initialPosition.x, initialPosition.y, 5)
    point.fill = '#CF9FFF'
    two.update() // For debuggin purposes...

    two.bind(
        'update',
        constructSimulationTick(
            simInput,
            context,
            point,
            angle,
            initialPosition
        )
    )
    two.play()
}

/**
 * Computes the maximum height a body will reach given the initial speed of the body and acceleration it experiments.
 * @param {Number} initialSpeed
 * @param {Number} acceleration
 */
const computeHeight = (initialSpeed, acceleration) => {
    return -Math.pow(initialSpeed, 2) / (2 * acceleration)
}

/**
 * Computes the acceleration the particle will experiment due to the figure.
 *
 * @param {SphereData} figureInfo
 * @param {Particle} particle
 */
const computeAcceleration = (figureInfo, particle) => {
    const chargeField = getChargeField(figureInfo)
    return (chargeField * particle.charge.value) / particle.mass.value
}

/**
 * Creates a tick function for the simulation, given the conditions.
 *
 * @param {SimulationInput} simInput The input to the simulation..
 * @param {SimulationContext} context The context of the simulation.
 * @param {Two.Circle} point TwoJS object that displays the particle.
 * @param {Number} angle Angle that represents the position of the particle in the sphere.
 * @param {Two.Vector} initialPosition The initial position of the particle.
 * @returns {Function} The function that simulates the ticks
 */
const constructSimulationTick = (
    { particle, initialVelocity },
    context,
    point,
    angle,
    initialPosition
) => {
    // TODO Take into account units!

    const chargeField = getChargeField(context.figure)
    console.log(`The charge field is: ${chargeField}`)
    let t = 0

    const a = (chargeField * particle.charge.value) / particle.mass.value
    const a_x0 = a * Math.cos(angle)
    const a_y0 = a * Math.sin(angle)

    console.log(`Acceleration: (${a_x0}, ${a_y0})`)

    const v_0 = initialVelocity?.value ?? testingInitialVelocity
    const v_x0 = v_0 * Math.cos(angle)
    const v_y0 = v_0 * Math.sin(angle)

    const x_0 = initialPosition.x / metersToPixels_X_Converter
    const y_0 = initialPosition.y / metersToPixels_Y_Converter

    console.log(`Initial Position: (${x_0}, ${y_0})`)

    console.log('Creating function...')

    return (_) => {
        t += 1e-2
        console.log(`t=${t}`)

        const x = x_0 + v_x0 * t + (1 / 2) * a_x0 * Math.pow(t, 2)
        const y = y_0 - v_y0 * t - (1 / 2) * a_y0 * Math.pow(t, 2)

        point.position.set(
            x * metersToPixels_X_Converter,
            y * metersToPixels_Y_Converter
        )
        console.log(
            `Position set to (${x * metersToPixels_X_Converter},${
                y * metersToPixels_Y_Converter
            })}`
        )

        const timedOut = floatEquals(t, 10, 0.1)
        const xInsideSphere = angle <= HALF_PI ? x <= x_0 : x >= x_0
        const yInsideSphere = y >= y_0

        if ((xInsideSphere && yInsideSphere) || timedOut) {
            console.log(`(${x}, ${y}) <= (${x_0}, ${y_0})`)
            two.unbind('update')
        }
    }
}

/**
 *
 * @param {SphereData} figureInfo The data of the figure
 */
const getChargeField = (figureInfo) =>
    figureInfo.charge.value /
    (4 * HALF_PI * 2 * EPSILON_0 * Math.pow(figureInfo.radius.value, 2))

/**
 * Draws the hemisphere into the screen.
 * @param {Two} drawer TwoJS object
 * @param {Two.Vector} originPos Position of the origin in the canvas
 * @param {Number} radiusInPixels Radius of the sphere in pixels
 * @param {SimulationContext} context Object that contains all the fields that the user can change.
 */
const drawSphere = (drawer, originPos, radiusInPixels, context) => {
    let figureColor = 'blue'

    let arc = drawer.makeCircle(originPos.x, originPos.y, radiusInPixels)
    arc.stroke = figureColor
    arc.linewidth = 3
    arc.fill = 'transparent'

    let line = drawer.makeLine(
        originPos.x,
        originPos.y,
        originPos.x + radiusInPixels,
        originPos.y
    )
    line.stroke = 'green'
    line.linewidth = 3

    let backwardArc = drawer.makeArcSegment(
        originPos.x,
        originPos.y,
        radiusInPixels,
        radiusInPixels,
        HALF_PI * 2,
        HALF_PI * 4
    )
    backwardArc.scale = new Two.Vector(1, 0.4)
    backwardArc.stroke = figureColor
    backwardArc.linewidth = 4
    backwardArc.dashes = [5, 6]
    backwardArc.fill = 'transparent'

    let forwardArc = drawer.makeArcSegment(
        originPos.x,
        originPos.y,
        radiusInPixels,
        radiusInPixels,
        HALF_PI * 2,
        HALF_PI * 4
    )
    forwardArc.scale = new Two.Vector(1, -0.4)
    forwardArc.stroke = figureColor
    forwardArc.linewidth = 4
    forwardArc.fill = 'transparent'

    let rString = `R = ${context.figure.radius.value} ${context.figure.radius.unit}`
    drawer.makeText(
        rString,
        originPos.x + radiusInPixels + 3,
        originPos.y - 10,
        {
            alignment: 'left',
            fill: 'green',
            size: 18
        }
    )

    let cString = `Q = ${context.figure.charge.value} ${context.figure.charge.unit}`
    drawer.makeText(
        cString,
        originPos.x - radiusInPixels / 2,
        originPos.y - radiusInPixels / 4,
        {
            fill: 'red',
            stroke: 10,
            size: 18
        }
    )
}

/**
 * Computes the escape velocity of the given sphere.
 *
 * @param {SphereData} figureInfo
 * @param {Particle} particle
 * @returns {Number} The escape velocity in m/s.
 */
const computeEscapeVelocity = (figureInfo, particle) => {
    const figureCharge = figureInfo.charge.value
    const radius = figureInfo.radius.value
    const particleCharge = particle.charge.value
    const mass = particle.mass.value

    const potential = Math.abs(figureCharge) / (4 * HALF_PI * 2 * EPSILON_0 * radius)
    const term = (2 / mass) * Math.abs(particleCharge) * potential
    return Math.sqrt(term)
}

/**
 * Draws the canvas
 * @param {SimulationContext} context
 */
const drawCanvas = (context) => {
    let elem = document.querySelector('#canvas')
    metersToPixels_X_Converter =
        elem.offsetWidth / (context.x_axis.max - context.x_axis.min)
    metersToPixels_Y_Converter =
        elem.offsetHeight / (context.y_axis.max - context.y_axis.min)

    const radiusInPixels = getRadiusInPixels(context)
    const originPos = getOriginPos(radiusInPixels)

    initializePlane(two, originPos, columns, rows)
    drawSphere(two, originPos, radiusInPixels, context)
    //drawPoints(two, originPos, context)

    two.update()
}
</script>

<style scoped>
main {
    grid-area: 'main';
    padding: 3ch;
}
.canvas {
    display: block;
    background-color: white;
    border-radius: 7px;
    min-height: 55vh;
    margin-bottom: 1ch;
}
</style>

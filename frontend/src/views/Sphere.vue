<template>
    <main>
        <div id="canvas" class="canvas"></div>
        <fieldsContainer
            :fields="fields"
            @changesSubmited="updateFields($event)"
            @startSimulation="startSimulation($event)"
        ></fieldsContainer>
    </main>
</template>

<script setup>
import fieldsContainer from '@/components/organism/fieldsContainer.vue'
import { onMounted, ref, toRaw } from 'vue'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'
import { initializePlane } from '../lib/plane.js'
import { SimulationMagnitude, SimulationContext, Axis, Particle, EPSILON_0 } from '../lib/main'
import { ELECTRON } from '../lib/particles'

let two = new Two()
const rows = 11
const columns = 25
const radius = 80
const testingInitialVelocity = 15;

const getOriginPos = () => new Two.Vector(two.width / 2, two.height - radius)

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
    new SimulationMagnitude(1, 'Radius', 'm'),
    new SimulationMagnitude(1, 'Charge', 'C')
)
let axis = new Axis(-5, 5)

let fields = ref(new SimulationContext(axis, data, ELECTRON))

const updateFields = (newValue) => {
    fields.value = newValue
    console.log('FROM PARENT')
    console.dir(fields.value)
    two.clear()
    drawCanvas(toRaw(newValue))
}

const startSimulation = (particle) => {
    let context = toRaw(fields.value)
    const originPos = getOriginPos()
    const angle = HALF_PI;
    const initialPosition = new Two.Vector(originPos.x + radius * Math.cos(angle), originPos.y - radius * Math.sin(angle))
    console.log("Starting simulation...")
    console.dir(context)

    let point = two.makeCircle(initialPosition.x, initialPosition.y, 5)
    point.fill = '#CF9FFF'
    point.bind('update', constructSimulationTick(particle, context, point, angle, initialPosition))
    two.play()
}

/**
 * Creates a tick function for the simulation, given the conditions.
 * 
 * @param {Particle} particle The particle to simulate.
 * @param {SimulationContext} context The context of the simulation.
 * @param {Two.Circle} point TwoJS object that displays the particle.
 * @param {Number} angle Angle that represents the position of the particle in the sphere.
 * @param {Two.Vector} initialPosition The initial position of the particle.
 * @returns {Function} The function that simulates the ticks
 */
const constructSimulationTick = (particle, context, point, angle, initialPosition) => {
    // TODO Take into account units!
    
    const chargeField = getChargeField(context.figure);
    console.log(`The charge field is: ${chargeField}`);
    const a = chargeField * particle.charge.value / particle.mass.value;
    const a_x0 = a*Math.cos(angle);
    const a_y0 = a*Math.sin(angle);

    const v_0 = context.input.initialVelocity?.value ?? testingInitialVelocity;
    const v_x0 = v_0 * Math.cos(angle);
    const v_y0 = v_0 * Math.sin(angle);

    console.log("Creating function...")

    return (frameCount) => {
        const t = frameCount / 30;
        console.log(`t=${t}`);

        const x = initialPosition.x + v_x0 * t + 1/2 * a_x0 * t * t;
        const y = initialPosition.y + v_y0 * t + 1/2 * a_y0 * t* t;

        point.position.set(x, y)
        console.log(`Position set to (${x},${y})}`)
    }
}

/**
 * 
 * @param {SphereData} figureInfo The data of the figure
 */
const getChargeField = (figureInfo) =>  figureInfo.charge.value / (4 * HALF_PI * 2 * EPSILON_0 * Math.pow(figureInfo.radius.value, 2));

/**
 * Draws the hemisphere into the screen.
 * @param {Two} drawer TwoJS object
 * @param {Two.Vector} originPos Position of the origin in the canvas
 * @param {Number} radius Radius of the sphere
 * @param {Object} context object that contains all the fields that the user can change.
 */
const drawSphere = (drawer, originPos, radius, context) => {
    let figureColor = 'blue'

    let arc = drawer.makeCircle(originPos.x, originPos.y, radius)
    arc.stroke = figureColor
    arc.linewidth = 3
    arc.fill = 'transparent'

    let line = drawer.makeLine(
        originPos.x,
        originPos.y,
        originPos.x + radius,
        originPos.y
    )
    line.stroke = 'green'
    line.linewidth = 3

    let backwardArc = drawer.makeArcSegment(
        originPos.x,
        originPos.y,
        radius,
        radius,
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
        radius,
        radius,
        HALF_PI * 2,
        HALF_PI * 4
    )
    forwardArc.scale = new Two.Vector(1, -0.4)
    forwardArc.stroke = figureColor
    forwardArc.linewidth = 4
    forwardArc.fill = 'transparent'

    let rString = `R = ${context.figure.radius.value} ${context.figure.radius.unit}`
    drawer.makeText(rString, originPos.x + radius + 3, originPos.y - 10, {
        alignment: 'left',
        fill: 'green',
        size: 18
    })

    let cString = `Q = ${context.figure.charge.value} ${context.figure.charge.unit}`
    drawer.makeText(
        cString,
        originPos.x - radius / 2,
        originPos.y + radius / 4,
        {
            fill: 'red',
            stroke: 10,
            size: 18
        }
    )
}

function drawCanvas(context) {
    initializePlane(two, getOriginPos(), columns, rows)
    drawSphere(two, getOriginPos(), radius, context)
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

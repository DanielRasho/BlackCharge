<template>
    <main>
        <div class="canvas" id="canvas"></div>
        <fieldsContainer :fields="fields" 
        @changesSubmited = "updateFields($event)"
        @startSimulation = "startSimulation($event)"/>
    </main>
</template>

<script setup>
import { onMounted, ref, toRaw } from 'vue'
import fieldsContainer from '../components/organism/fieldsContainer.vue'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'
import { initializePlane } from '../lib/plane.js'
import { ELECTRON } from '../lib/particles'
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

// === TWO INITIALIZATION ==
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
const getOriginPos = () => new Two.Vector(two.width / 5, two.height / 2)

onMounted(async () => {
    let elem = document.querySelector('#canvas')
    two = new Two({
        fullscreen: false,
        width: elem.offsetWidth,
        height: elem.offsetHeight
    }).appendTo(elem)

    drawCanvas(fields.value)
})

// === FIGURE INITIALIZATION ==
class PlaneData {
    /**
     * Constructs an object that holds all the data related to the plane.
     * @param {SimulationMagnitude} chargeDensity The charge of the sphere
     */
    constructor(chargeDensity) {
        this.chargeDensity = chargeDensity
    }
}

let x_axis = new Axis(-2e-2, 2e-2)
let y_axis = new Axis(-2, 2)
let data = new PlaneData(
    new SimulationMagnitude(4e-15, 'Charge Density', 'C/m²'),
)

let fields = ref(
    new SimulationContext(
        x_axis,
        y_axis,
        data,
        new SimulationInput(
            ELECTRON,
            new SimulationMagnitude(1000, 'Velocity', 'm/s'),
            new SimulationMagnitude(1e-6, 'Delta Time', 's')
        )
    )
)

const updateFields = (newValue) => {
    fields.value = newValue
    two.clear()
    drawCanvas(toRaw(newValue))
}

// === MATH FUNCTIONS ===
/**
 * Computes the maximum height a body will reach given the initial speed of the body and acceleration it experiments.
 * @param {Number} initialSpeed
 * @param {Number} chargeDensity
 * @param {Number} particleMass
 * @param {Number} particleCharge
 */
 const computeHeight = (
    initialSpeed,
    chargeDensity,
    particleMass,
    particleCharge
) => {
    return ( particleMass * Math.pow(initialSpeed, 2) * EPSILON_0)
    / (particleCharge * chargeDensity)
}

/**
 * @param {PlaneData} figureInfo The data of the figure
 */
const getChargeField = (figureInfo) =>
    figureInfo.chargeDensity.value / (2 * EPSILON_0)

// === ANIMATION FUNCTIONS ===

/**
 *
 * @param {SimulationInput} simInput
 */
 const startSimulation = (simInput) => {
    two.clear()
    drawCanvas(toRaw(fields.value))

    const context = toRaw(fields.value)
    const originPos = getOriginPos()
    const initialDrawPosition = new Two.Vector(
        originPos.x,
        originPos.y
    )

    const maxHeight = computeHeight(
              simInput.initialVelocity.value,
              context.figure.chargeDensity.value,
              simInput.particle.mass.value,
              Math.abs(simInput.particle.charge.value)
          )

    const maxHeightDisplay = `Maximum Height: ${maxHeight.toExponential(4)} m`
    two.makeText(maxHeightDisplay, 10, 23, {
        alignment: 'left',
        fill: 'green'
    })

    const dinamicHeightDisplayPosition = new Two.Vector(
            initialDrawPosition.x + maxHeight * metersToPixels_X_Converter + 20,
            initialDrawPosition.y - 20
        )
        two.makeText(
            `${maxHeight.toExponential(4)} m`,
            dinamicHeightDisplayPosition.x,
            dinamicHeightDisplayPosition.y,
            {
                alignment: 'left',
                fill: 'orange'
            }
        )
        const line = two.makeLine(
            initialDrawPosition.x,
            initialDrawPosition.y,
            dinamicHeightDisplayPosition.x,
            initialDrawPosition.y
        )
        line.fill = line.stroke = 'orange'
        line.linewidth = 5
        line.dashes = [6, 5]

        console.log('Starting simulation...')
        console.dir(context)

        let point = two.makeCircle(dinamicHeightDisplayPosition.x, initialDrawPosition.y, 5)
        point.fill = '#CF9FFF'
        two.update() // For debuggin purposes...
 }

// === DRAWING FUNCIONS ===

/**
 * Draws the hemisphere into the screen.
 * @param {Two} drawer TwoJS object
 * @param {Two.Vector} originPos Position of the origin in the canvas
 * @param {SimulationContext} context Object that contains all the fields that the user can change.
 */
const drawPlane = (drawer, originPos, context) => {
    let figureColor = 'blue'

    let planeWith = drawer.width / 15
    let planeHeight = drawer.height / 4

    console.log(originPos)

    let plane_points = [
        new Two.Anchor(originPos, 0, 0, 0, 0, 0),
        new Two.Anchor(originPos - planeWith, drawer.height, 0, 0, 0, 0)
    ]

    let plane = drawer.makePath(
        originPos.x - planeWith,
        0,
        originPos.x - planeWith,
        drawer.height,
        originPos.x + planeWith / 2,
        drawer.height - planeHeight,
        originPos.x + planeWith / 2,
        planeHeight,
        false
    )
    plane.stroke = 'blue'
    plane.linewidth = 3
    plane.dashes = [10, 6]
    plane.fill = '#B3D6FF87'

    let cString = `Q/m² = ${context.figure.chargeDensity.value} ${context.figure.chargeDensity.unit}`
    drawer.makeText(cString, originPos.x + planeWith, planeHeight, {
        alignment: 'left',
        fill: 'green',
        stroke: 10,
        size: 18
    })
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

    //const radiusInPixels = getRadiusInPixels(context)
    const originPos = getOriginPos()

    initializePlane(two, originPos, columns, rows)
    drawPlane(two, originPos, context)

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

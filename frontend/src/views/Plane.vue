<template>
    <main>
        <div class="canvas" id="canvas"></div>
        <fieldsContainer :fields="fields" />
    </main>
</template>

<script setup>
import { onMounted, ref} from 'vue'
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
 const getOriginPos = () =>
    new Two.Vector(two.width / 5, two.height / 2)

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
    new SimulationMagnitude(4e-3, 'Charge Density', 'C/m²'),
)


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

// === DRAWING FUNCIONS ===

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
    //drawSphere(two, originPos, radiusInPixels, context)

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

<template>
    <main>
        <div id="canvas" class="canvas"></div>
        <fieldsContainer
            :fields="fields"
            @changesSubmited="updateFields($event)"
        ></fieldsContainer>
    </main>
</template>

<script setup>
import fieldsContainer from '@/components/organism/fieldsContainer.vue'
import { onMounted, ref, toRaw } from 'vue'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'
import { initializePlane } from '../lib/plane.js'
import { SimulationMagnitude, SimulationContext, Axis } from "../lib/main";

let two

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

    // get radius() {
    //     return this.radius
    // }
    // get charge() {
    //     return this.charge
    // }

    // set radius(r) {
    //     return (this.radius = r)
    // }
    // set charge(c) {
    //     return (this.charge = c)
    // }
}

onMounted(async () => {
    let elem = document.querySelector('#canvas')
    two = new Two({
        fullscreen: false,
        width: elem.offsetWidth,
        height: elem.offsetHeight
    }).appendTo(elem)

    drawCanvas(fields.value)
    two.update()
})

let data = new SphereData(
    new SimulationMagnitude(1, 'Radius', 'm'),
    new SimulationMagnitude(1, 'Charge', 'C')
)
let axis = new Axis(-5, 5)

const fields = ref(new SimulationContext(axis, data, []))

const updateFields = (newValue) => {
    fields.value = newValue
    console.log('FROM PARENT')
    console.dir(fields.value)
    two.clear()
    drawCanvas(toRaw(newValue))
}

/**
 * Draws the hemisphere into the screen.
 * @param {Two} drawer TwoJS object
 * @param {Two.Vector} originPos Position of the origin in the canvas
 * @param {Object} context object that contains all the fields that the user can change.
 */
const drawHemisphere = (drawer, originPos, context) => {
    let arcRadius = 100
    let figureColor = 'blue'
    let arc = drawer.makeArcSegment(
        originPos.x,
        originPos.y,
        arcRadius,
        arcRadius,
        HALF_PI,
        HALF_PI * 3
    )
    arc.stroke = figureColor
    arc.linewidth = 3

    let line = drawer.makeLine(
        originPos.x,
        originPos.y - arcRadius,
        originPos.x,
        originPos.y + arcRadius
    )
    line.stroke = figureColor
    line.linewidth = 3

    let backwardArc = drawer.makeArcSegment(
        originPos.x - arcRadius / 2,
        originPos.y,
        arcRadius / 2,
        arcRadius / 2,
        HALF_PI * 2,
        HALF_PI * 4
    )
    backwardArc.scale = new Two.Vector(1, 0.4)
    backwardArc.stroke = figureColor
    backwardArc.linewidth = 4
    backwardArc.dashes = [3, 5]
    backwardArc.fill = 'transparent'

    let forwardArc = drawer.makeArcSegment(
        originPos.x - arcRadius / 2,
        originPos.y,
        arcRadius / 2,
        arcRadius / 2,
        HALF_PI * 2,
        HALF_PI * 4
    )
    forwardArc.scale = new Two.Vector(1, -0.4)
    forwardArc.stroke = figureColor
    forwardArc.linewidth = 4
    forwardArc.fill = 'transparent'

    let rString = `R = ${context.figure.radius.value} ${context.figure.radius.unit}`
    drawer.makeText(rString, originPos.x + 5, originPos.y - arcRadius, {
        alignment: 'left'
    })

    let cString = `Q = ${context.figure.charge.value} ${context.figure.charge.unit}`
    drawer.makeText(
        cString,
        originPos.x - arcRadius / 2,
        originPos.y + arcRadius / 4,
        {
            fill: 'red',
            stroke: 10
        }
    )
}

function drawCanvas(context) {
    let rows = 11
    let columns = 25
    let columnGap = two.width / columns
    let originPos = new Two.Vector(
        columnGap * 3 - columnGap / 2,
        two.height / 2
    )

    initializePlane(two, columns, rows)
    drawHemisphere(two, originPos, context)
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

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
import { ELECTRON } from "../lib/particles";

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

const fields = ref(new SimulationContext(axis, data, ELECTRON))

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
 * @param {Number} radius Radius of the sphere
 * @param {Object} context object that contains all the fields that the user can change.
 */
const drawSphere = (drawer, originPos, radius, context) => {
    let figureColor = 'blue'

    let arc = drawer.makeCircle(
        originPos.x,
        originPos.y,
        radius
    )
    arc.stroke = figureColor
    arc.linewidth = 3
    arc.fill = 'transparent'

    let line = drawer.makeLine(
        originPos.x,
        originPos.y,
        originPos.x + radius,
        originPos.y
    )
    line.stroke = "green"
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
            size: 18,
        }
    )
}

function drawCanvas(context) {
    let rows = 11
    let columns = 25
    let radius = 80
    let originPos = new Two.Vector(
        two.width / 2,
        two.height - radius
    )

    initializePlane(two, originPos, columns, rows)
    drawSphere(two, originPos, radius, context)
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

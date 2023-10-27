<template>
    <main>
        <div class="canvas" id="canvas"></div>
        <fieldsContainer
            :fields="fields"
            @changesSubmited="updateFields($event)"
        ></fieldsContainer>
    </main>
</template>

<script setup>
import fieldsContainer from '@/components/organism/fieldsContainer.vue'
import { onMounted, ref, toRaw } from 'vue'
import { initializePlane, drawPoints } from '../lib/plane'
import init, { js_cone_field_on } from 'tphet_core'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'

let two

onMounted(async () => {
    await init()

    let elem = document.querySelector('#canvas')
    two = new Two({
        fullscreen: false,
        width: elem.offsetWidth,
        height: elem.offsetHeight
    }).appendTo(elem)

    drawCanvas(fields.value)
    two.update()
})

const fields = ref({
    axis: {
        x: {
            min: -5,
            max: 5
        },
        y: {
            min: -5,
            max: 5
        }
    },
    figure: {
        radius: {
            value: 1,
            name: 'Radius',
            unit: 'm'
        },
        height: {
            value: 1,
            name: 'Height',
            unit: 'm'
        },
        charge: {
            value: 1,
            name: 'Charge',
            unit: 'C'
        }
    },
    points: []
})

function updateFields(newValue) {
    fields.value = newValue
    console.log('FROM PARENT')
    console.dir(fields.value)
    two.clear()
    drawCanvas(toRaw(newValue))
}

/**
 * Draws the cone into the screen.
 * @param {Two} d TwoJS object
 * @param {Two.Vector} originPos Position of the origin in the canvas
 * @param {Number} rowGap Gap between rows in the plane
 * @param {Number} columnGap Gap between columns in the plane
 * @param {Object} context object that contains all the fields that the user can change.
 */
const drawCone = (d, originPos, rowGap, columnGap, context) => {
    const figureColor = 'blue'
    const arcRadius = 100
    const arcWidth = 8
    const xScale = 0.15

    let upperSide = d.makeLine(
        originPos.x,
        originPos.y - arcRadius,
        originPos.x + columnGap * 2,
        originPos.y
    )
    upperSide.stroke = figureColor
    upperSide.linewidth = 3

    let bottomSide = d.makeLine(
        originPos.x,
        originPos.y + arcRadius,
        originPos.x + columnGap * 2,
        originPos.y
    )
    bottomSide.stroke = figureColor
    bottomSide.linewidth = 3

    let frontArc = d.makeArcSegment(
        originPos.x,
        originPos.y,
        arcRadius,
        arcRadius,
        HALF_PI,
        HALF_PI * 3
    )
    frontArc.linewidth = arcWidth
    frontArc.stroke = figureColor
    frontArc.scale = new Two.Vector(xScale, 1)

    let backArc = d.makeArcSegment(
        originPos.x,
        originPos.y,
        arcRadius,
        arcRadius,
        HALF_PI,
        HALF_PI * 3
    )
    backArc.linewidth = arcWidth
    backArc.stroke = figureColor
    backArc.scale = new Two.Vector(-xScale, 1)
    backArc.dashes = [3, 5]

    let rText = `R = ${context.figure.radius.value} ${context.figure.radius.unit}`
    d.makeText(rText, originPos.x + arcWidth, originPos.y - arcRadius, {
        alignment: 'left'
    })

    let hText = `H = ${context.figure.height.value} ${context.figure.height.unit}`
    d.makeText(hText, originPos.x + 2 * columnGap, originPos.y - arcWidth, {
        alignment: 'left'
    })

    let qText = `Q = ${context.figure.charge.value} ${context.figure.charge.unit}`
    d.makeText(qText, originPos.x + columnGap, originPos.y - arcWidth, {
        fill: 'red'
    })
}

const contextToFigure = (c) => ({
    radius: c.figure.radius.value,
    length: c.figure.height.value,
    charge: c.figure.charge.value
})

function drawCanvas(context) {
    let rows = 11
    let columns = 25
    let columnGap = two.width / columns
    let rowGap = two.height / rows
    let originPos = new Two.Vector(
        columnGap * 3 - columnGap / 2 - columnGap * 2,
        two.height / 2
    )

    initializePlane(two, columns, rows)
    drawCone(two, originPos, rowGap, columnGap, context)
    drawPoints(
        two,
        originPos,
        context,
        contextToFigure,
        js_cone_field_on,
    )

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

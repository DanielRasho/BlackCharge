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
import init, { js_cone_trunk_field_on } from 'tphet_core'
import Two from 'two.js'
import { HALF_PI } from 'two.js/src/utils/math'

let two;

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
        majorRadius: {
            value: 1,
            name: 'Left Radius',
            unit: 'm'
        },
        minorRadius: {
            value: 1,
            name: 'Right Radius',
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
 * Draws a Cone without a pointy thing
 * @param {Two} d Drawer of TwoJS
 * @param {Two.Vector} originPos The position of the origin
 * @param {Number} rowGap The gap between rows
 * @param {Number} columnGap The gap between columns
 * @param {Object} context The context that contains all the data
 */
const drawTrunkCone = (d, originPos, rowGap, columnGap, context) => {
    const figureColor = 'blue'
    const arcRadius = 100
    const arcWidth = 8
    const xScale = 0.15

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

    let frontArc1 = d.makeArcSegment(
        originPos.x + columnGap * 2,
        originPos.y,
        arcRadius * 3/4,
        arcRadius * 3/4,
        HALF_PI,
        HALF_PI * 3
    )
    frontArc1.linewidth = arcWidth
    frontArc1.stroke = figureColor
    frontArc1.scale = new Two.Vector(xScale, 1)

    let frontCircle = d.makeCircle(originPos.x + columnGap * 2, originPos.y, arcRadius * 3/4);
    frontCircle.linewidth = arcWidth
    frontCircle.stroke = figureColor
    frontCircle.fill = "transparent"
    frontCircle.scale = new Two.Vector(-xScale, 1)

    let topLine = d.makeLine(originPos.x, originPos.y + arcRadius, originPos.x + columnGap * 2, originPos.y + arcRadius * 3/4);
    topLine.linewidth = 3
    topLine.stroke = figureColor
    
    let bottomLine = d.makeLine(originPos.x, originPos.y - arcRadius, originPos.x + columnGap * 2, originPos.y - arcRadius * 3/4);
    bottomLine.linewidth = 3
    bottomLine.stroke = figureColor

    let leftRTxt = `Rl = ${context.figure.majorRadius.value} ${context.figure.majorRadius.unit}`;
    d.makeText(leftRTxt, originPos.x + arcWidth, originPos.y + arcRadius + arcWidth, {
        alignment: "left"
    })

    let rightRTxt = `Rr = ${context.figure.minorRadius.value} ${context.figure.minorRadius.unit}`;
    d.makeText(rightRTxt, originPos.x + columnGap*2 + arcWidth, originPos.y + arcRadius * 3/4 + arcWidth, {
        alignment: "left"
    })

    let hText = `H = ${context.figure.height.value} ${context.figure.height.unit}`;
    d.makeText(hText, originPos.x + columnGap, originPos.y - 2*rowGap, {
        alignment: "left"
    })

    let cText = `C = ${context.figure.charge.value} ${context.figure.charge.unit}`;
    d.makeText(cText, originPos.x + columnGap, originPos.y - rowGap, {
        fill: "red",
    })
};

const contextToFigure = (c) => ({
    left_radius: c.figure.majorRadius.value,
    right_radius: c.figure.minorRadius.value,
    length: c.figure.height.value,
    charge: c.figure.charge.value,

});

function drawCanvas(context) {
    let rows = 11
    let columns = 25
    let columnGap = two.width / columns
    let rowGap = two.height / rows
    let originPos = new Two.Vector(
        columnGap * 3 - columnGap / 2,
        two.height / 2
    )

    initializePlane(two, columns, rows)
    drawTrunkCone(two, originPos, rowGap, columnGap, context);
    drawPoints(
        two,
        originPos,
        context,
        contextToFigure,
        js_cone_trunk_field_on,
        (v)=>v/Math.pow(10, 5)
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

import Two from 'two.js'

/**
 * Draws a plane according to the given parameters.
 * @param {Two} two The renderer of the TwoJS
 * @param {Number} columns The number of columns in the graph
 * @param {Number} rows The number of rows in the graph
 * @param {String} guideLinesColor The color of the lines in the background
 */
export const initializePlane = (
    two,
    columns = 25,
    rows = 11,
    guideLinesColor = '#cccccc'
) => {
    // Draw columns
    let col_gap = two.width / columns
    for (let i = 0; i < columns; i++) {
        let x = col_gap / 2 + i * col_gap
        let line = two.makeLine(x, 0, x, two.height)
        line.stroke = guideLinesColor
    }

    // Draw rows
    let row_gap = two.height / rows
    for (let i = 0; i < rows; i++) {
        let y = row_gap / 2 + i * row_gap
        let line = two.makeLine(0, y, two.width, y)
        line.stroke = guideLinesColor
    }

    // Axes
    let yAxisPos = col_gap / 2 + 2 * col_gap
    let yAxis = two.makeArrow(yAxisPos, two.height, yAxisPos, 0, 12)
    yAxis.linewidth = 2

    let xAxisPos = two.height - (rows * row_gap) / 2
    let xAxis = two.makeArrow(0, xAxisPos, two.width, xAxisPos, 12)
    xAxis.linewidth = 2
}

const defaultReducer = (v) => v / Math.pow(10, 8)

/**
 * Draws the hemisphere into the screen.
 * @param {Two} drawer TwoJS object
 * @param {Two.Vector} originPos The vector position of the origin
 * @param {Object} context object that contains all the fields that the user can change.
 * @param {Function} figureFromContext The function to create the figure object from the context.
 * @param {Function} fieldOn The function to calculate the field on the given point.
 * @param {Function} reducer The function that reduces the field in order to graph it.
 */
export const drawPoints = (
    drawer,
    originPos,
    context,
    figureFromContext,
    fieldOn,
    reducer = defaultReducer
) => {
    let { max } = context.axis.x
    let originY = drawer.height / 2
    let fig = figureFromContext(context)
    console.log("The figure is: ", fig);

    let vectors = context.points.map((point) => [
        point,
        new Two.Vector(
            (point / max) * (drawer.width - originPos.x) + originPos.x,
            originY
        )
    ])
    vectors.forEach(([, v]) => {
        let c = drawer.makeCircle(v.x, v.y, 4)
        c.fill = 'red'
    })
    console.log('Points drawed')

    vectors.forEach(([originalPoint, v]) => {
        try {
            let field = fieldOn(fig, originalPoint, 250)
            drawer.makeText(`R = ${field.toExponential(4)} N/C`, v.x, v.y-8);
            console.log(`The field of (${originalPoint}, 0) is ${field}`)
            let x = reducer(field)
            console.log(`The arrow length is: ${x}`)
            let arrow = drawer.makeArrow(v.x, v.y, v.x + x, v.y)
            arrow.stroke = 'red'
            arrow.linewidth = 5
        } catch (ex) {
            console.log('Error creating arrows...')
            console.error(ex)
        }
    })
}

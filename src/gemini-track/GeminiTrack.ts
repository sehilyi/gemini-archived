import { scaleLinear, scaleOrdinal, schemeCategory10, min, max } from 'd3'
import { findExtent, getMaxZoomLevel, findExtentByTrackType } from './utils/zoom'
import vis from './visualizations'

import { Track, getVisualizationType } from '../lib/gemini.schema'
import { GeminiTrackModel } from '../lib/gemini-track-model'

function GeminiTrack(HGC: any, ...args: any[]) {
    if (!new.target) {
        throw new Error(
            'Uncaught TypeError: Class constructor cannot be invoked without "new"',
        )
    }

    const { colorToHex } = HGC.utils

    class GeminiTrackClass extends HGC.tracks.BarTrack {
        private geminiModel: GeminiTrackModel

        constructor(args: any[]) {
            const [context, options] = args
            super(context, options)

            this.geminiModel = new GeminiTrackModel(this.options.spec)

            this.maxAndMin = {
                max: null,
                min: null
            }
        }

        initTile(tile: any) {
            // create the tile
            // should be overwritten by child classes
            this.scale.minRawValue = this.minVisibleValue()
            this.scale.maxRawValue = this.maxVisibleValue()

            this.scale.minValue = this.scale.minRawValue
            this.scale.maxValue = this.scale.maxRawValue

            this.maxAndMin.min = min(tile.tileData.dense)
            this.maxAndMin.max = max(tile.tileData.dense)

            this.localColorToHexScale()

            this.unFlatten(tile)

            // TODO: Metadata, such as field names, should be come from the server
            // This should replace the `unFlatten()`
            this.tabularizeTile(tile)

            this.renderTile(tile)
            this.rescaleTiles()
        }

        // draws exactly one tile
        renderTile(tile: any) {
            tile.mouseOverData = null
            tile.graphics.clear()
            tile.graphics.removeChildren()
            this.pBorder.clear()
            this.pBorder.removeChildren()
            tile.drawnAtScale = this._xScale.copy() // being used in `draw()`

            const isMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel()

            if (isMaxZoomLevel && this.geminiModel.spec().zoomAction?.type === 'none') {
                vis.drawZoomInstruction(HGC, this)
                return
            }

            // select spec based on the zoom level
            const spec: Track = this.geminiModel.spec(isMaxZoomLevel)

            switch (getVisualizationType(spec)) {
                case 'multiple-bar':
                    vis.drawBarChart(HGC, this, tile, isMaxZoomLevel)
                    break
                case 'stacked-bar':
                    vis.drawStackedBarChart(HGC, this, tile, isMaxZoomLevel)
                    break
                case 'line':
                    vis.drawLineCharts(HGC, this, tile, isMaxZoomLevel)
                    break
                default:
                    break
            }
        }

        // y scale should be synced across all tiles
        syncMaxAndMin() {
            const visibleAndFetched = this.visibleAndFetchedTiles()

            visibleAndFetched.map((tile: any) => {
                if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
                    this.maxAndMin.min = tile.minValue
                    this.maxAndMin.max = tile.maxValue
                }
            })
        }

        // rescales the sprites of all visible tiles when zooming and panning.
        rescaleTiles() {
            const visibleAndFetched = this.visibleAndFetchedTiles()

            this.syncMaxAndMin()

            visibleAndFetched.map((a: any) => {
                const valueToPixels = scaleLinear()
                    .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
                    .range([0, this.dimensions[1]])
                const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min))
                const height = valueToPixels(a.minValue + a.maxValue)
                const sprite = a.sprite
                const y = newZero - valueToPixels(a.maxValue)

                if (sprite) {
                    sprite.height = height
                    sprite.y = y
                }
            })
        }

        // converts all colors in a colorScale to Hex colors.
        localColorToHexScale() {
            const colorScale = [...this.geminiModel.getColorRange(), ...this.geminiModel.getColorRange(true)]
            const colorHexMap: { [k: string]: string } = {}
            colorScale.forEach((color: string) => {
                colorHexMap[color] = colorToHex(color)
            })
            this.colorHexMap = colorHexMap
        }

        // un-flatten data into matrix of tile.tileData.shape[0] x tile.tileData.shape[1]
        unFlatten(tile: any) {
            if (tile.matrix) {
                return tile.matrix
            }

            const flattenedArray = tile.tileData.dense

            const matrix = this.simpleUnFlatten(tile, flattenedArray)

            const maxAndMin = findExtent(matrix)

            tile.matrix = matrix
            tile.maxValue = maxAndMin.max
            tile.minValue = maxAndMin.min

            this.syncMaxAndMin()

            return matrix
        }

        tabularizeTile(tile: any) {
            if (tile.tabularData) return

            // TODO: These data should be came from the server
            const N_FIELD = '__N__', Q_FIELD = '__Q__', G_FIELD = '__G__'
            const CATEGORIES = ['A', 'T', 'G', 'C']
            const numericValues = tile.tileData.dense
            const numOfCategories = min([tile.tileData.shape[0], CATEGORIES.length]) // TODO:
            const numOfGenomicPositions = tile.tileData.shape[1]
            ///

            const tabularData = []

            for (let i = 0; i < numOfCategories; i++) {
                for (let j = 0; j < numOfGenomicPositions; j++) {
                    tabularData.push({
                        [N_FIELD]: CATEGORIES[i],
                        [Q_FIELD]: numericValues[(numOfGenomicPositions * i) + j],
                        [G_FIELD]: j
                    })
                }
            }

            tile.tabularData = tabularData

            const isMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel()
            const isStackedBarChart = this.geminiModel.getVisualizationType(isMaxZoomLevel)
            const { min: minValue, max: maxValue } = findExtentByTrackType(tabularData, isStackedBarChart)

            tile.maxValue = maxValue
            tile.minValue = minValue

            // we need to sync the domain of y-axis so that all tiles are aligned each other
            this.syncMaxAndMin()
        }

        simpleUnFlatten(tile: any, data: any) {
            const shapeX = tile.tileData.shape[0] // number of different nucleotides in each bar
            const shapeY = tile.tileData.shape[1] // number of bars

            // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
            // because of how flattenedArray comes back from the server.
            const matrix: number[][] = []
            for (let i = 0; i < shapeX; i++) { // 6
                for (let j = 0; j < shapeY; j++) { // 256;
                    let singleBar: number[]
                    if (matrix[j] === undefined) {
                        singleBar = []
                    } else {
                        singleBar = matrix[j]
                    }
                    singleBar.push(data[(shapeY * i) + j])
                    matrix[j] = singleBar
                }
            }

            return matrix
        }


        // Map each value in every array in the matrix to a color depending on position in the array
        // Divides each array into positive and negative sections and sorts them
        mapOriginalColors(matrix: any, alt: boolean) {

            // mapping colors to unsorted values
            const matrixWithColors = []
            for (let j = 0; j < matrix.length; j++) {
                const columnColors = []

                for (let i = 0; i < matrix[j].length; i++) {
                    columnColors[i] = {
                        value: isNaN(matrix[j][i]) ? 0 : matrix[j][i],
                        color: this.geminiModel.getColorRange(alt)[i] as any
                    }
                }

                // separate positive and negative array values
                const positive = []
                const negative = []
                for (let i = 0; i < columnColors.length; i++) {
                    if (columnColors[i].value >= 0) {
                        positive.push(columnColors[i])
                    }
                    else if (columnColors[i].value < 0) {
                        negative.push(columnColors[i])
                    }
                }
                if (this.options.sortLargestOnTop) {
                    positive.sort((a, b) => a.color - b.color)
                    negative.sort((a, b) => b.value - a.value)
                }
                else {
                    positive.sort((a, b) => b.value - a.value)
                    negative.sort((a, b) => a.value - b.value)
                }

                matrixWithColors.push([positive, negative])
            }
            return matrixWithColors
        }

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions
            super.setDimensions(newDimensions)

            const visibleAndFetched = this.visibleAndFetchedTiles()
            visibleAndFetched.map((a: any) => this.initTile(a))
        }

        // rerender tiles using the new options
        rerender(newOptions: any) {
            super.rerender(newOptions)

            this.options = newOptions
            const visibleAndFetched = this.visibleAndFetchedTiles()

            for (let i = 0; i < visibleAndFetched.length; i++) {
                this.updateTile(visibleAndFetched[i])
            }

            this.rescaleTiles()
            this.draw()
        }

        updateTile(v: any) {
            const visibleAndFetched = this.visibleAndFetchedTiles()

            for (let i = 0; i < visibleAndFetched.length; i++) {
                const tile = visibleAndFetched[i]
                this.unFlatten(tile)
                this.tabularizeTile(tile)
            }

            this.rescaleTiles()
        }

        draw() { super.draw() }
        drawTile() { }  // prevent BarTracks draw method from having an effect
        exportSVG() { }
        getMouseOverHtml() { }
    }
    return new GeminiTrackClass(args)
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>'

// default
GeminiTrack.config = {
    type: 'gemini-track',
    datatype: ['multivec', 'epilogos'],
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'labelPosition',
        'labelColor',
        'labelTextOpacity',
        'labelBackgroundOpacity',
        'trackBorderWidth',
        'trackBorderColor',
        'trackType',
        'scaledHeight',
        'backgroundColor',
        'barBorder',
        'sortLargestOnTop'
    ],
    defaultOptions: {
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        backgroundColor: 'white',
        barBorder: false,
        sortLargestOnTop: true,
    }
}

export default GeminiTrack

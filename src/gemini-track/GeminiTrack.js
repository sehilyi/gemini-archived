import { scaleLinear, scaleOrdinal, schemeCategory10, min, max } from 'd3';
import { findExtent, getMaxZoomLevel } from './utils';

function GeminiTrack(HGC, ...args) {
    if (!new.target) {
        throw new Error(
            'Uncaught TypeError: Class constructor cannot be invoked without "new"',
        );
    }

    // Services
    const { pixiRenderer } = HGC.services;

    // Utils
    const { colorToHex } = HGC.utils;

    class GeminiTrackClass extends HGC.tracks.BarTrack {
        constructor(context, options) {
            super(context, options);
            this.initGeminiTrack();
        }

        initGeminiTrack() {
            if (this.isGeminiTrackInit) return;

            this.maxAndMin = {
                max: null,
                min: null
            };

            this.zoomMask = new HGC.libraries.PIXI.Text('Zoom in to see information', {
                fontSize: "13px",
                fontFamily: "Arial",
                fill: 'black',
            });
            this.zoomMask.anchor.x = 0.5;
            this.zoomMask.anchor.y = 0.5;

            this.isGeminiTrackInit = true;
        }

        initTile(tile) {
            this.initGeminiTrack();

            // create the tile
            // should be overwritten by child classes
            this.scale.minRawValue = this.minVisibleValue();
            this.scale.maxRawValue = this.maxVisibleValue();

            this.scale.minValue = this.scale.minRawValue;
            this.scale.maxValue = this.scale.maxRawValue;

            this.maxAndMin.min = min(tile.tileData.dense);
            this.maxAndMin.max = max(tile.tileData.dense);

            this.localColorToHexScale();

            this.unFlatten(tile);

            this.renderTile(tile);
            this.rescaleTiles();
        }

        /**
         * Draws exactly one tile.
         *
         * @param tile
         */
        renderTile(tile) {
            tile.svgData = null;
            tile.mouseOverData = null;

            const maxZoomLevel = getMaxZoomLevel();

            const graphics = tile.graphics;

            graphics.clear();
            graphics.removeChildren();

            tile.drawnAtScale = this._xScale.copy();

            // we're setting the start of the tile to the current zoom level
            const { tileX, tileWidth } = this.getTilePosAndDimensions(
                tile.tileData.zoomLevel,
                tile.tileData.tilePos,
                this.tilesetInfo.tile_size
            );

            const matrix = this.unFlatten(tile);

            this.oldDimensions = this.dimensions; // for mouseover

            if (tile?.tileData?.zoomLevel !== maxZoomLevel) {
                // we are in the highest level
                if (this.options?.zoomOutTechnique?.type === 'none') {
                    this.drawZoomInstruction()
                }
                else if (this.options?.zoomOutTechnique?.type === 'aggregate') {
                    this.distroyZoomInstruction()

                    // creates a sprite containing all of the rectangles in this tile
                    this.drawVerticalBars(
                        this.mapOriginalColors(matrix),
                        tileX,
                        tileWidth,
                        this.maxAndMin.max,
                        this.maxAndMin.min,
                        tile
                    );

                    graphics.addChild(tile.sprite);
                }
                else if (this.options?.zoomOutTechnique?.type === 'alt-representation') {
                    this.distroyZoomInstruction()

                    if (this.options?.zoomOutTechnique?.spec?.mark) {
                        this.drawLineCharts(tile);
                    }
                    else if (this.options?.zoomOutTechnique?.spec?.row) {
                        this.drawMultipleBarCharts(tile);
                    }
                } else if (this.options?.zoomOutTechnique?.type === 'auto') {
                    this.distroyZoomInstruction()

                    // creates a sprite containing all of the rectangles in this tile
                    this.drawVerticalBars(
                        this.mapOriginalColors(matrix),
                        tileX,
                        tileWidth,
                        this.maxAndMin.max,
                        this.maxAndMin.min,
                        tile
                    );

                    graphics.addChild(tile.sprite);
                }
            }
            else {
                this.distroyZoomInstruction()

                // creates a sprite containing all of the rectangles in this tile
                this.drawVerticalBars(
                    this.mapOriginalColors(matrix),
                    tileX,
                    tileWidth,
                    this.maxAndMin.max,
                    this.maxAndMin.min,
                    tile
                );

                graphics.addChild(tile.sprite);
            }
        }

        drawZoomInstruction() {
            this.zoomMask.x = this.position[0] + this.dimensions[0] / 2;
            this.zoomMask.y = this.position[1] + this.dimensions[1] / 2;

            // Draw the notification on the pBorder level. This is in the foreground
            const graphics = this.pBorder;

            graphics.clear();
            graphics.removeChildren();

            graphics.beginFill(0xEAEAEA);

            graphics.drawRect(
                this.position[0],
                this.position[1],
                this.dimensions[0],
                this.dimensions[1]
            );
            graphics.addChild(this.zoomMask);
        }

        distroyZoomInstruction() {
            const graphics = this.pBorder;

            graphics.clear();
            graphics.removeChildren();
        }

        drawLineCharts(tile) {
            const graphics = tile.graphics;
            graphics.clear();
            tile.drawnAtScale = this._xScale.copy();

            // we're setting the start of the tile to the current zoom level
            const { tileX, tileWidth } = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
                tile.tileData.tilePos, this.tilesetInfo.tile_size);

            const matrix = tile.matrix;
            const trackHeight = this.dimensions[1];
            const matrixDimensions = tile.tileData.shape;

            const valueToPixels = scaleLinear()
                .domain([0, this.maxAndMin.max])
                .range([0, trackHeight/* / matrixDimensions[0]*/]);

            for (let i = 0; i < matrix[0].length; i++) {
                const intervals = trackHeight / matrixDimensions[0];
                // calculates placement for a line in each interval; we subtract 1 so we can see the last line clearly
                const linePlacement = trackHeight
                // (i === matrix[0].length - 1) ?
                //     (intervals * i) + ((intervals * (i + 1) - (intervals * i))) - 1 :
                //     (intervals * i) + ((intervals * (i + 1) - (intervals * i)));
                graphics.lineStyle(1, this.colorHexMap[this.options.colorScale[i]], 1);

                for (let j = 0; j < matrix.length; j++) { // 3070 or something
                    const x = this._xScale(tileX + (j * tileWidth / this.tilesetInfo.tile_size));
                    const y = linePlacement - valueToPixels(matrix[j][i]);
                    this.addSVGInfo(tile, x, y, this.options.colorScale[i]);
                    // move draw position back to the start at beginning of each line
                    (j === 0) ? graphics.moveTo(x, y) : graphics.lineTo(x, y);
                }
            }
        }

        drawMultipleBarCharts(tile) {
            const graphics = tile.graphics;

            graphics.clear();
            graphics.removeChildren();

            tile.drawnAtScale = this._xScale.copy();

            let localGraphics = new HGC.libraries.PIXI.Graphics();

            // we're setting the start of the tile to the current zoom level
            const { tileX, tileWidth } = this.getTilePosAndDimensions(tile.tileData.zoomLevel,
                tile.tileData.tilePos, this.tilesetInfo.tile_size);

            if (this.options.barBorder || true) {
                localGraphics.lineStyle(0.1, 0x000000, 1);
                tile.barBorders = true;
            }

            const matrix = tile.matrix;
            const trackHeight = this.dimensions[1];
            const matrixDimensions = tile.tileData.shape;
            const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
            const width = this._xScale(tileX + (tileWidth / this.tilesetInfo.tile_size)) - this._xScale(tileX);
            const valueToPixels = scaleLinear()
                .domain([0, this.maxAndMin.max])
                .range([0, trackHeight / matrixDimensions[0]]);

            for (let i = 0; i < matrix[0].length; i++) { // 15
                localGraphics.beginFill(this.colorHexMap[colorScale[i]]);

                for (let j = 0; j < matrix.length; j++) { // 3000
                    const x = this._xScale(tileX + (j * tileWidth / this.tilesetInfo.tile_size));
                    const height = valueToPixels(matrix[j][i]);
                    const y = ((trackHeight / matrixDimensions[0]) * (i + 1) - height);
                    this.addSVGInfo(tile, x, y, width, height, colorScale[i]);
                    localGraphics.drawRect(x, y, width, height);
                }

            }

            const texture = pixiRenderer.generateTexture(localGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
            const sprite = new HGC.libraries.PIXI.Sprite(texture);
            sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
            sprite.x = this._xScale(tileX);
            graphics.addChild(sprite);
        }

        syncMaxAndMin() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            visibleAndFetched.map(tile => {

                if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
                    this.maxAndMin.min = tile.minValue;
                    this.maxAndMin.max = tile.maxValue;
                }
            });
        }

        /**
         * Rescales the sprites of all visible tiles when zooming and panning.
         */
        rescaleTiles() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            this.syncMaxAndMin();

            visibleAndFetched.map(a => {
                const valueToPixels = scaleLinear()
                    .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
                    .range([0, this.dimensions[1]]);
                const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min));
                const height = valueToPixels(a.minValue + a.maxValue);
                const sprite = a.sprite;
                const y = newZero - valueToPixels(a.maxValue);

                if (sprite) {
                    sprite.height = height;

                    sprite.y = y;
                }
            });
        }


        /**
         * Converts all colors in a colorScale to Hex colors.
         */
        localColorToHexScale() {
            const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);
            const colorHexMap = {};
            for (let i = 0; i < colorScale.length; i++) {
                colorHexMap[colorScale[i]] = colorToHex(colorScale[i]);
            }
            this.colorHexMap = colorHexMap;
        }

        /**
         * un-flatten data into matrix of tile.tileData.shape[0] x tile.tileData.shape[1]
         *
         * @param tile
         * @returns {Array} 2d array of numerical values for each column
         */
        unFlatten(tile) {
            if (tile.matrix) {
                return tile.matrix;
            }

            const flattenedArray = tile.tileData.dense;

            // if any data is negative, switch to exponential scale
            if (flattenedArray.filter(a => a < 0).length > 0 && this.options.valueScaling === 'linear') {
                console.warn('Negative values present in data. Defaulting to exponential scale.');
                this.options.valueScaling = 'exponential';
            }

            const matrix = this.simpleUnFlatten(tile, flattenedArray);

            const maxAndMin = findExtent(matrix);

            tile.matrix = matrix;
            tile.maxValue = maxAndMin.max;
            tile.minValue = maxAndMin.min;

            this.syncMaxAndMin();

            return matrix;
        }

        /**
         *
         * @param tile
         * @param data array of values to reshape
         * @returns {Array} 2D array representation of data
         */
        simpleUnFlatten(tile, data) {
            const shapeX = tile.tileData.shape[0]; // number of different nucleotides in each bar
            const shapeY = tile.tileData.shape[1]; // number of bars

            // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
            // because of how flattenedArray comes back from the server.
            const matrix = [];
            for (let i = 0; i < shapeX; i++) { // 6
                for (let j = 0; j < shapeY; j++) { // 256;
                    let singleBar;
                    if (matrix[j] === undefined) {
                        singleBar = [];
                    } else {
                        singleBar = matrix[j];
                    }
                    singleBar.push(data[(shapeY * i) + j]);
                    matrix[j] = singleBar;
                }
            }

            return matrix;
        }


        /**
         * Map each value in every array in the matrix to a color depending on position in the array
         * Divides each array into positive and negative sections and sorts them
         *
         * @param matrix 2d array of numbers representing nucleotides
         * @return
         */
        mapOriginalColors(matrix) {
            const colorScale = this.options.colorScale || scaleOrdinal(schemeCategory10);

            // mapping colors to unsorted values
            const matrixWithColors = [];
            for (let j = 0; j < matrix.length; j++) {
                const columnColors = [];

                for (let i = 0; i < matrix[j].length; i++) {
                    columnColors[i] = {
                        value: isNaN(matrix[j][i]) ? 0 : matrix[j][i],
                        color: colorScale[i]
                    }
                }

                // separate positive and negative array values
                const positive = [];
                const negative = [];
                for (let i = 0; i < columnColors.length; i++) {
                    if (columnColors[i].value >= 0) {
                        positive.push(columnColors[i]);
                    }
                    else if (columnColors[i].value < 0) {
                        negative.push(columnColors[i]);
                    }
                }
                if (this.options.sortLargestOnTop) {
                    positive.sort((a, b) => a.color - b.color);
                    negative.sort((a, b) => b.value - a.value);
                }
                else {
                    positive.sort((a, b) => b.value - a.value);
                    negative.sort((a, b) => a.value - b.value);
                }

                matrixWithColors.push([positive, negative]);
            }
            return matrixWithColors;
        }

        /**
         * Draws graph without normalizing values.
         *
         * @param graphics PIXI.Graphics instance
         * @param matrix 2d array of numbers representing nucleotides
         * @param tileX starting position of tile
         * @param tileWidth pre-scaled width of tile
         * @param positiveMax the height of the tallest bar in the positive part of the graph
         * @param negativeMax the height of the tallest bar in the negative part of the graph
         * @param tile
         */
        drawVerticalBars(matrix, tileX, tileWidth, positiveMax, negativeMax, tile) {
            let graphics = new HGC.libraries.PIXI.Graphics();
            const trackHeight = this.dimensions[1];

            // get amount of trackHeight reserved for positive and for negative
            const unscaledHeight = positiveMax + (Math.abs(negativeMax));

            // fraction of the track devoted to positive values
            const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

            // fraction of the track devoted to negative values
            const negativeTrackHeight = (Math.abs(negativeMax) * trackHeight) / unscaledHeight;

            let lowestY = this.dimensions[1];

            const width = 10;

            // calls drawBackground in PixiTrack.js
            this.drawBackground(matrix, graphics);

            // borders around each bar
            if (this.options.barBorder || true) {
                graphics.lineStyle(1, 0x000000, 1);
            }

            for (let j = 0; j < matrix.length / 2.0; j++) { // jth vertical bar in the graph
                const x = (j * width);

                // draw positive values
                const positive = matrix[j][0];
                const valueToPixelsPositive = scaleLinear()
                    .domain([0, positiveMax])
                    .range([0, positiveTrackHeight]);
                let positiveStackedHeight = 0;

                for (let i = 0; i < positive.length; i++) {
                    const height = valueToPixelsPositive(positive[i].value);
                    const y = positiveTrackHeight - (positiveStackedHeight + height);
                    this.addSVGInfo(tile, x, y, width, height, positive[i].color);
                    graphics.beginFill(this.colorHexMap[positive[i].color]);
                    graphics.drawRect(x, y, width, height);

                    positiveStackedHeight = positiveStackedHeight + height;
                    if (lowestY > y)
                        lowestY = y;
                }

                // draw negative values, if there are any

                if (Math.abs(negativeMax) > 0) {
                    const negative = matrix[j][1];
                    const valueToPixelsNegative = scaleLinear()
                        .domain([-Math.abs(negativeMax), 0])
                        .range([negativeTrackHeight, 0]);
                    let negativeStackedHeight = 0;
                    for (let i = 0; i < negative.length; i++) {
                        const height = valueToPixelsNegative(negative[i].value);
                        const y = positiveTrackHeight + negativeStackedHeight;
                        this.addSVGInfo(tile, x, y, width, height, negative[i].color);
                        graphics.beginFill(this.colorHexMap[negative[i].color]);
                        graphics.drawRect(x, y, width, height);
                        negativeStackedHeight = negativeStackedHeight + height;
                    }
                }
            }

            // vertical bars are drawn onto the graphics object
            // and a texture is generated from that
            const texture = pixiRenderer.generateTexture(
                graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST
            );
            const sprite = new HGC.libraries.PIXI.Sprite(texture);
            sprite.width = this._xScale(tileX + tileWidth) - this._xScale(tileX);
            sprite.x = this._xScale(tileX);
            tile.sprite = sprite;
            tile.lowestY = lowestY;
        }

        /**
         * Adds information to recreate the track in SVG to the tile
         *
         * @param tile
         * @param x x value of bar
         * @param y y value of bar
         * @param width width of bar
         * @param height height of bar
         * @param color color of bar (not converted to hex)
         */
        addSVGInfo(tile, x, y, width, height, color) {

        }

        /**
         * Here, rerender all tiles every time track size is changed
         *
         * @param newDimensions
         */
        setDimensions(newDimensions) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map(a => this.initTile(a));
        }

        rerender(newOptions) {
            // TODO: this is being called only when the options are changed?
            super.rerender(newOptions);

            this.options = newOptions;
            const visibleAndFetched = this.visibleAndFetchedTiles();

            for (let i = 0; i < visibleAndFetched.length; i++) {
                this.updateTile(visibleAndFetched[i]);
            }

            this.rescaleTiles();
            this.draw();
        }

        updateTile() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            for (let i = 0; i < visibleAndFetched.length; i++) {
                const tile = visibleAndFetched[i];
                this.unFlatten(tile);
            }

            this.rescaleTiles();
        }

        /**
         * Prevent BarTracks draw method from having an effect
         *
         * @param tile
         */
        drawTile(tile) {

        }

        exportSVG() {
            return null;
        }

        /**
         * Sorts relevant data for mouseover for easy iteration later
         *
         * @param tile
         */
        makeMouseOverData(tile) {
            return;
        }

        getMouseOverHtml(trackX, trackY) {
            return '';
        }

        draw() {
            super.draw();
        }

    }
    return new GeminiTrackClass(...args);
};

const icon = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
GeminiTrack.config = {
    type: 'gemini-track',
    datatype: ['multivec', 'epilogos'],
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'zoomOutTechnique',
        'colorScale',
        'labelPosition',
        'labelColor',
        'valueScaling',
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
        zoomOutTechnique: {
            type: 'none'
        },
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        valueScaling: 'linear',
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        backgroundColor: 'white',
        barBorder: false,
        sortLargestOnTop: true,
        colorScale: scaleOrdinal(schemeCategory10)
    }
};

export default GeminiTrack;

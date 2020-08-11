import { scaleLinear, scaleOrdinal, schemeCategory10, min, max } from 'd3';

export function drawMultipleBarCharts(HGC, obj, tile) {

    // Services
    const { pixiRenderer } = HGC.services;

    const graphics = tile.graphics;

    graphics.clear();
    graphics.removeChildren();

    tile.drawnAtScale = obj._xScale.copy();

    let localGraphics = new HGC.libraries.PIXI.Graphics();

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = obj.getTilePosAndDimensions(tile.tileData.zoomLevel,
        tile.tileData.tilePos, obj.tilesetInfo.tile_size);

    if (obj.options.barBorder || true) {
        localGraphics.lineStyle(1, 0x333333, 0.5, 0);
        tile.barBorders = true;
    }

    const matrix = tile.matrix;
    const trackHeight = obj.dimensions[1];
    const matrixDimensions = tile.tileData.shape;
    const colorScale = obj.options.colorScale || scaleOrdinal(schemeCategory10);
    const width = obj._xScale(tileX + (tileWidth / obj.tilesetInfo.tile_size)) - obj._xScale(tileX);
    const valueToPixels = scaleLinear()
        .domain([0, obj.maxAndMin.max])
        .range([0, trackHeight / matrixDimensions[0]]);

    for (let i = 0; i < matrix[0].length; i++) { // 15
        localGraphics.beginFill(obj.colorHexMap[colorScale[i]]);

        for (let j = 0; j < matrix.length; j++) { // 3000
            const x = obj._xScale(tileX + (j * tileWidth / obj.tilesetInfo.tile_size));
            const height = valueToPixels(matrix[j][i]);
            const y = ((trackHeight / matrixDimensions[0]) * (i + 1) - height);
            obj.addSVGInfo(tile, x, y, width, height, colorScale[i]);
            localGraphics.drawRect(x, y, width, height);
        }

    }

    const texture = pixiRenderer.generateTexture(localGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = obj._xScale(tileX + tileWidth) - obj._xScale(tileX);
    sprite.x = obj._xScale(tileX);
    graphics.addChild(sprite);
}

export function drawVerticalBars(HGC, obj, tile) {

    // Services
    const { pixiRenderer } = HGC.services;

    const matrix = obj.mapOriginalColors(obj.unFlatten(tile));

    const positiveMax = obj.maxAndMin.max;
    const negativeMax = obj.maxAndMin.min;

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = obj.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        obj.tilesetInfo.tile_size
    );

    let graphics = new HGC.libraries.PIXI.Graphics();
    const trackHeight = obj.dimensions[1];

    // get amount of trackHeight reserved for positive and for negative
    const unscaledHeight = positiveMax + (Math.abs(negativeMax));

    // fraction of the track devoted to positive values
    const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

    // fraction of the track devoted to negative values
    const negativeTrackHeight = (Math.abs(negativeMax) * trackHeight) / unscaledHeight;

    let lowestY = obj.dimensions[1];

    const width = 10;

    // calls drawBackground in PixiTrack.js
    obj.drawBackground(matrix, graphics);

    // borders around each bar
    if (obj.options.barBorder || true) {
        graphics.lineStyle(1, 0x333333, 1, 0);
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
            obj.addSVGInfo(tile, x, y, width, height, positive[i].color);
            graphics.beginFill(obj.colorHexMap[positive[i].color]);
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
                obj.addSVGInfo(tile, x, y, width, height, negative[i].color);
                graphics.beginFill(obj.colorHexMap[negative[i].color]);
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
    sprite.width = obj._xScale(tileX + tileWidth) - obj._xScale(tileX);
    sprite.x = obj._xScale(tileX);
    tile.sprite = sprite;
    tile.lowestY = lowestY;
    tile.graphics.addChild(tile.sprite);
}
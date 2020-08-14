export function drawTextSequence(HGC: any, trackInfo: any, tile: any, alt: boolean) {

    let graphics = new HGC.libraries.PIXI.Graphics()

    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        trackInfo.tilesetInfo.tile_size
    )
    const trackHeight = trackInfo.dimensions[1]
    const data = tile.tabularData as { [k: string]: number | string }[]
    const uniquePositions = Array.from(new Set(data.map(d => d['__G__'])))
    const xScale = trackInfo._xScale.copy()
    const barWidth = (xScale(tileX + tileWidth) - xScale(tileX)) / uniquePositions.length

    graphics.alpha = 1.0

    data.forEach(d => {
        const x = (d['__G__'] as number) * barWidth
        const category = d['__N__'] as string
        const number = d['__Q__'] as number

        if (number === 0) return

        const text = new HGC.libraries.PIXI.Text(category, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: 'black',
            fontWeight: 'bold'
        })
        text.width = barWidth * 0.7
        text.height = trackHeight * 0.7
        text.letter = category

        const txMiddle = xScale(tileX) + x + barWidth / 2
        const tyMiddle = trackHeight / 2

        text.anchor.x = 0.5
        text.anchor.y = 0.5
        text.position.x = txMiddle
        text.position.y = tyMiddle

        // pixi
        tile.graphics.addChild(text)

        // svg
        // obj.addSVGInfoText(
        //     tile,
        //     txMiddle,
        //     tyMiddle,
        //     d['__N__'],
        //     alphaSeq
        // );
    })
}
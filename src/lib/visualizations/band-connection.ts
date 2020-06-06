import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema";
import * as d3 from 'd3'
import { getLinkPosition } from "./link";

export function renderBetweenBandLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const xeField = IsChannelDeep(track.xe) ? track.xe.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const x1eField = IsChannelDeep(track.x1e) ? track.x1e.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const yeField = IsChannelDeep(track.ye) ? track.ye.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;
    const y1eField = IsChannelDeep(track.y1e) ? track.y1e.field : undefined;

    const xScale = d3.scaleLinear<number, number>()
        .domain([0, 100]) // TODO:
        .range([bb.x, bb.x + bb.width])
    const yScale = d3.scaleLinear<number, number>()
        .domain([0, 100])
        .range([bb.y, bb.y + bb.height])

    const bands = g.selectAll('.polygon')
        .data(track.data as Datum[])
        .enter()
        .append('polygon')

    const linkPosition = getLinkPosition(track);
    switch (linkPosition) {
        // TODO: better way to merge the codes below?
        case 'left-bottom':
            bands
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
            break;
        case 'left-top':
            bands
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
            break;
        case 'top-right':
            bands
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
            break;
        case 'right-bottom':
            bands
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
            break;
        case 'top-bottom':
            bands
                .attr('points', d => {
                    const yBottom = bb.y + bb.height;
                    const yTop = bb.y;
                    const xTopLeftStart = xScale(d[xField as string] as number);
                    const xTopLeftEnd = xScale(d[xeField as string] as number);
                    const xBottomLeftStart = xScale(d[x1Field as string] as number);
                    const xBottomLeftEnd = xScale(d[x1eField as string] as number);

                    const pointTS = `${xTopLeftStart},${yTop}`;
                    const pointTE = `${xTopLeftEnd},${yTop}`;
                    const pointBS = `${xBottomLeftStart},${yBottom}`;
                    const pointBE = `${xBottomLeftEnd},${yBottom}`;

                    return `${pointTS} ${pointTE} ${pointBE} ${pointBS}`;
                })
                .attr('fill', '#302E82')
                .attr('stroke', 'none')
                .attr('stroke-width', 1)
                .attr('opacity', 0.6)
            break;
        case 'left-right':
            bands
                .attr('x1', bb.x)
                .attr('y1', d => yScale((d[yField as string] as number)))
                .attr('x2', bb.x + bb.width)
                .attr('y2', d => yScale((d[y1Field as string] as number)))
            break;
    }
}
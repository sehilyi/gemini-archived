import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema";
import * as d3 from 'd3'
import { getLinkPosition } from "./link";

export function renderBetweenLineLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;

    const [f1, f2] = [xField, x1Field, yField, y1Field].filter(d => d);

    const xScale = d3.scaleLinear<number, number>()
        .domain([0, 100]) // TODO:
        .range([bb.x, bb.x + bb.width])
    const yScale = d3.scaleLinear<number, number>()
        .domain([0, 100])
        .range([bb.y, bb.y + bb.height])

    const lines = g.selectAll('.line')
        .data(track.data as Datum[])
        .enter()
        .filter(
            // TODO: for demo
            d => Math.abs((d[f1 as string] as number) - (d[f2 as string] as number)) < 30
        )
        .append('line')

    const linkPosition = getLinkPosition(track);
    switch (linkPosition) {
        // TODO: better way to merge the codes below?
        case 'left-bottom':
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
            break;
        case 'left-top':
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
            break;
        case 'top-right':
            lines
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
            break;
        case 'right-bottom':
            lines
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
            break;
        case 'top-bottom':
            lines
                .attr('x1', d => xScale(d[xField as string] as number))
                .attr('y1', bb.y + bb.height)
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
            break;
        case 'left-right':
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale((d[yField as string] as number)))
                .attr('x2', bb.x + bb.width)
                .attr('y2', d => yScale((d[y1Field as string] as number)))
            break;
    }
    // styles
    g.selectAll('line')
        .attr('fill', 'black')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('opacity', 0.3)
}
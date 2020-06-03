import * as d3 from 'd3'
import { GeminiSpec } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec
) {
    g.selectAll('*').remove();

    const PADDING = 10; // TODO: Move this to other proper place.

    // generate data for layout
    const bbs: BoundingBox[] = [];
    let cumY = 0;
    gm.tracks.forEach(track => {
        bbs.push({
            x: 0, width: track.width as number,
            y: cumY, height: track.height as number
        });
        cumY += track.height as number + PADDING;
    });

    g.selectAll('rect')
        .data(bbs)
        .enter()
        .append('rect')
        .attr('x', d => d.x)
        .attr('width', d => d.width)
        .attr('y', d => d.y)
        .attr('height', d => d.height)
        .attr('fill', '#F6F6F6')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)
}
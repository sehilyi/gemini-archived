import * as d3 from 'd3'
import { GeminiSpec } from '../gemini.schema';
import { BoundingBox } from './bounding-box';

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
            x: 0, x1: track.width as number,
            y: cumY, y1: cumY + (track.height as number)
        });
        cumY += track.height as number + PADDING;
    });

    g.selectAll('rect')
        .data(bbs)
        .enter()
        .append('rect')
        .attr('x', d => d.x)
        .attr('width', d => d.x1 - d.x)
        .attr('y', d => d.y)
        .attr('height', d => d.y1 - d.y)
        .attr('fill', '#F6F6F6')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)
}
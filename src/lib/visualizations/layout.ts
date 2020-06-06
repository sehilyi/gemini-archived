import * as d3 from 'd3'
import { GeminiSpec, Track, GenericType, Channel, Datum, IsChannelDeep } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';
import { DUMMY_LINK_DATA } from '../test/data/link-data';
import { DUMMY_BAND_DATA } from '../test/data/band-data';
import { renderLink } from './link';
import { VIEW_PADDING } from './defaults';
import { renderHiGlass, HiGlassTrack } from './higlass';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void
) {
    g.selectAll('*').remove();

    // Generate layout data
    const tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[] = [];
    let cumY = 0, cumX = 0;
    gm.tracks.forEach(track => {
        // TODO: for demo
        if (track.data === "dummy-link") track.data = DUMMY_LINK_DATA;
        else if (track.data === "dummy-band") track.data = DUMMY_BAND_DATA;
        ///
        if (gm.layout?.direction !== "horizontal") {
            tracksWithBB.push({
                bb: {
                    x: 0, width: track.width as number,
                    y: cumY, height: track.height as number
                },
                track
            });
            cumY += track.height as number + VIEW_PADDING;
        }
        else {
            tracksWithBB.push({
                bb: {
                    x: cumX, width: track.width as number,
                    y: 0, height: track.height as number
                },
                track
            });
            cumX += track.width as number + VIEW_PADDING;
        }
    });

    g.selectAll('rect')
        .data(tracksWithBB)
        .enter()
        .filter(d => d.track.mark !== 'link-between' && d.track.mark !== 'empty')
        .append('rect')
        .attr('x', d => d.bb.x)
        .attr('width', d => d.bb.width)
        .attr('y', d => d.bb.y)
        .attr('height', d => d.bb.height)
        .attr('fill', '#F6F6F6')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)

    // Render links and bands
    renderLink(g, tracksWithBB.filter(d => d.track.mark === 'link-between'));

    // Render HiGlass tracks
    renderHiGlass(g, tracksWithBB, setHiGlassInfo);
}
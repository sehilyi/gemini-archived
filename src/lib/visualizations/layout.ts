import * as d3 from 'd3'
import { GeminiSpec, Track, GenericType, Channel, IsHiGlassTrack, IsNotEmptyTrack, IsTrackStyle, TrackStyle } from '../gemini.schema';
import { BoundingBox, INNER_CIRCLE_RADIUS } from '../utils/bounding-box';
import { renderBetweenLink } from './link';
import { VIEW_PADDING } from './defaults';
import { renderHiGlass, HiGlassTrack } from './higlass';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    left: number,
    top: number
) {
    g.selectAll('*').remove();

    // Generate layout data
    const trackInfo: { bb: BoundingBox, track: Track | GenericType<Channel> }[] = [];
    let cumY = top, cumX = left;
    const UniBB = {
        x: left, y: top,
        // TODO: Better organize this!
        width: d3.sum(gm.tracks.map(d => IsNotEmptyTrack(d) ? d.width as number : 100 /* TODO: default width */)) + ((gm.tracks.length - 1) * VIEW_PADDING),
        height: d3.sum(gm.tracks.map(d => IsNotEmptyTrack(d) ? d.height as number : 100 /* TODO: default width */)) + ((gm.tracks.length - 1) * VIEW_PADDING)
    }
    // TODO: Better organize this!
    gm.tracks.forEach(track => {
        if (!IsNotEmptyTrack(track)) {
            return;
        }
        // TODO: support `wrap`
        if (gm.layout?.direction === "horizontal") {
            // Adjacent first
            if (gm.layout.type === "circular") {
                const size = track.height as number // Height is used for the size of circle.
                trackInfo.push({
                    bb: {
                        x: left, width: size,
                        y: top, height: size,
                        startAngle:
                            (Math.PI * 2) * (cumX - left) / UniBB.width,
                        endAngle:
                            (Math.PI * 2) * (cumX - left + (track.width as number)) / UniBB.width
                    },
                    track
                })
                cumX += (track.width as number) + VIEW_PADDING
            }
            else {
                trackInfo.push({
                    bb: {
                        x: cumX, width: track.width as number,
                        y: top, height: track.height as number
                    },
                    track
                })
                cumX += track.width as number + VIEW_PADDING;
            }
        }
        else {
            // Stack first
            if (gm.layout?.type === "circular") {
                const size = track.height as number // Height is used for the size of circle.
                trackInfo.push({
                    bb: {
                        x: cumX, width: size,
                        y: cumY, height: size,
                        startAngle: 0,
                        endAngle: Math.PI * 2
                    },
                    track
                })
                cumX += size + VIEW_PADDING
                cumY += size + VIEW_PADDING
            }
            else {
                trackInfo.push({
                    bb: {
                        x: left, width: track.width as number,
                        y: cumY, height: track.height as number
                    },
                    track
                })
                cumY += track.height as number + VIEW_PADDING;
            }
        }
    });

    const trackStyle = {
        background: (track: Track) => track.style?.background ?? 'white',
        stroke: () => 'lightgray',
        strokeWidth: () => 1
    }

    if (gm.layout?.type === 'circular') {
        const angleGap = Math.PI / 80.0;

        const totalSize = d3.sum(trackInfo.map(d => d.bb.height)) + INNER_CIRCLE_RADIUS * 2;

        console.log('arcs', trackInfo);
        g.append('g')
            .attr('transform', `translate(${left + totalSize / 2.0}, ${top + totalSize / 2.0})`)
            .selectAll('path')
            .data(trackInfo)
            .enter()
            .append('path')
            .attr('fill', d => trackStyle.background(d.track as Track))
            .attr('stroke', trackStyle.stroke())
            .attr('stroke-width', trackStyle.strokeWidth())
            .attr('d', d => d3.arc()
                .innerRadius(d.bb.x)
                .outerRadius(d.bb.x + d.bb.width)({
                    ...d.bb,
                    // Add pi to rotate 180deg
                    startAngle: (d.bb.startAngle ?? 0) + Math.PI + angleGap / 2.0,
                    endAngle: (d.bb.endAngle ?? 0) + Math.PI - angleGap / 2.0,
                } as any)
            )
    }
    else {
        // Render track backgrounds
        g.selectAll('rect')
            .data(trackInfo
                // .filter(d => d.track.mark !== "link-between" && d.track.mark !== 'link-within' && d.track.mark !== 'empty')
            )
            .enter()
            .append('rect')
            .attr('x', d => d.bb.x)
            .attr('width', d => d.bb.width)
            .attr('y', d => d.bb.y)
            .attr('height', d => d.bb.height)
            .attr('fill', d => trackStyle.background(d.track as Track))
            .attr('stroke', trackStyle.stroke())
            .attr('stroke-width', trackStyle.strokeWidth())

        // Render links and bands
        renderBetweenLink(g, trackInfo.filter(d => d.track.mark === 'link-between'));

        // Render HiGlass tracks
        renderHiGlass(g, trackInfo.filter(d => IsHiGlassTrack(d.track)), setHiGlassInfo);
    }
}
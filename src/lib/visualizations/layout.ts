import * as d3 from 'd3'
import { GeminiSpec, Track } from '../gemini.schema';
import { HiGlassTrack } from './higlass';
import { BoundingBox } from '../utils/bounding-box';
import { renderCircularLayout } from './layout-circular';
import { renderLinearLayout } from './layout-linear';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    g.selectAll('*').remove();

    if (gm.layout?.type === 'circular') {
        renderCircularLayout(g, gm, setHiGlassInfo, boundingBox)
    } else {
        renderLinearLayout(g, gm, setHiGlassInfo, boundingBox)
    }
}

export const trackStyle = {
    background: (track: Track) => track.style?.background ?? 'white',
    stroke: (track: Track) => track.style?.stroke ?? '#E2575A',   // TODO: for demo
    strokeWidth: (track: Track) => track.style?.strokeWidth ?? 1
}
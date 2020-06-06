import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema";
import * as d3 from 'd3'
import { validateBetweenLinkSpec } from "./link-validate";
import { getChartType } from "./chart-type";
import { renderBetweenLineLink } from "./line-connection";
import { renderBetweenBandLink } from "./band-connection";

export type LinkPosition =
    | 'left-bottom'
    | 'left-top'
    | 'left-right'
    | 'top-right'
    | 'top-bottom'
    | 'right-bottom'
    | 'unknown'

export function getLinkPosition(track: Track | GenericType<Channel>): LinkPosition {
    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;

    if (xField && yField) return 'left-bottom';
    else if (x1Field && yField) return 'left-top';
    else if (x1Field && y1Field) return 'top-right';
    else if (xField && y1Field) return 'right-bottom';
    else if (xField && x1Field) return 'top-bottom';
    else if (yField && y1Field) return 'left-right';
    else return 'unknown';
}

export function renderBetweenLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[]
) {
    tracksWithBB.forEach(tb => {
        // validate
        const valid = validateBetweenLinkSpec(tb.track);
        if (!valid.isValid()) {
            valid.printValidity();
            return;
        }
        // render
        switch (getChartType(tb.track)) {
            case 'line-connection':
                renderBetweenLineLink(g, tb.track, tb.bb);
                break;
            case 'band-connection':
                renderBetweenBandLink(g, tb.track, tb.bb);
                break;
            default:
                break;
        }
    });
}
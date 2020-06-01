import { Track, Channel, GenericType, IsGlyphMark, MarkGlyph, IsChannelDeep } from "../gemini.schema";
import { deepToLongElements } from "../utils/spec-preprocess";

export class TrackModel {
    private track: Track | GenericType<Channel>;
    constructor(track: Track | GenericType<Channel>) {
        this.track = track;

        // TODO: Check if required channels are specified.
        // ...

        // Add default specs
        if (IsGlyphMark(track.mark)) {
            track.mark.elements = deepToLongElements(track.mark.elements);
        }

        // Prepare rendering
        this.setScales();
    }
    public getTrack() {
        return this.track;
    }

    public getElements() {
        if (IsGlyphMark(this.track.mark)) {
            return this.track.mark.elements;
        }
        return [];
    }

    private setScales() {
        const { mark, x, x1, y, y1, color, opacity } = this.track;

        if (IsGlyphMark(this.track.mark)) {
            const { name, requiredChannels, elements } = this.track.mark;

            // fields
            // const xField = IsChannelDeep(x) ? x.field : undefined;
            // const x1Field = IsChannelDeep(x1) ? x1.field : undefined;
            // const yField = IsChannelDeep(y) ? y.field : undefined;
            // const y1Field = IsChannelDeep(y1) ? y1.field : undefined;

            // // channels
            // const channelsToFields: { [k: string]: string } = {};
            // requiredChannels.forEach(c => {
            //     channelsToFields[c] = ((track as GenericType<Channel>)[c] as ChannelDeep)?.field;
            // });

            // // scales
            // let xValues: any[] = [], yValues: any[] = [];
            // if (xField) {
            //     xValues = xValues.concat(data.map(d => d[xField]));
            // }
            // if (x1Field) {
            //     xValues = xValues.concat(data.map(d => d[x1Field]));
            // }
            // if (yField) {
            //     yValues = yValues.concat(data.map(d => d[yField]));
            // }
            // if (y1Field) {
            //     yValues = yValues.concat(data.map(d => d[y1Field]));
            // }
            // const xDomain = d3.extent(xValues) as number[];
            // const yDomain = d3.set(yValues).values();
            // const xRange = [boundingBox.x, boundingBox.x1];
            // const yRange = [boundingBox.y, boundingBox.y1];
            // const xScale = d3.scaleLinear().domain(xDomain).range(xRange);
            // const yScale = d3.scaleOrdinal().domain(yDomain).range(xRange);
        }
    }
}
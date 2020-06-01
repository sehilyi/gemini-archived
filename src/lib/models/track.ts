import { Track, Channel, GenericType, IsGlyphMark, MarkGlyph, IsChannelDeep, ChannelDeep, Datum, ChannelType } from "../gemini.schema";
import { deepToLongElements } from "../utils/spec-preprocess";
import * as d3 from "d3";
import { BoundingBox } from "../visualizations/bounding-box";

export class TrackModel {
    private track: Track | GenericType<Channel>;
    private channelToField: { [k: string]: string };
    private domains: { [channel: string]: (string | number)[] };
    private scales: { [channel: string]: d3.ScaleLinear<any, any> | d3.ScaleOrdinal<any, any> };
    private ranges: { [channel: string]: number[] };
    constructor(track: Track | GenericType<Channel>) {
        this.track = track;
        this.domains = {};
        this.channelToField = {};
        this.scales = {};
        this.ranges = {};

        /**
         * Validate
         */
        // TODO: Check if required channels are specified.
        // ...

        /**
         * Default
         */
        if (IsGlyphMark(track.mark)) {
            track.mark.elements = deepToLongElements(track.mark.elements);
        }

        /**
         * Prepare Rendering
         */
        this.setDomains();
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

    public getFieldByChannel(field: string) {
        return this.channelToField[field];
    }

    private setDomains() {
        const data = this.track.data as Datum[];

        if (IsGlyphMark(this.track.mark)) {
            const { requiredChannels: required } = this.track.mark;

            // Add channel-to-domain mappings when `field` suggested.
            required.forEach(c => {
                const channel = (this.track as GenericType<Channel>)[c];
                if (IsChannelDeep(channel)) {
                    const { field } = channel;
                    this.channelToField[c] = field;

                    // Domains for x1 and y1 needs to be added to that of x and y, respectively.
                    const targetChannel =
                        c === 'x1' ? 'x'
                            : c === 'y1' ? 'y'
                                : c;

                    if (!this.domains[targetChannel]) {
                        this.domains[targetChannel] = [];
                    }
                    this.domains[targetChannel] = [
                        ...this.domains[targetChannel],
                        ...data.map(d => d[field])
                    ]
                }
            });
            Object.keys(this.domains).forEach(c => {
                const channel = (this.track as GenericType<Channel>)[c];
                if (IsChannelDeep(channel)) {
                    const { type } = channel;
                    this.domains[c] = type === "nominal"
                        ? d3.set(this.domains[c]).values()
                        : d3.extent(this.domains[c] as number[]) as [number, number]
                }
            });
        }
    }

    private setRanges(bb: BoundingBox) {
        Object.keys(this.domains).forEach(c => {
            const channel = (this.track as GenericType<Channel>)[c];
            if (IsChannelDeep(channel)) {
                if (c === 'x') {
                    this.ranges['x'] = [bb.x, bb.x1];
                } else if (c === 'y') {
                    this.ranges['y'] = [bb.y, bb.y1];
                } else {
                    // TODO: Support specifying `range` and `domain`.
                    // ...
                }
            }
        });
    }

    public setScales(boundingBox: BoundingBox) {
        this.setRanges(boundingBox);
        Object.keys(this.domains).forEach(c => {
            const channel = (this.track as GenericType<Channel>)[c];
            if (IsChannelDeep(channel)) {
                const { type } = channel;
                if (this.ranges[c]) {
                    this.scales[c] = type === "nominal"
                        ? d3.scaleOrdinal()
                            .domain(this.domains[c] as string[])
                            .range(this.ranges[c])
                        : d3.scaleLinear()
                            .domain(this.domains[c] as [number, number])
                            .range(this.ranges[c]);
                }
            }
        });
    }

    public getScale(c: ChannelType | string) {
        return this.scales[c];
    }
}
import * as d3 from "d3";
import { BoundingBox } from "./bounding-box";
import { Track, Datum, ChannelDeep, GenericType, GlyphElement, ChannelBind, IsChannelDeep, Channel, MarkGlyph, IsGlyphMark, MarkDeep, ChannelValue, IsChannelValue } from "../gemini.schema";
import { transformData, FilterSpec } from "../utils/data-process";
import { deepToLongElements } from "../utils/spec-preprocess";
import { DEFAULT_VISUAL_PROPERTIES } from "./defaults";
import { TrackModel } from "../models/track";

export function renderGlyph(
    gSelection: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    boundingBox: BoundingBox
) {
    const {
        mark,
        x,
        x1,
        y,
        y1,
        color,
        opacity
    } = track;

    const trackModel = new TrackModel(track);

    // checks
    const data = track.data as Datum[];
    if (!data) {
        console.warn("No array of a JSON object suggested.");
        return;
    }

    const markDeep = mark as MarkGlyph;
    if (!IsGlyphMark(markDeep)) {
        console.warn("Glyph is not defined.");
        return;
    }
    /////////////

    const {
        name,
        requiredChannels,
        elements
    } = markDeep;

    // TODO: Add title using `name`
    // ...

    // Fields
    const xField = IsChannelDeep(x) ? x.field : undefined;
    const x1Field = IsChannelDeep(x1) ? x1.field : undefined;
    const yField = IsChannelDeep(y) ? y.field : undefined;
    const y1Field = IsChannelDeep(y1) ? y1.field : undefined;

    // Channels
    const channelsToFields: { [k: string]: string } = {};
    requiredChannels.forEach(c => {
        channelsToFields[c] = ((track as GenericType<Channel>)[c] as ChannelDeep)?.field;
    });

    // Scales
    let xValues: any[] = [], yValues: any[] = [];
    if (xField) {
        xValues = xValues.concat(data.map(d => d[xField]));
    }
    if (x1Field) {
        xValues = xValues.concat(data.map(d => d[x1Field]));
    }
    if (yField) {
        yValues = yValues.concat(data.map(d => d[yField]));
    }
    if (y1Field) {
        yValues = yValues.concat(data.map(d => d[y1Field]));
    }
    const xDomain = d3.extent(xValues) as number[];
    const yDomain = d3.set(yValues).values();
    const xRange = [boundingBox.x, boundingBox.x1];
    const yRange = [boundingBox.y, boundingBox.y1];
    const xScale = d3.scaleLinear().domain(xDomain).range(xRange);
    const yScale = d3.scaleOrdinal().domain(yDomain).range(xRange);

    // Render each element
    trackModel.getElements().forEach(element => {
        const {
            description: descriptionE,
            select: selectE,
            mark: markE,
            x: xE,
            x1: x1E,
            y: yE,
            y1: y1E,
            color: colorE,
            size: sizeE
        } = element;

        // Select
        const filters: FilterSpec[] = [];
        selectE?.forEach(d => {
            const { channel, equal } = d;
            if (channelsToFields[channel]) {
                filters.push({ field: channelsToFields[channel], equal });
            }
        });

        // Channels
        const glyphChannelsToFields: { [k: string]: any } = {};
        requiredChannels.forEach(_c => {
            const c = _c as keyof GlyphElement;
            glyphChannelsToFields[c] =
                channelsToFields[(element[c] as ChannelBind)?.bind] ??
                channelsToFields[c];
        });

        // Render glyph
        const transformed_data = transformData(data, filters);
        if (markE === "line") {
            const isAggregate = true;
            if (isAggregate) {
                // TODO:
                gSelection.selectAll()
                    .data(transformed_data)
                    .enter()
                    .append('line')
                    .attr('stroke', (colorE as ChannelValue).value)
                    .attr('x1', d => {
                        return xScale(d[glyphChannelsToFields['x']] as number);
                    })
                    .attr('x2', d => xScale(d[glyphChannelsToFields['x1']] as number))
                    .attr('y1', d => yScale(d[glyphChannelsToFields['y']] as string) as number)
                    .attr('y2', d => yScale(d[glyphChannelsToFields['y']] as string) as number)
                    .attr('stroke-width', (sizeE as ChannelValue).value)
                    .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
            }
        } else if (markE === "rect") {
            gSelection.selectAll()
                .data(transformed_data)
                .enter()
                .append('rect')
                .attr('fill', "blue")
                .attr('x', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('width', d => xScale(d[glyphChannelsToFields['x1']] as number) - xScale(d[glyphChannelsToFields['x']] as number))
                .attr('y', d => yScale(d[glyphChannelsToFields['y']] as string) as number - ((sizeE as ChannelValue).value as number) / 2.0)
                .attr('height', (sizeE as ChannelValue).value)
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'text') {
            gSelection.selectAll()
                .data(transformed_data)
                .enter()
                .append('text')
                .text(d => d["gene_name"])
                .attr('fill', (colorE as ChannelValue).value)
                .attr('x', d => xScale(d[glyphChannelsToFields['x']] as number) as number + (xScale(d[glyphChannelsToFields['x1']] as number) - xScale(d[glyphChannelsToFields['x']] as number)) / 2.0)
                .attr('y', d => yScale(d[glyphChannelsToFields['y']] as string) as number - 20)
                .attr('alignment-baseline', "top")
                .attr('text-anchor', "middle")
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'rule') {
            gSelection.selectAll('line')
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('stroke', (colorE as ChannelValue).value)
                .attr('x1', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('x2', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('y1', d => yScale(d[glyphChannelsToFields['y']] as string) as number - ((sizeE as ChannelValue).value as number) / 2.0)
                .attr('y2', d => yScale(d[glyphChannelsToFields['y']] as string) as number + ((sizeE as ChannelValue).value as number) / 2.0)
                .attr('stroke-width', 3)
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'point') {
            gSelection.selectAll('circle')
                .data(transformed_data)
                .enter()
                .append('circle')
                .attr('fill', (colorE as ChannelValue).value)
                .attr('cx', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('cy', d => xScale(d[glyphChannelsToFields['y']] as number) as number)
                .attr('r', 15)
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        }
    });
}
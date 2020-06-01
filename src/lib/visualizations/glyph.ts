import * as d3 from "d3";
import { BoundingBox } from "./bounding-box";
import { Track, Datum, ChannelDeep, GenericType, GlyphElement, ChannelBind, IsChannelDeep, Channel, MarkGlyph, IsGlyphMark, MarkDeep, ChannelValue, IsChannelValue } from "../gemini.schema";
import { transformData, FilterSpec } from "../utils/data-process";
import { DEFAULT_VISUAL_PROPERTIES } from "./defaults";
import { TrackModel } from "../models/track";

export function renderGlyph(
    gSelection: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    boundingBox: BoundingBox
) {
    const { mark, opacity } = track;

    const trackModel = new TrackModel(track);

    trackModel.setScales(boundingBox);

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

    const { requiredChannels } = markDeep;

    // TODO: Add title using `name`
    // ...

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
            if (trackModel.getFieldByChannel(channel)) {
                filters.push({ field: trackModel.getFieldByChannel(channel), equal });
            }
        });

        // Channels
        const glyphChannelsToFields: { [k: string]: any } = {};
        requiredChannels.forEach(_c => {
            const c = _c as keyof GlyphElement;
            glyphChannelsToFields[c] =
                trackModel.getFieldByChannel((element[c] as ChannelBind)?.bind) ??
                trackModel.getFieldByChannel(c);
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
                        return trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any);
                    })
                    .attr('x2', d => trackModel.getScale('x')(d[glyphChannelsToFields['x1']] as any))
                    .attr('y1', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number)
                    .attr('y2', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number)
                    .attr('stroke-width', (sizeE as ChannelValue).value)
                    .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
            }
        } else if (markE === "rect") {
            gSelection.selectAll()
                .data(transformed_data)
                .enter()
                .append('rect')
                .attr('fill', "blue")
                .attr('x', d => trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any) as number)
                .attr('width', d => trackModel.getScale('x')(d[glyphChannelsToFields['x1']] as any) - trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any))
                .attr('y', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number - ((sizeE as ChannelValue).value as number) / 2.0)
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
                .attr('x', d => trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any) as number + (trackModel.getScale('x')(d[glyphChannelsToFields['x1']] as any) - trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any)) / 2.0)
                .attr('y', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number - 20)
                .attr('alignment-baseline', "top")
                .attr('text-anchor', "middle")
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'rule') {
            gSelection.selectAll('line')
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('stroke', (colorE as ChannelValue).value)
                .attr('x1', d => trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any) as number)
                .attr('x2', d => trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any) as number)
                .attr('y1', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number - ((sizeE as ChannelValue).value as number) / 2.0)
                .attr('y2', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number + ((sizeE as ChannelValue).value as number) / 2.0)
                .attr('stroke-width', 3)
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'point') {
            gSelection.selectAll('circle')
                .data(transformed_data)
                .enter()
                .append('circle')
                .attr('fill', (colorE as ChannelValue).value)
                .attr('cx', d => trackModel.getScale('x')(d[glyphChannelsToFields['x']] as any) as number)
                .attr('cy', d => trackModel.getScale('y')(d[glyphChannelsToFields['y']] as any) as number)
                .attr('r', 15)
                .attr('opacity', IsChannelValue(opacity) ? opacity.value : DEFAULT_VISUAL_PROPERTIES.opacity);
        }
    });
}
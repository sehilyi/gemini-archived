import Ajv from 'ajv';
import HiGlassSchema from "./higlass.schema.json";
import { HiGlassSpec, EnumTrackType } from "./higlass.schema";
import { HiGlassModel } from './higlass-model';
import { parseServerAndTilesetUidFromUrl, validTilesetUrl } from '../utils';
import { GenericType, Track, Channel, IsDataDeep, IsHiGlassTrack, IsChannelDeep } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';

export function compiler(track: Track | GenericType<Channel>, bb: BoundingBox): HiGlassSpec {

    const higlass = new HiGlassModel();

    if (IsHiGlassTrack(track.mark) && IsDataDeep(track.data) && validTilesetUrl(track.data.url)) {
        const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data.url);

        // Is this track horizontal or vertical?
        const isXGenomic = IsChannelDeep(track.x) && track.x.type === "genomic"
        const isYGenomic = IsChannelDeep(track.y) && track.y.type === "genomic"
        const trackDirection = isXGenomic && isYGenomic ? 'both' : isXGenomic ? 'horizontal' : 'vertical'

        const typeMap: { [k: string]: EnumTrackType } = {
            // TODO: Add horizontal vs. vertical
            'gene-annotation-higlass': `${trackDirection}-gene-annotations`
            // ...
        } as { [k: string]: EnumTrackType }

        const higlassTrackType = typeMap[track.mark.type];
        if (!higlassTrackType) return {};

        higlass.setMainTrack({
            type: higlassTrackType,
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width,
            height: bb.height // TODO: consider the height of axes
        }).addTrackSourceServers(server);

        const chanToPos: { [k: string]: 'left' | 'right' | 'top' | 'bottom' } = {
            x: 'bottom',
            x1: 'top',
            y: 'left',
            y1: 'right'
        }
        Object.keys(chanToPos).forEach(c => {
            const channelDef = (track as GenericType<Channel>)[c];
            if (IsChannelDeep(channelDef) && channelDef.axis) {
                higlass.setAxisTrack(chanToPos[c]);
            }
        })

        higlass.validateSpec();

        return higlass.spec();
    }
    return {};
}

export function validateHG(hg: HiGlassSpec): boolean {

    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
} 
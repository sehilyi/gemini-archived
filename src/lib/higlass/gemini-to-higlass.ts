import Ajv from 'ajv';
import HiGlassSchema from "./higlass.schema.json";
import { HiGlassSpec, Track as HGTrack } from "./higlass.schema";
import { HiGlassModel } from './higlass-model';
import mapper from '../compile-mapper';
import { generateReadableTrackUid, parseServerAndTilesetUidFromUrl } from '../utils';

export function compile(): HiGlassSpec {

    const higlass = new HiGlassModel();

    // const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data);
    // hg.addTrack(track.position, {
    //     uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
    //     type: hgToHlTrackType(track.type, track.position),
    //     server: server,
    //     tilesetUid: tilesetUid,
    //     width: mapper.sizeToWidthOrHeight(track).width,
    //     height: mapper.sizeToWidthOrHeight(track).height
    // }).addTrackSourceServers(server);

    higlass.validateSpec();

    return higlass.spec();
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
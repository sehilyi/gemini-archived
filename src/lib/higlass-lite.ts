import Ajv from 'ajv';
import HiGlassSchema from "./higlass.schema.json";
import { HiGlassLiteSpec } from "./higlass-lite.schema";
import { HiGlassSpec } from "./higlass.schema";
import { HiGlassModel } from './higlass-model';
import { HiGlassLiteModel } from './higlass-lite-model';
import { parseServerAndTilesetUidFromUrl, hgToHlTrackType } from './utils';

// TODO: Auto-generate readable uids.

export function compile(ihl: HiGlassLiteSpec): HiGlassSpec {

    // TODO: Early return with invalidate specs.
    // ...

    const hl = new HiGlassLiteModel(ihl);
    const hg = new HiGlassModel();

    // config.
    hg.setEditable(hl.spec().config?.editable)
        .setChromInfoPath(hl.spec().config?.chromInfoPath);

    // views.
    for (let v = 0; v < hl.spec().views.length; v++) {
        const view = hl.spec().views[v];

        hg.addNewView(view);

        for (let t = 0; t < view.tracks.length; t++) {
            const track = view.tracks[t];

            /**
             * Axis on the top or left.
             */
            if (track.xAxis === true || track.xAxis === "top") {
                const axisP = track.position === "center" ? "top" : track.position;
                hg.addTrack(axisP, {
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30 // TODO: default value.
                });
            }
            if (track.yAxis === true || track.yAxis === "left") {
                const axisP = track.position === "center" ? "left" : track.position;
                hg.addTrack(axisP, {
                    type: "vertical-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30 // TODO: default value.
                });
            }

            /**
             * Main track.
             */
            const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data);
            hg.addTrack(track.position, {
                uid: track.uniqueName,
                type: hgToHlTrackType(track.type, track.position),
                server: server,
                tilesetUid: tilesetUid,
                width: track.width,
                height: track.height
            }).addTrackSourceServers(server);

            /**
             * Axis on the bottom or right.
             */
            if (track.xAxis === "bottom") {
                const axisP = track.position === "center" ? "bottom" : track.position;
                hg.addTrack("bottom", {
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30 // TODO: default value.
                });
            }
            if (track.yAxis === true || track.yAxis === "right") {
                const axisP = track.position === "center" ? "right" : track.position;
                hg.addTrack(axisP, {
                    type: "vertical-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30 // TODO: default value.
                });
            }
        }
    }

    // TODO: Validate.
    validateHG(hg.spec());

    return hg.spec();
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
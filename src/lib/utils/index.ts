import Ajv from 'ajv';
import uuid from "uuid";
import { GeminiSpec, Mark } from '../gemini.schema';
import { PREDEFINED_GLYPHS_TYPES, PREDEFINED_GLYPHS_TYPE, PREDEFINED_GLYPHS } from "../test/gemini/glyph";

export function replaceGlyphs(spec: GeminiSpec): GeminiSpec {
    for (let i = 0; i < spec.views.length; i++) {
        const view = spec.views[i];
        for (let j = 0; j < view.tracks.length; j++) {
            const track = view.tracks[j];
            if (PREDEFINED_GLYPHS_TYPES.includes(track.mark as PREDEFINED_GLYPHS_TYPE)) {
                track.mark = PREDEFINED_GLYPHS.find(d => d.name === track.mark as PREDEFINED_GLYPHS_TYPE)?.mark as Mark;
            }
        }
    }
    return spec;
}

export function generateReadableTrackUid(pre: string | undefined, n: number) {
    // TODO: Add track type

    // TODO: This is to properly update higlass upon editor changes. Ultimately, remove this.
    // (Refer to https://github.com/sehilyi/gemini/issues/7)
    const id = uuid.v1();
    if (pre) return `${pre}-track-${n}-(${id})`;
    else return `track-${n}-${id}`;
}

export function parseServerAndTilesetUidFromUrl(url: string) {
    if (!url.includes("tileset_info/?d=") || (
        !url.includes("https:") && !url.includes("http:")
    )) {
        // TODO: Add RE to validate the format.
        console.warn("Data url format is incorrect.");
        return { server: undefined, tilesetUid: undefined };
    }

    const pre = url.includes("https:") ? "https:" : "http:";

    const server = url.split("tileset_info/?d=")[0].split(pre)[1];
    const tilesetUid = url.split("tileset_info/?d=")[1]
    return { server, tilesetUid };
}

export function validateHG(hg: any): boolean {

    const validate = new Ajv({ extendRefs: true }).compile({ /*  */ });
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
}
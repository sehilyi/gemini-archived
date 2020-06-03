import { GeminiSpec } from "../gemini.schema";

/**
 * Naive approach to calculate the entire size of visualization.
 * @param gm 
 */
export function calculateSize(gm: GeminiSpec) { // TODO: Use model?
    const PADDING = 10; // TODO: Move this to other proper place.
    const size = { width: 0, height: 0 };
    gm.tracks.forEach((track, i) => {
        // currently, only stacking
        size.height += ((track.height as number) ?? 0);
        if (i !== gm.tracks.length - 1) size.height += PADDING;
        size.width = Math.max((track.width as number) ?? 0, size.width);
    });
    return size;
}
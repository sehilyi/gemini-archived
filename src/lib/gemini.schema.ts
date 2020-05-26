// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { PREDEFINED_GLYPHS_TYPE } from "./test/gemini/glyph";

export interface GeminiSpec {
    views: View[];
}
interface View {
    tracks: Track[];
}

type ChannelType = "x" | "y" | "color" | "x1" | "y1" | "category" | "category1";

interface Track {
    // Primitive.
    data: string;
    mark: Mark;
    x?: Channel;
    y?: Channel;
    color?: Channel;

    x1?: Channel;
    y1?: Channel;

    category?: Channel;
    category1?: Channel;

    // Styles.
    width?: number;
    height?: number;
}

export type Mark = PrimitiveMarkType | GlyphMarkPredevined | MarkDeep;
type PrimitiveMarkType = "bar" | "point" | "line" | "rect" | "text" | SymbolMarkType;
type SymbolMarkType = "triangle-l" | "triangle-r";
type GlyphMarkType = "glyph";
type GlyphMarkPredevined = PREDEFINED_GLYPHS_TYPE;

export type MarkDeep = {
    type: PrimitiveMarkType | GlyphMarkType;
    name: string;
    referenceColumn?: string;   // A reference column for making `glyph`.
    requiredChannels: ChannelType[];    // Channels that must be assigned.
    elements: GlyphElement[];
}

/**
 * Custom Glyph.
 */
interface GlyphElement {
    description?: string;
    select?: { channel: "category" | "category1", equal: string }[];
    mark: PrimitiveMarkType;

    x?: null | GlyphChannel;
    y?: null | GlyphChannel;
    x1?: null | GlyphChannel;
    y1?: null | GlyphChannel;
    color?: null | string | GlyphChannel;
    size?: null | number | GlyphChannel;
}

interface GlyphMarkDeep {
    field: string;
    domain: string[];
    range: PrimitiveMarkType[];
}
type Aggregate = "max" | "min" | "mean";

interface GlyphChannel {
    bind: ChannelType;
    aggregate?: Aggregate;
}

interface Channel {
    field: string;
    type: "nominal" | "quantitative";
    aggregate?: Aggregate;
}

interface Data {
    type?: string;  // TODO: What kinds of types exist?
    children?: any[];
    tiles?: Object;
    tilesetInfo?: Object;
}

interface Consistency {
    /**
     * `true` and `false` correspond to "shared" and "independent", respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[];
    // Default: The first element of `targets`.
    reference?: string;
    color?: "shared" | "independent" | "distinct" | true | false;
    x?: "shared" | "independent" | true | false;
    y?: "shared" | "independent" | true | false;
    zoomScale?: "shared" | "independent" | true | false;
    zoomCenter?: "shared" | "independent" | true | false;
}
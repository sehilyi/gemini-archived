import { GENE_ANNOTATION_PLOT, GENE_ANNOTATION_PLOT_SIMPLE } from "../lib/test/gemini/gene-annotation-plots";
import { CYTOGENETIC_BAND } from "../lib/test/gemini/cytogenetic-band";
import { LAYOUT_EXAMPLE_LINK, LAYOUT_EXAMPLE_COMBO, LAYOUT_EXAMPLE_COMBO_BAND } from "../lib/test/gemini/layout-examples";
import { GeminiSpec } from "../lib/gemini.schema";
import { LAYOUT_EXAMPLE_COMBO_HORIZONTAL } from "../lib/test/gemini/layout-examples";
import { LAYOUT_EXAMPLE_DOMINO } from "../lib/test/gemini/layout-examples";

interface Demo {
    name: string,
    spec: GeminiSpec,
    glyphWidth: number,
    glyphHeight: number
}

export const demos: ReadonlyArray<Demo> = [
    {
        name: "Gene Annotation Plot (Simple)",
        spec: GENE_ANNOTATION_PLOT_SIMPLE,
        glyphWidth: 300,
        glyphHeight: 300
    },
    {
        name: "Gene Annotation Plot",
        spec: GENE_ANNOTATION_PLOT,
        glyphWidth: 600,
        glyphHeight: 300
    },
    {
        name: "Cytogenetic Band",
        spec: CYTOGENETIC_BAND,
        glyphWidth: 900,
        glyphHeight: 300
    },
    {
        name: "Six Different Between-Links",
        spec: LAYOUT_EXAMPLE_LINK,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: "Between-Links (Combo)",
        spec: LAYOUT_EXAMPLE_COMBO,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: "Between-Links (Combo, Horizontal)",
        spec: LAYOUT_EXAMPLE_COMBO_HORIZONTAL,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: "Between-Bands (Combo)",
        spec: LAYOUT_EXAMPLE_COMBO_BAND,
        glyphWidth: 0,
        glyphHeight: 0
    },
    /*
    // TODO: not ready
    {
        name: "Between-Links (Domino)",
        spec: LAYOUT_EXAMPLE_DOMINO,
        glyphWidth: 0,
        glyphHeight: 0
    },
    */
] as const;
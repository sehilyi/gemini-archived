import { GENE_ANNOTATION_PLOT, GENE_ANNOTATION_PLOT_SIMPLE } from "../lib/test/gemini/gene-annotation-plots";
import { CYTOGENETIC_BAND } from "../lib/test/gemini/cytogenetic-band";
import { LAYOUT_HIGLASS } from "../lib/test/gemini/layout-higlass";
import { GeminiSpec } from "../lib/gemini.schema";
import { calculateSize } from "../lib/utils/bounding-box";

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
        name: "Layout Example (HiGlass)",
        spec: LAYOUT_HIGLASS,
        glyphWidth: 0,
        glyphHeight: 0
    }
] as const;
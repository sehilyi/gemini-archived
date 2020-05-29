import { GeminiSpec } from "../../gemini.schema";

export const GENE_ANNOTATION_PLOT: GeminiSpec = {
    tracks: [
        {
            data: "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.small.csv",
            mark: { server: "gemini.v1", type: "glyph-gene-annotation-v1" },
            x: { field: "start", type: "quantitative" },
            x1: { field: "end", type: "quantitative" },
            geneOrExon: { field: "feature", type: "nominal" },
            strand: { field: "strand", type: "nominal" },
        }
    ]
};
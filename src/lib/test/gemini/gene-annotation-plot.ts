import { GeminiSpec } from "../../gemini.schema";

export const GENE_ANNOTATION_PLOT: GeminiSpec = {
    views: [{
        tracks: [
            {
                data: "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.small.csv",
                mark: "glyph-gene-annotation-v1",
                x: { field: "start", type: "quantitative" },
                x1: { field: "end", type: "quantitative" },
                category: { field: "feature", type: "nominal" },
                category1: { field: "strand", type: "nominal" },
            }
        ]
    }]
};
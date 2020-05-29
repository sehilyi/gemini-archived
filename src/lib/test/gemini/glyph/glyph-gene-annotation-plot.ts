import { Mark } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION: Mark = {
    "type": "glyph",
    "name": "gene-annotation",
    "requiredChannels": [
        "x", "x1", "y",
        "geneOrExon", // genes or exons?
        "strand" // + or - strand?
    ],
    "elements": [
        {
            // Should render once
            "description": "horizontal line",
            "mark": "line",
            "color": "black",
            "x": { "bind": "x", "aggregate": "min" },
            "x1": { "bind": "x1" }, // Defining only on `x` should work.
            "size": 2
        },
        {
            "description": "gene left",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "strand",
                "domain": ["+", "-"],
                "range": ["triangle-l", "rule"]
            },
            "size": 12,
            "x1": null,
        },
        {
            "description": "gene right",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "strand",
                "domain": ["+", "-"],
                "range": ["rule", "triangle-r"]
            },
            "size": 12,
            "x": { "bind": "x1" },
        },
        {
            "description": "exon",
            "select": [
                { "channel": "geneOrExon", "equal": "exon" },
            ],
            "mark": "rect",
        },
        {
            "mark": "text",
            "color": "black"
            // Offset
        }
    ]
}
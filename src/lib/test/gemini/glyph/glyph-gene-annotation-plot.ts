import { Mark } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION: Mark = {
    "type": "glyph",
    "name": "gene-annotation",
    "requiredChannels": [
        "x", "x1", "y",
        "category", // genes or exons?
        "category1" // + or - strand?
    ],
    "elements": [
        {
            // Should render only one line
            "description": "horizontal line",
            "mark": "line",
            "color": "black",
            "x": { "bind": "x", "aggregate": "min" },
            "x1": { "bind": "x1", "aggregate": "max" },
            "size": 2
        },
        {
            "description": "gene left head",
            "select": [
                { "channel": "category", "equal": "gene" },
                { "channel": "category1", "equal": "+" }
            ],
            "mark": "triangle-l", // TODO: Should provide conditional mark
            "x1": null,
        },
        {
            "description": "gene left tail",
            "select": [
                { "channel": "category", "equal": "gene" },
                { "channel": "category1", "equal": "+" }
            ],
            "mark": "rect"
        },
        {
            "description": "gene right head",
            "select": [
                { "channel": "category", "equal": "gene" },
                { "channel": "category1", "equal": "-" }
            ],
            "mark": "triangle-r",
            "x": { "bind": "x1" },
            "x1": null,
        },
        {
            "description": "exon",
            "mark": "rect",
        },
        {
            "mark": "text",
            "color": "black"
        }
    ]
}
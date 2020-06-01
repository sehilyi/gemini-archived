import { MarkGlyph } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION: MarkGlyph = {
    "type": "glyph",
    "name": "gene-annotation",
    "requiredChannels": [
        // TODO: What about optional channels?
        "x", "x1",
        "y", // + or - strand?
        "geneOrExon", // genes or exons?
        'color'
    ],
    "elements": [
        {
            // Should render once
            "description": "horizontal line",
            "mark": "line",
            "color": { "value": "black" },
            "x": { "bind": "x", "aggregate": "min" },
            "x1": { "bind": "x1", "aggregate": "max" },
            "size": { "value": 2 }
        },
        {
            "description": "exon",
            "select": [
                { "channel": "geneOrExon", "equal": "exon" },
            ],
            "mark": "rect",
            "size": { "value": 20 }
        },
        {
            "description": "gene left",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "y",
                "domain": ["+", "-"],
                "range": ['point', "rule"]
            },
            "size": { "value": 30 },
            "x1": null,
            "color": { "value": "red" }
        },
        {
            "description": "gene right",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "y",
                "domain": ["+", "-"],
                "range": ["rule", 'point']
            },
            "size": { "value": 30 },
            "x": { "bind": "x1" },
            "color": { "value": "red" }
        },
        {
            "mark": "text",
            "select": [
                { "channel": "geneOrExon", 'equal': "gene" }
            ],
            "color": { "value": "black" }
            // Offset
        }
    ]
}
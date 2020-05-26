export const geneAnnotation_ggBio = {
    "type": "glyph",
    "name": "gene-annotation",
    "required": [
        "x1", "x2", "cy", "height",
        "category1", // genes or exons?
        "category2" // + or - strand?
    ],
    "elements": [
        {
            // Should render only one line
            "description": "horizontal line",
            "mark": "line",
            "color": "black",
            "x1": { "bind": "x1", "aggregate": "min" },
            "x2": { "bind": "x2", "aggregate": "max" },
            "size": 2
        },
        {
            "description": "left of gene",
            "select": { "category1": "gene" },
            "mark": {
                "condition": "category2",
                "domain": ["+", "-"],
                "range": ["triangle-l", "rect"]
            },
            "cx": { "bind": "x1" }
            // Here, default x1 and x2 are used for `rect` type.
        },
        {
            "description": "right of gene",
            "select": { "category1": "gene" },
            "mark": {
                "condition": "category2",
                "domain": ["+", "-"],
                "range": ["rect", "triangle-r"]
            },
            "cx": { "bind": "x2" }
            // Here, default x1 and x2 are used for `rect` type.
        },
        {
            "description": "exon",
            "mark": "rect",
        },
        {
            "mark": "text",
            "xOffset": "center",
            "yOffset": "top",
            "color": "black"
        }
    ]
}
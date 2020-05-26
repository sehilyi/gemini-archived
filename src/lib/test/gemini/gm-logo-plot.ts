export const logoPlot = {
    "type": "glyph",
    "name": "logo",
    "required": [
        "x1", "x2", "y", "height",
    ],
    "elements": [
        {
            "mark": "bar"
        },
        {
            "mark": "text",
            "height": { "bind": "y" },
            "xOffset": "center",
            "yOffset": "center",
            "color": "black"
        }
    ]
}
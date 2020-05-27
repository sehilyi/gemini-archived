import { MarkDeep } from "../gemini.schema";
import * as d3 from "d3";

export function renderGlyphPreview(ref: SVGSVGElement, mark: MarkDeep) {
    if (!ref) return;
    d3.select(ref).selectAll("*").remove();

    // Constants
    const WIDTH = 300, HEIGHT = 300;
    const PADDING = 30;

    const svg = d3.select(ref)
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    const g = d3.select(ref).append("g");
    g.append("rect")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("stroke", "lightgray")
        .attr("fill", "white");

    // guidelines
    renderGuidelines(g, WIDTH, HEIGHT, PADDING);

    const innerG = g.append("g")
        .attr("width", WIDTH - PADDING * 2)
        .attr("height", HEIGHT - PADDING * 2)
        .attr("transform", `translate(${PADDING},${PADDING})`);
}

function renderGuidelines(g: d3.Selection<SVGGElement, any, any, any>, w: number, h: number, p: number) {
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", p)
        .attr("y2", p)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", h - p)
        .attr("y2", h - p)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", p)
        .attr("x2", p)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", w - p)
        .attr("x2", w - p)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", h / 2)
        .attr("y2", h / 2)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", w / 2)
        .attr("x2", w / 2)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
}
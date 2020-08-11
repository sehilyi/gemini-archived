import { drawZoomInstruction } from './zoom-instruction';
import { drawMultipleBarCharts, drawStackedBarChart } from './bar';
import { drawLineCharts } from './line';

export default {
    drawZoomInstruction,
    drawMultipleBarCharts,
    drawLineCharts,
    drawVerticalBars: drawStackedBarChart
};
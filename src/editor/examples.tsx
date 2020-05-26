import hgSingleView from "../lib/test/higlass/hg-single-view.json";
import hlSingleView from "../lib/test/gemini/gm-single-view.json";
import hgTwoIndependentViews from "../lib/test/higlass/hg-two-independent-views.json";
import hlTwoIndependentViews from "../lib/test/gemini/gm-two-independent-views.json";

export const demos = [
    {
        name: "Single Matrix",
        hg: hgSingleView,
        gm: hlSingleView
    },
    {
        name: "Two Independent Views",
        hg: hgTwoIndependentViews,
        gm: hlTwoIndependentViews,
    }
];
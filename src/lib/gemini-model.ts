import { GeminiSpec } from "./gemini.schema";

export class GeminiModel {
    private gm: GeminiSpec;
    constructor(_gm: GeminiSpec) {
        this.gm = JSON.parse(JSON.stringify(_gm));

        // Add default specs.
        for (let v = 0; v < this.gm.views.length; v++) {
            if (!this.gm.views[v].w) this.gm.views[v].w = 12;
            if (!this.gm.views[v].h) this.gm.views[v].h = 12;
            if (!this.gm.views[v].x) this.gm.views[v].x = 0;
            if (!this.gm.views[v].y) this.gm.views[v].y = 0;
        }
    }

    public spec(): GeminiSpec {
        return this.gm;
    }
}
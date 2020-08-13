import { Track, getVisualizationType, IsChannelDeep, IsChannelValue } from "./gemini.schema"
import merge from "lodash/merge"
import { schemeCategory10 } from "d3"

export class GeminiTrackModel {
    private specOriginal: Track // original spec of users
    private specComplete: Track // processed spec used in visualizations
    private specCompleteAlt: Track // processed spec used when zoomed out

    private DEFAULT_OPTIONS = {
        NOMINAL_COLOR: schemeCategory10
    }

    constructor(track: Track) {
        this.specOriginal = JSON.parse(JSON.stringify(track))
        this.specComplete = JSON.parse(JSON.stringify(track))
        this.specCompleteAlt = JSON.parse(JSON.stringify(track))

        if (!this.validateSpec()) {
            console.warn('Gemini specification is not valid!')
            return
        }

        this._generateCompleteSpec(this.specComplete)
        this._generateCompleteSpec(this.specCompleteAlt)

        if (this.specComplete?.zoomAction?.type === 'alternative-encoding') {
            this.specCompleteAlt = merge(
                JSON.parse(JSON.stringify(this.specComplete)),
                this.specComplete.zoomAction.spec
            )
        }

        // Add default specs.
        // ...
    }

    public validateSpec(): boolean {
        let valid = true

        // check with json schema

        // additionally check with schema that cannot be validated with a json schema file

        return valid
    }

    private _generateCompleteSpec(track: Track) {
        /* color */
        if (IsChannelDeep(track.color) && !track.color.range) {
            track.color.type = 'nominal'
        }
        if (IsChannelDeep(track.color) && !track.color.range) {
            track.color.range = this.DEFAULT_OPTIONS.NOMINAL_COLOR as string[]
        }
    }

    public getVisualizationType(alt?: boolean) {
        return getVisualizationType(this.spec(alt))
    }

    public getColorRange(alt?: boolean): string[] {
        const spec = this.spec(alt)
        if (IsChannelDeep(spec.color)) {
            return spec.color.range as string[]
        } else if (IsChannelValue(spec.color)) {
            return [spec.color.value] as string[]
        }
        return []
    }

    public spec(alt?: boolean): Track {
        // TODO: determine to use alternative spec inside this function, not outside
        return alt ? this.specCompleteAlt : this.specComplete
    }
}
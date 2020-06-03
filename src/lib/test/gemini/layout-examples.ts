import { GeminiSpec } from "../../gemini.schema";

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
    tracks: [
        {
            data: 'dummy-link', mark: 'link',
            x: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link',
            x1: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link',
            x1: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link',
            x: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link',
            x: { field: 'from', type: "nominal" },
            x1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
    ]
}
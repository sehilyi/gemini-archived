import React, { useState, useEffect, useRef } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec, MarkDeep } from '../lib/gemini.schema';
import { debounce } from "lodash";
import { demos } from './examples';
import './editor.css';
import { renderGlyphPreview } from '../lib/visualizations/glyph-preview';

const DEBUG_INIT_DEMO_INDEX = 0;

function Editor() {

    const glyphSvg = useRef<SVGSVGElement>(null);
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [demo, setDemo] = useState(demos[DEBUG_INIT_DEMO_INDEX]);
    const [gm, setGm] = useState(stringify(demos[DEBUG_INIT_DEMO_INDEX].spec as GeminiSpec));

    useEffect(() => {
        setGm(stringify(demo.spec as GeminiSpec));
    }, [demo]);

    useEffect(() => {
        let editedGm;
        try {
            editedGm = JSON.parse(gm);
        } catch (e) {
            console.warn("Cannnot parse the edited code.");
        }
        if (!editedGm) return;

        const findGlyph = (editedGm as GeminiSpec).views?.[0].tracks?.find(
            d => (d.mark as MarkDeep)?.type === "glyph"
        )?.mark;
        if (!findGlyph) return;

        renderGlyphPreview(glyphSvg.current as SVGSVGElement, findGlyph as MarkDeep);
    }, [gm]);

    return (
        <>
            <div className="demo-navbar">
                Gemini <code>Editor</code>
                <select
                    onChange={e => {
                        setDemo(demos.find(d => d.name === e.target.value) as any);
                    }}
                    defaultValue={demo.name}>
                    {demos.map(d => (
                        <option key={d.name} value={d.name}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="editor">
                <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
                    {/* Gemini Editor */}
                    <EditorPanel
                        code={gm}
                        readOnly={false}
                        onChange={debounce(newHl => {
                            setGm(newHl);
                        }, 1000)}
                    />
                    {/* D3 Visualizations */}
                    <SplitPane split="horizontal" defaultSize="50%" onChange={() => { }}>
                        <div className="preview-container">
                            <b>Glyph Preview</b>
                            <div><svg ref={glyphSvg} /></div>
                        </div>
                        <div className="preview-container">
                            <b>Layout Preview</b>
                            <div><svg ref={layoutSvg} /></div>
                        </div>
                    </SplitPane>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;
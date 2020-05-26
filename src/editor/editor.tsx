import React, { useState, useEffect, useRef, useMemo } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { compile } from '../lib/gemini';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import './editor.css';
import { GeminiSpec } from '../lib/gemini.schema';
import { debounce } from "lodash";
import { demos } from './examples';

const DEBUG_DO_NOT_RENDER_HIGLASS = false;
const DEBUG_INIT_DEMO_INDEX = 0;

function Editor() {

    const [demo, setDemo] = useState(demos[DEBUG_INIT_DEMO_INDEX]);
    const [gm, setGm] = useState(stringify(demos[DEBUG_INIT_DEMO_INDEX].gm as GeminiSpec));
    const [hg, setHg] = useState(stringify(compile(demos[DEBUG_INIT_DEMO_INDEX].gm as GeminiSpec)));

    const hgRef = useRef<typeof HiGlassComponent>();

    useEffect(() => {
        setGm(stringify(demo.gm as GeminiSpec));
        setHg(stringify(compile(demo.gm as GeminiSpec)));
    }, [demo]);

    useEffect(() => {
        let newHg;
        try {
            newHg = stringify(compile(JSON.parse(gm)));
            setHg(newHg);
        } catch (e) {
            console.warn("Invalid HiGlass spec.");
        }

        // TODO: Do we need this?
        // hgRef?.current?.api.setViewConfig(JSON.parse(newHg)).then(() => {
        //     console.log("onSetViewConfig");
        // });
    }, [gm]);

    // Renders HiGlass by compiling the edited Gemini code.
    const hglass = useMemo(() => {
        return <HiGlassComponent
            ref={hgRef}
            options={{
                bounded: true,
                pixelPreciseMarginPadding: true,
                containerPaddingX: 0,
                containerPaddingY: 0,
                sizeMode: "default"
            }}
            viewConfig={JSON.parse(hg)}
        />
    }, [gm, hg]);

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
                <SplitPane split="vertical" defaultSize="30%" onChange={() => { }}>
                    {/* Gemini Editor */}
                    <EditorPanel
                        code={gm}
                        readOnly={false}
                        onChange={debounce(newHl => {
                            setGm(newHl);
                        }, 1000)}
                    />
                    <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
                        {/* HiGlass Editor */}
                        <EditorPanel
                            code={hg}
                            readOnly={true}
                        />
                        {/* HiGlass Output */}
                        {!DEBUG_DO_NOT_RENDER_HIGLASS && hglass}
                    </SplitPane>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;
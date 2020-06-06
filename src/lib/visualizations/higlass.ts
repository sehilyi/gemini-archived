// @ts-ignore
import { HiGlassComponent } from 'higlass';
import { BoundingBox } from '../utils/bounding-box';
import { Track, GenericType, Channel } from '../gemini.schema';

export function renderHiGlass(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[]
) {
    //     const hgRef = useRef<typeof HiGlassComponent>(null);

    //     const hglass = useMemo(() => {
    //         const viewConfigs = [simpleHiGlassViewConfig, simpleHiGlassViewConfig];
    //         return viewConfigs.map(d =>
    //             <div style={{
    //             height: "300px",
    //             position: 'absolute',
    //             display: 'block',
    //             width: "100%",
    //             textAlign: 'left'
    //         }}>
    //     <HiGlassComponent
    //                 ref={ hgRef }
    //                 options = {{
    //         bounded: true,
    //         containerPaddingX: 0,
    //         containerPaddingY: 0,
    //         viewMarginTop: 0,
    //         viewMarginLeft: 0,
    //         viewMarginBottom: 0,
    //         viewPaddingTop: 0,
    //         viewPaddingLeft: 0,
    //         viewPaddingBottom: 0,
    //         sizeMode: "bounded"
    //     }}
    // viewConfig = { d }
    //     />
    //     </div>
    //     );
    // }, [simpleHiGlassViewConfig]);
}
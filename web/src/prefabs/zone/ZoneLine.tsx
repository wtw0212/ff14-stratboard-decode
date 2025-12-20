import { useState } from 'react';
import { Circle, Group, Rect } from 'react-konva';
import { Label } from '@fluentui/react-components';
import Icon from '../../assets/zone/line.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { LineZone, ObjectType, RectangleZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useIsDragging } from '../../selection';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars, makeColorSwatch } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { distance, getDistanceFromLine, VEC_ZERO, vecAtAngle } from '../../vector';
import { MIN_LINE_LENGTH, MIN_LINE_WIDTH } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { useHighlightProps, useShowResizer } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';

// Game color palette for color picker
const GAME_COLOR_PALETTE = [
    '#FFFFFF', '#FFBDBF', '#FFE0C8', '#FFF8B0', '#E9FFE2', '#E8FFFE', '#9CD0F4', '#FFDCFF',
    '#F8F8F8', '#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
    '#E0E0E0', '#FF4C4C', '#FFA666', '#FFFFB2', '#80FF00', '#BCFFF0', '#0080FF', '#E26090',
    '#D8D8D8', '#FF7F7F', '#FFCEAC', '#FFDE73', '#80F860', '#66E6FF', '#94C0FF', '#FF8CC6',
];

const COLOR_SWATCHES = GAME_COLOR_PALETTE.map((color, index) =>
    makeColorSwatch(color, `lineaoe-${index}`)
);

const NAME = 'Line';

const DEFAULT_WIDTH = 100;
const DEFAULT_LENGTH = 250;

const ICON_SIZE = 32;

export const ZoneLine: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.Rect,  // Line AOE uses Rect internally
                    },
                    offset: {
                        x: offset.x,
                        y: offset.y - ICON_SIZE / 2,
                    },
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Rect, (object, position) => {
    return {
        type: 'add',
        object: {
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_WIDTH,
            height: DEFAULT_LENGTH,  // Rect uses 'height' not 'length'
            rotation: 0,
            hollow: false,
            ...object,
            ...position,
        },
    };
});

const LineDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Rect, LineDetails);

enum HandleId {
    Length,
    Width,
}

interface LineState {
    length: number;
    width: number;
    rotation: number;
}

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

const OUTSET = 2;

function getLength(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        return Math.max(MIN_LINE_LENGTH, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.length;
}

function getRotation(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getWidth(object: LineZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId == HandleId.Width) {
        const start = VEC_ZERO;
        const end = vecAtAngle(object.rotation);
        const distance = getDistanceFromLine(start, end, pointerPos);

        return Math.max(MIN_LINE_WIDTH, Math.round(distance * 2));
    }

    return object.width;
}

const LineControlPoints = createControlPointManager<LineZone, LineState>({
    handleFunc: (object, handle) => {
        const length = getLength(object, handle) + OUTSET;
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        const x = width / 2;
        const y = -length / 2;

        return [
            { id: HandleId.Length, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -length },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: x, y: y },
            { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: -x, y: y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const length = getLength(object, handle);
        const width = getWidth(object, handle);
        const rotation = getRotation(object, handle);

        return { length, width, rotation };
    },
    onRenderBorder: (object, state) => {
        const strokeWidth = 1;
        const width = state.width + strokeWidth * 2;
        const length = state.length + strokeWidth * 2;

        return (
            <>
                <Rect
                    x={-width / 2}
                    y={-length + strokeWidth}
                    width={width}
                    height={length}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={strokeWidth}
                    fillEnabled={false}
                />
                <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
            </>
        );
    },
});

interface LineRendererProps extends RendererProps<LineZone> {
    length: number;
    width: number;
    rotation: number;
    isDragging?: boolean;
}

const LineRenderer: React.FC<LineRendererProps> = ({ object, length, width, rotation, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, Math.min(length, width), object.hollow);

    const x = -width / 2;
    const y = -length;
    const highlightOffset = style.strokeWidth;
    const highlightWidth = width + highlightOffset;
    const highlightLength = length + highlightOffset;

    return (
        <Group rotation={rotation}>
            {highlightProps && (
                <Rect
                    x={x}
                    y={y}
                    width={highlightWidth}
                    height={highlightLength}
                    offsetX={highlightOffset / 2}
                    offsetY={highlightOffset / 2}
                    {...highlightProps}
                />
            )}
            <HideGroup>
                <Rect x={x} y={y} width={width} height={length} {...style} />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: LineZone, state: LineState) {
    return state.length !== object.length || state.rotation !== object.rotation || state.width !== object.width;
}

const LineContainer: React.FC<RendererProps<LineZone>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: LineState) => {
        state.rotation = Math.round(state.rotation);
        state.width = Math.round(state.width);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <LineControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => <LineRenderer object={object} isDragging={dragging || resizing} {...props} />}
                </LineControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, LineContainer);

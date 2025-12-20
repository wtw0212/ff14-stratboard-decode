import React, { useState } from 'react';
import { Circle, Group, Rect, Line } from 'react-konva';
import { SpinButton, Label } from '@fluentui/react-components';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { GameLineObject, ObjectType } from '../scene';
import { useScene } from '../SceneProvider';
import { panelVars, CENTER_DOT_RADIUS, makeColorSwatch } from '../theme';
import { usePanelDrag } from '../usePanelDrag';
import { PrefabIcon } from './PrefabIcon';
import { DraggableObject } from './DraggableObject';
import { useShowResizer, useHighlightProps } from './highlight';
import { HideGroup } from './HideGroup';
import { SelectableObject } from './SelectableObject';
import { useIsDragging } from '../selection';
import { ActivePortal } from '../render/Portals';
import { getPointerAngle, snapAngle } from '../coord';
import { getResizeCursor } from '../cursor';
import { distance, VEC_ZERO, vecAtAngle, getDistanceFromLine } from '../vector';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager, HandleFuncProps, HandleStyle } from './ControlPoint';
import { useSpinChanged } from './useSpinChanged';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';

// Game color palette for color picker
const GAME_COLOR_PALETTE = [
    '#FFFFFF', '#FFBDBF', '#FFE0C8', '#FFF8B0', '#E9FFE2', '#E8FFFE', '#9CD0F4', '#FFDCFF',
    '#F8F8F8', '#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
    '#E0E0E0', '#FF4C4C', '#FFA666', '#FFFFB2', '#80FF00', '#BCFFF0', '#0080FF', '#E26090',
    '#D8D8D8', '#FF7F7F', '#FFCEAC', '#FFDE73', '#80F860', '#66E6FF', '#94C0FF', '#FF8CC6',
];

const COLOR_SWATCHES = GAME_COLOR_PALETTE.map((color, index) =>
    makeColorSwatch(color, `gameline-${index}`)
);

// SVG icon for Game Line (thin tether-like line)
const GameLineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 32 32" {...props}>
        <line x1="4" y1="28" x2="28" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const NAME = 'Game Line';
const DEFAULT_WIDTH = 6;   // Default thickness (game range 2-10)
const DEFAULT_LENGTH = 100;
const DEFAULT_COLOR = '#ff8000';
const DEFAULT_OPACITY = 100;

// Minimum and maximum values for width
const MIN_WIDTH = 2;
const MAX_WIDTH = 10;
const MIN_LENGTH = 20;

export const GameLine: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<GameLineIcon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.GameLine,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<GameLineObject>(ObjectType.GameLine, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.GameLine,
            color: DEFAULT_COLOR,
            opacity: DEFAULT_OPACITY,
            width: DEFAULT_WIDTH,
            length: DEFAULT_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

// Control point handling
enum HandleId {
    Length,
    Width,
}

interface GameLineState {
    length: number;
    width: number;
    rotation: number;
}

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;
const OUTSET = 2;

function getLength(object: GameLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        return Math.max(MIN_LENGTH, Math.round(distance(pointerPos) - OUTSET));
    }
    return object.length;
}

function getRotation(object: GameLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        // getPointerAngle returns 0° when pointing up, but we want 0° = horizontal
        // So subtract 90° to convert: pointing right (90° in default) becomes 0°
        const angle = getPointerAngle(pointerPos) - 90;
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }
    return object.rotation;
}

function getWidth(object: GameLineObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Width) {
        const start = VEC_ZERO;
        const end = vecAtAngle(object.rotation);
        const dist = getDistanceFromLine(start, end, pointerPos);
        // Clamp to game's range (2-10)
        return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(dist * 2)));
    }
    return object.width;
}

const GameLineControlPoints = createControlPointManager<GameLineObject, GameLineState>({
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
    // Control point rotation should match renderer's 90° offset (0° = horizontal)
    getRotation: (object, handle) => getRotation(object, handle) + 90,
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

interface GameLineRendererProps extends RendererProps<GameLineObject> {
    length: number;
    width: number;
    rotation: number;
    isDragging?: boolean;
}

const GameLineRenderer: React.FC<GameLineRendererProps> = ({ object, length, width, rotation, isDragging }) => {
    const highlightProps = useHighlightProps(object);

    // Simple line rendering using Rect (same as LineZone)
    const x = -width / 2;
    const y = -length;
    const highlightOffset = 2;
    const highlightWidth = width + highlightOffset;
    const highlightLength = length + highlightOffset;

    return (
        // Add 90° to rotation so 0° = horizontal (right), not vertical
        <Group rotation={rotation + 90} opacity={object.opacity / 100}>
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
                <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={length}
                    fill={object.color}
                    cornerRadius={width / 2}  // Rounded ends like tether
                />

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: GameLineObject, state: GameLineState) {
    return state.length !== object.length || state.rotation !== object.rotation || state.width !== object.width;
}

const GameLineContainer: React.FC<RendererProps<GameLineObject>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const dragging = useIsDragging(object);

    const updateObject = (state: GameLineState) => {
        state.rotation = Math.round(state.rotation);
        state.width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(state.width)));
        state.length = Math.round(state.length);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } });
    };

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object}>
                <GameLineControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => <GameLineRenderer object={object} isDragging={dragging || resizing} {...props} />}
                </GameLineControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<GameLineObject>(ObjectType.GameLine, LayerName.Default, GameLineContainer);

const GameLineDetails: React.FC<ListComponentProps<GameLineObject>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<GameLineIcon width="100%" height="100%" style={{ color: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<GameLineObject>(ObjectType.GameLine, GameLineDetails);

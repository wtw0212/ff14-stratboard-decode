import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useCurrentStep } from '../SceneProvider';
import {
    ObjectType,
    SceneObject,
    UnknownObject,
    isArcZone,
    isArrow,
    isConeZone,
    isDrawObject,
    isExaflareZone,
    isEye,
    isGameLine,
    isIcon,
    isImageObject,
    isInnerRadiusObject,
    isMarker,
    isMoveable,
    isNamed,
    isParty,
    isPolygonZone,
    isRadiusObject,
    isResizable,
    isRotateable,
    isStarburstZone,
    isTether,
    isText,
    supportsHollow,
    supportsStackCount,
} from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useControlStyles } from '../useControlStyles';
import { PropertiesControlProps } from './PropertiesControl';
import { ArrowPointersControl } from './properties/ArrowControls';
import { DrawObjectBrushControl } from './properties/BrushControl';
import { ColorControl, ColorSwatchControl } from './properties/ColorControl';
import { ConeAngleControl } from './properties/ConeControls';

import { ExaflareLengthControl, ExaflareSpacingControl } from './properties/ExaflareControls';
import { EyeInvertControl } from './properties/EyeControls';
import { GameLineLengthControl, GameLineWidthControl } from './properties/GameLineControls';
import { HideControl } from './properties/HideControl';
import { HollowControl } from './properties/HollowControl';
import { IconStacksControl, IconTimeControl } from './properties/IconControls';
import { ImageControl } from './properties/ImageControl';
import { MarkerShapeControl } from './properties/MarkerControls';
import { NameControl } from './properties/NameControl';
import { OpacityControl } from './properties/OpacityControl';
import { PartyIconControl } from './properties/PartyControls';
import { PolygonOrientationControl, PolygonSidesControl } from './properties/PolygonControls';
import { PositionControl } from './properties/PositionControl';
import { InnerRadiusControl, RadiusControl } from './properties/RadiusControl';
import { RotationControl } from './properties/RotationControl';
import { SizeControl } from './properties/SizeControl';
import { StackCountControl } from './properties/StackCountControl';
import { StarburstSpokeCountControl, StarburstSpokeWidthControl } from './properties/StarburstControls';
import { TetherTypeControl, TetherWidthControl } from './properties/TetherControls';
import { TextLayoutControl, TextValueControl } from './properties/TextControls';

// Color picker for Text, Line AOE (Rect or Line type), and GameLine
export const supportsColor = (x: UnknownObject) =>
    isText(x) || x.type === ObjectType.Rect || x.type === ObjectType.Line || isGameLine(x);

interface PropertiesPanelProps {
    className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.column, className)}>
            <Controls />
        </div>
    );
};

interface ControlConditionProps {
    objects: readonly SceneObject[];
    test: (object: UnknownObject) => boolean;
    invert?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: React.FC<PropertiesControlProps<any>>;
    className?: string;
}

const ControlCondition: React.FC<ControlConditionProps> = ({ objects, test, invert, control, className }) => {
    const result = objects.every(test);
    const isValid = invert ? !result : result;

    const Control = control;
    return isValid ? <Control objects={objects} className={className} /> : null;
};

const NoObjectsMessage: React.FC = () => {
    return <p>No objects selected.</p>;
};

const Controls: React.FC = () => {
    const classes = useControlStyles();
    const [selection] = useSelection();
    const step = useCurrentStep();

    if (selection.size === 0) {
        return <NoObjectsMessage />;
    }

    const objects = getSelectedObjects(step, selection);

    if (objects.length === 0) {
        return <NoObjectsMessage />;
    }

    return (
        <>
            <ControlCondition objects={objects} test={isNamed} control={NameControl} />
            <ControlCondition objects={objects} test={isImageObject} control={ImageControl} />

            {/* Style */}
            <ControlCondition objects={objects} test={isTether} control={TetherTypeControl} />
            <div className={mergeClasses(classes.row, classes.alignTop)}>
                {/* Color only for Text, Line AOE (Rect), GameLine */}
                <ControlCondition objects={objects} test={(x) => isText(x) || x.type === ObjectType.Rect || x.type === ObjectType.Line || isGameLine(x)} control={ColorControl} className={classes.grow} />
                <ControlCondition objects={objects} test={isArrow} control={ArrowPointersControl} />
                <ControlCondition objects={objects} test={supportsHollow} control={HollowControl} />
                <ControlCondition objects={objects} test={isMarker} control={MarkerShapeControl} />
            </div>
            {/* Color swatch */}
            <ControlCondition objects={objects} test={(x) => isText(x) || x.type === ObjectType.Rect || x.type === ObjectType.Line || isGameLine(x)} control={ColorSwatchControl} />
            {/* TextOutlineControl removed - game doesn't support outline color */}
            <div className={mergeClasses(classes.row)}>
                <OpacityControl objects={objects} className={classes.grow} />
                <HideControl objects={objects} />
            </div>
            <ControlCondition objects={objects} test={isDrawObject} control={DrawObjectBrushControl} />
            <ControlCondition objects={objects} test={isText} control={TextLayoutControl} />

            {/* Position/Size */}
            <ControlCondition objects={objects} test={isMoveable} control={PositionControl} />
            <ControlCondition objects={objects} test={isResizable} control={SizeControl} />
            {/* Line zones (Rect) now use SizeControl above */}
            <ControlCondition objects={objects} test={isGameLine} control={GameLineLengthControl} />

            {/* TODO: change this to a two-column grid? */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRadiusObject} control={RadiusControl} />
                <ControlCondition objects={objects} test={isInnerRadiusObject} control={InnerRadiusControl} />
                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareLengthControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeWidthControl} />
            </div>

            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isRotateable} control={RotationControl} />
                <ControlCondition objects={objects} test={isGameLine} control={GameLineWidthControl} />

                <ControlCondition objects={objects} test={isExaflareZone} control={ExaflareSpacingControl} />
                <ControlCondition objects={objects} test={isStarburstZone} control={StarburstSpokeCountControl} />

                <ControlCondition
                    objects={objects}
                    test={(x) => isArcZone(x) || isConeZone(x)}
                    control={ConeAngleControl}
                />
            </div>

            {/* Special options */}
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonSidesControl} />
                <ControlCondition objects={objects} test={isPolygonZone} control={PolygonOrientationControl} />
            </div>
            <ControlCondition objects={objects} test={isParty} control={PartyIconControl} />
            <ControlCondition objects={objects} test={isTether} control={TetherWidthControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={supportsStackCount} control={StackCountControl} />
            </div>
            <ControlCondition objects={objects} test={isEye} control={EyeInvertControl} />
            <ControlCondition objects={objects} test={isText} control={TextValueControl} />
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <ControlCondition objects={objects} test={isIcon} control={IconStacksControl} />
                <ControlCondition objects={objects} test={isIcon} control={IconTimeControl} />
            </div>
        </>
    );
};

import { Field, ToggleButton, Tooltip } from '@fluentui/react-components';
import { LockClosedRegular, LockMultipleRegular, LockOpenRegular } from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();

    const x = commonValue(objects, (obj) => obj.x);
    const y = commonValue(objects, (obj) => obj.y);
    const pinned = commonValue(objects, (obj) => !!obj.pinned);

    // Arena bounds for clamping
    const maxX = scene.arena.width;
    const maxY = scene.arena.height;

    const onTogglePinned = () =>
        dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'pinned', !pinned)) });

    const onXChanged = useSpinChanged((x: number) => {
        const clampedX = Math.max(0, Math.min(maxX, x));
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, x: clampedX })) });
    });
    const onYChanged = useSpinChanged((y: number) => {
        const clampedY = Math.max(0, Math.min(maxY, y));
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, y: clampedY })) });
    });

    const icon = pinned === undefined ? <LockMultipleRegular /> : pinned ? <LockClosedRegular /> : <LockOpenRegular />;
    const tooltip = pinned ? 'Unlock position' : 'Lock position';

    return (
        <>
            <div className={classes.row}>
                <Field label="X">
                    <SpinButton value={x} onChange={onXChanged} step={1} min={0} max={maxX} />
                </Field>
                <Field label="Y">
                    <SpinButton value={y} onChange={onYChanged} step={1} min={0} max={maxY} />
                </Field>
                <Tooltip content={tooltip} relationship="label" withArrow>
                    <ToggleButton checked={pinned} onClick={onTogglePinned} icon={icon} />
                </Tooltip>
            </div>
        </>
    );
};

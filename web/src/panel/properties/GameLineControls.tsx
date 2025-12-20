import { Field, mergeClasses } from '@fluentui/react-components';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { GameLineObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

// Game's line width range: 2-10 pixels
const MIN_WIDTH = 2;
const MAX_WIDTH = 10;
const MIN_LENGTH = 20;

export const GameLineWidthControl: React.FC<PropertiesControlProps<GameLineObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const width = commonValue(objects, (obj) => obj.width);

    const onWidthChanged = useSpinChanged((value: number) => {
        const clampedValue = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width: clampedValue })) });
    });

    return (
        <Field label="Width" style={{ minWidth: '60px', maxWidth: '80px' }}>
            <SpinButton value={width} onChange={onWidthChanged} min={MIN_WIDTH} max={MAX_WIDTH} step={1} />
        </Field>
    );
};

export const GameLineLengthControl: React.FC<PropertiesControlProps<GameLineObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const length = commonValue(objects, (obj) => obj.length);

    const onLengthChanged = useSpinChanged((length: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, length })) }),
    );

    return (
        <Field label="Length" style={{ minWidth: '60px', maxWidth: '100px' }}>
            <SpinButton value={length} onChange={onLengthChanged} min={MIN_LENGTH} step={5} />
        </Field>
    );
};


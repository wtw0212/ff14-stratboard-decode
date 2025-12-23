import * as React from 'react';
import { Group, Image, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../render/ObjectRegistry';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { LayerName } from '../render/layers';
import { EnemyObject, ObjectType } from '../scene';
import { useImageTracked } from '../useObjectLoading';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { useHighlightProps } from './highlight';

const DEFAULT_SIZE = 32;

const SIZE_SMALL = 32;
const SIZE_MEDIUM = 48;
const SIZE_LARGE = 64;

function makeIcon(name: string, icon: string, size: number) {
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = `/actor/${icon}`;

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Enemy,
                            image: iconUrl,
                            width: size,
                            height: size,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(name);
    return Component;
}

registerDropHandler<EnemyObject>(ObjectType.Enemy, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Enemy,
            image: '',
            name: '',
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            opacity: 100,
            rotation: 0,
            status: [],
            ...object,
            ...position,
        },
    };
});

// Simple image-based renderer like Party
const EnemyRenderer: React.FC<RendererProps<EnemyObject>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const [image] = useImageTracked(object.image);

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {highlightProps && (
                        <Rect
                            width={object.width}
                            height={object.height}
                            cornerRadius={(object.width + object.height) / 2 / 5}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <Image
                            image={image}
                            width={object.width}
                            height={object.height}
                            opacity={object.opacity / 100}
                        />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, LayerName.Default, EnemyRenderer);

const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, ...props }) => {
    return <DetailsItem icon={object.image} name={object.name || 'Enemy'} object={object} {...props} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

export const EnemySmall = makeIcon('Small enemy', 'enemy_small.webp', SIZE_SMALL);
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.webp', SIZE_MEDIUM);
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.webp', SIZE_LARGE);

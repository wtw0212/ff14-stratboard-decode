import React from 'react';
import useImage from 'use-image';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { IconObject, ObjectType } from '../../scene';
import { DEFAULT_IMAGE_OPACITY } from '../../theme';
import { useImageTracked } from '../../useObjectLoading';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useHighlightProps } from '../highlight';
import { Group, Image as KonvaImage, Rect } from 'react-konva';

const DEFAULT_SIZE = 48;

// Image paths for person AOE icons
const PERSON_AOE_ICONS = {
    1: '/zone/1-Person-Aoe.webp',
    2: '/zone/2-Person-Aoe.webp',
    3: '/zone/3-Person-Aoe.webp',
    4: '/zone/4-Person-Aoe.webp',
} as const;

const PERSON_AOE_NAMES = {
    1: '1-Person AOE',
    2: '2-Person AOE',
    3: '3-Person AOE',
    4: '4-Person AOE',
} as const;

function makePersonAoeIcon(personCount: 1 | 2 | 3 | 4) {
    const name = PERSON_AOE_NAMES[personCount];
    const iconPath = PERSON_AOE_ICONS[personCount];

    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconPath}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Icon,
                            image: iconPath,
                            name,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
    Component.displayName = `ZonePersonAoe${personCount}`;
    return Component;
}

// Export individual prefab icons
export const ZonePersonAoe1 = makePersonAoeIcon(1);
export const ZonePersonAoe2 = makePersonAoeIcon(2);
export const ZonePersonAoe3 = makePersonAoeIcon(3);
export const ZonePersonAoe4 = makePersonAoeIcon(4);

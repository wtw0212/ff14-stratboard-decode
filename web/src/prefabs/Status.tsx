import { makeDisplayName } from '../util';
import { StatusIcon } from './StatusIcon';

function makeIcon(name: string, icon: string, scale?: number) {
    const Component: React.FC = () => <StatusIcon name={name} icon={`/marker/${icon}`} scale={scale} />;
    Component.displayName = makeDisplayName(name);
    return Component;
}

export const StatusAttack1 = makeIcon('Attack 1', 'attack1.webp', 2);
export const StatusAttack2 = makeIcon('Attack 2', 'attack2.webp', 2);
export const StatusAttack3 = makeIcon('Attack 3', 'attack3.webp', 2);
export const StatusAttack4 = makeIcon('Attack 4', 'attack4.webp', 2);
export const StatusAttack5 = makeIcon('Attack 5', 'attack5.webp', 2);
export const StatusAttack6 = makeIcon('Attack 6', 'attack6.webp', 2);
export const StatusAttack7 = makeIcon('Attack 7', 'attack7.webp', 2);
export const StatusAttack8 = makeIcon('Attack 8', 'attack8.webp', 2);

export const StatusBind1 = makeIcon('Bind 1', 'bind1.webp', 2);
export const StatusBind2 = makeIcon('Bind 2', 'bind2.webp', 2);
export const StatusBind3 = makeIcon('Bind 3', 'bind3.webp', 2);

export const StatusCounter1 = makeIcon('Counter 1', 'limit1.webp');
export const StatusCounter2 = makeIcon('Counter 2', 'limit2.webp');
export const StatusCounter3 = makeIcon('Counter 3', 'limit3.webp');
export const StatusCounter4 = makeIcon('Counter 4', 'limit4.webp');
export const StatusCounter5 = makeIcon('Counter 5', 'limit5.webp');
export const StatusCounter6 = makeIcon('Counter 6', 'limit6.webp');
export const StatusCounter7 = makeIcon('Counter 7', 'limit7.webp');
export const StatusCounter8 = makeIcon('Counter 8', 'limit8.webp');

export const StatusIgnore1 = makeIcon('Ignore 1', 'ignore1.webp', 2);
export const StatusIgnore2 = makeIcon('Ignore 2', 'ignore2.webp', 2);

export const StatusCircle = makeIcon('Circle', 'circle.webp', 2);
export const StatusCross = makeIcon('Cross', 'cross.webp', 2);
export const StatusSquare = makeIcon('Square', 'square.webp', 2);
export const StatusTriangle = makeIcon('Triangle', 'triangle.webp', 2);

export const StatusRedTarget = makeIcon('Target', 'red_target.webp');
export const StatusGreenTarget = makeIcon('Target', 'green_target.webp');
export const StatusBlueCircleTarget = makeIcon('Target', 'blue_circle.webp');
export const StatusGreenCircleTarget = makeIcon('Target', 'green_circle.webp');
export const StatusCrosshairs = makeIcon('Target', 'crosshairs.webp');

export const StatusDice1 = makeIcon('Acceleration Bomb 1', 'dice1.webp');
export const StatusDice2 = makeIcon('Acceleration Bomb 2', 'dice2.webp');
export const StatusDice3 = makeIcon('Acceleration Bomb 3', 'dice3.webp');

export const StatusEdenYellow = makeIcon('Yellow marker', 'eden/yellow.webp');
export const StatusEdenOrange = makeIcon('Orange marker', 'eden/orange.webp');
export const StatusEdenBlue = makeIcon('Blue marker', 'eden/blue.webp');

export const StatusUltimateCircle = makeIcon('Circle', 'ultimate/circle.webp');
export const StatusUltimateCross = makeIcon('Cross', 'ultimate/cross.webp');
export const StatusUltimateSquare = makeIcon('Square', 'ultimate/square.webp');
export const StatusUltimateTriangle = makeIcon('Triangle', 'ultimate/triangle.webp');

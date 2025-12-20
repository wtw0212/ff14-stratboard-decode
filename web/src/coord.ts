import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { useScene } from './SceneProvider';
import { Scene } from './scene';
import { degtorad, round } from './util';
import { vecAngle } from './vector';

export const ALIGN_TO_PIXEL = {
    offsetX: -0.5,
    offsetY: -0.5,
};

/**
 * Snap a coordinate to the nearest grid intersection
 */
export function snapToGrid(value: number, gridSize: number): number {
    const snapSize = gridSize / 2;
    return Math.round(value / snapSize) * snapSize;
}

/**
 * Snap a point to the nearest grid intersection
 */
export function snapPointToGrid(x: number, y: number, gridSize: number): Vector2d {
    return {
        x: snapToGrid(x, gridSize),
        y: snapToGrid(y, gridSize),
    };
}

/**
 * Coordinate System:
 * - Top-left origin (0,0) at top-left corner
 * - +X goes right, +Y goes down
 * - Matches game canvas directly (512x384)
 */

// Convert scene X to canvas X (direct mapping with padding offset)
export function getCanvasX(scene: Scene, x: number): number {
    return scene.arena.padding + x;
}

// Convert scene Y to canvas Y (direct mapping with padding offset)
export function getCanvasY(scene: Scene, y: number): number {
    return scene.arena.padding + y;
}

export function getCanvasCoord(scene: Scene, p: Vector2d): Vector2d {
    return { x: getCanvasX(scene, p.x), y: getCanvasY(scene, p.y) };
}

export function getCanvasSize(scene: Scene): { width: number; height: number } {
    return {
        width: scene.arena.width + scene.arena.padding * 2,
        height: scene.arena.height + scene.arena.padding * 2,
    };
}

export function getCanvasArenaRect(scene: Scene): { x: number; y: number; width: number; height: number } {
    return {
        x: scene.arena.padding,
        y: scene.arena.padding,
        width: scene.arena.width,
        height: scene.arena.height,
    };
}

export function getCanvasArenaEllipse(scene: Scene): { x: number; y: number; radiusX: number; radiusY: number } {
    return {
        x: scene.arena.padding + scene.arena.width / 2,
        y: scene.arena.padding + scene.arena.height / 2,
        radiusX: scene.arena.width / 2,
        radiusY: scene.arena.height / 2,
    };
}

export function useCanvasCoord(p: Vector2d): Vector2d {
    const { scene } = useScene();
    return getCanvasCoord(scene, p);
}

export function useCanvasArenaRect(): { x: number; y: number; width: number; height: number } {
    const { scene } = useScene();
    return getCanvasArenaRect(scene);
}

export function useCanvasArenaEllipse(): { x: number; y: number; radiusX: number; radiusY: number } {
    const { scene } = useScene();
    return getCanvasArenaEllipse(scene);
}

// Convert canvas X to scene X
export function getSceneX(scene: Scene, x: number): number {
    return x - scene.arena.padding;
}

// Convert canvas Y to scene Y
export function getSceneY(scene: Scene, y: number): number {
    return y - scene.arena.padding;
}

export function getSceneCoord(scene: Scene, p: Vector2d): Vector2d {
    return round({ x: getSceneX(scene, p.x), y: getSceneY(scene, p.y) });
}

export function rotateCoord(p: Vector2d, angle: number, center: Vector2d = { x: 0, y: 0 }): Vector2d {
    const cos = Math.cos(degtorad(-angle));
    const sin = Math.sin(degtorad(-angle));

    const offsetX = p.x - center.x;
    const offsetY = p.y - center.y;
    const rotatedX = offsetX * cos - offsetY * sin;
    const rotatedY = offsetX * sin + offsetY * cos;

    return { x: center.x + rotatedX, y: center.y + rotatedY };
}

export function snapAngle(angle: number, snapDivision: number, snapTolerance: number): number {
    const divAngle = ((angle % snapDivision) + snapDivision) % snapDivision;

    if (divAngle > snapTolerance && divAngle < snapDivision - snapTolerance) {
        return angle;
    }

    return Math.round(angle / snapDivision) * snapDivision;
}

export function getPointerAngle(pos: Vector2d): number {
    return vecAngle(pos);
}

export function getPointerPosition(scene: Scene, stage: Stage | undefined | null): Vector2d | null {
    const pos = stage?.getPointerPosition();
    if (!pos) {
        return null;
    }
    return getSceneCoord(scene, pos);
}

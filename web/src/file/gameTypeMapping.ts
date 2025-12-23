/**
 * Game Type Mapping
 * =================
 *
 * Maps XIVPlan object types to FF14 game type IDs
 * and provides scene conversion utilities.
 */

import {
    Scene,
    SceneObject,
    ObjectType,
    isParty,
    isEnemy,
    isConeZone,
    isCircleZone,
    isDonutZone,
    isRectangleZone,  // Rect now used for Line AOE
    isStackZone,
    isTowerZone,
    isMarker,
    isText,
    isMoveable,
    isRotateable,
    isRadiusObject,
    isColored,
    isEye,
    isStarburstZone,
    isIcon,
    isExaflareZone,
    isGameLine,
    PartyObject,
    EnemyObject,
    ArenaShape,
    GridType,
} from '../scene';
import { mod360 } from '../util';
import { encodeStrategy, decodeStrategy } from './gameStrategyCodec';

// ============================================================================
// Game Type IDs (from OBJECT_TYPES.md)
// ============================================================================

export const GAME_TYPES = {
    // ===== Section 1: Jobs (Disciple of War & Magic) =====
    // Tanks
    paladin: 0x1b,
    warrior: 0x1d,
    dark_knight: 0x26,
    gunbreaker: 0x2b,
    // Melee DPS
    monk: 0x1c,
    dragoon: 0x1e,
    ninja: 0x24,
    samurai: 0x28,
    reaper: 0x2d,
    viper: 0x65,
    // Physical Ranged DPS
    bard: 0x1f,
    machinist: 0x25,
    dancer: 0x2c,
    // Magical DPS
    black_mage: 0x21,
    summoner: 0x22,
    red_mage: 0x29,
    pictomancer: 0x66,
    blue_mage: 0x2a,
    // Healers
    white_mage: 0x20,
    scholar: 0x23,
    astrologian: 0x27,
    sage: 0x2e,

    // ===== Section 2: Base Classes =====
    gladiator: 0x12,
    pugilist: 0x13,
    marauder: 0x14,
    lancer: 0x15,
    archer: 0x16,
    conjurer: 0x17,
    thaumaturge: 0x18,
    arcanist: 0x19,
    rogue: 0x1a,

    // ===== Section 3: Generic Roles =====
    tank: 0x2f,
    tank_1: 0x30,
    tank_2: 0x31,
    healer: 0x32,
    healer_1: 0x33,
    healer_2: 0x34,
    dps: 0x35,
    dps_1: 0x36,
    dps_2: 0x37,
    dps_3: 0x38,
    dps_4: 0x39,
    melee_dps: 0x76,
    ranged_dps: 0x77,
    physical_ranged_dps: 0x78,
    magical_ranged_dps: 0x79,
    pure_healer: 0x7a,
    barrier_healer: 0x7b,

    // ===== Section 4: Attack Markers & Mechanics =====
    // AOE Types
    line_aoe: 0x01,
    circle_aoe: 0x09,
    fan_aoe: 0x0a,
    donut_aoe: 0x11,
    proximity: 0x10,
    moving_circle_aoe: 0x7e,
    one_person_aoe: 0x7f,
    two_person_aoe: 0x80,
    three_person_aoe: 0x81,
    four_person_aoe: 0x82,
    // Mechanics
    marker: 0x0b,
    gaze: 0x0d,
    stack: 0x0e,
    line_stack: 0x0f,
    stack_multi: 0x6a,
    proximity_player: 0x6b,
    tankbuster: 0x6c,
    radial_knockback: 0x6d,
    linear_knockback: 0x6e,
    tower: 0x6f,
    targeting_indicator: 0x70,

    // ===== Section 5: Waymarks, Signs & Target Markers =====
    // Waymarks
    waymark_a: 0x4f,
    waymark_b: 0x50,
    waymark_c: 0x51,
    waymark_d: 0x52,
    waymark_1: 0x53,
    waymark_2: 0x54,
    waymark_3: 0x55,
    waymark_4: 0x56,
    // Target Markers (Attack)
    attack_1: 0x41,
    attack_2: 0x42,
    attack_3: 0x43,
    attack_4: 0x44,
    attack_5: 0x45,
    attack_6: 0x73,
    attack_7: 0x74,
    attack_8: 0x75,
    // Target Markers (Bind/Ignore)
    bind_1: 0x46,
    bind_2: 0x47,
    bind_3: 0x48,
    ignore_1: 0x49,
    ignore_2: 0x4a,
    // Target Markers (Shapes)
    sign_square: 0x4b,
    sign_circle: 0x4c,
    sign_plus: 0x4d,
    sign_triangle: 0x4e,
    // Lock-on Markers
    lockon_red: 0x83,
    lockon_blue: 0x84,
    lockon_purple: 0x85,
    lockon_green: 0x86,
    // Enemies & Effects
    enemy_small: 0x3c,
    enemy_medium: 0x3e,
    enemy_large: 0x40,
    enhancement_effect: 0x71,
    enfeeblement_effect: 0x72,

    // ===== Section 6: Signs, Symbols & Fields =====
    // Field Objects
    checkered_circle: 0x04,
    checkered_square: 0x08,
    grey_circle: 0x7c,
    grey_square: 0x7d,
    // Line & Arrow
    line: 0x0c,
    up_arrow: 0x5e,
    // Rotation Symbols
    rotate: 0x67,
    rotate_cw: 0x8b,
    rotate_ccw: 0x8c,
    // Highlighted Shapes
    highlight_circle: 0x87,
    highlight_x: 0x88,
    highlight_square: 0x89,
    highlight_triangle: 0x8a,
    // Standard Signs
    standard_circle: 0x57,
    standard_x: 0x58,
    standard_triangle: 0x59,
    standard_square: 0x5a,
    // Text
    text: 0x64,
} as const;

// Reverse lookup
export const GAME_TYPE_NAMES = Object.fromEntries(
    Object.entries(GAME_TYPES).map(([k, v]) => [v, k])
) as Record<number, string>;

// Job name to type ID mapping
// Names must match exactly with XIVPlan's jobs.ts (case-insensitive lookup)
const JOB_NAME_TO_ID: Record<string, number> = {
    // Generic Roles (from OBJECT_TYPES.md section 3)
    'any player': 0x2f, // Maps to Tank icon as fallback (no game equivalent)
    tank: 0x2f,
    healer: 0x32,
    support: 0x32, // XIVPlan 'Support' → game Healer
    dps: 0x35,

    // Specific DPS Roles (from OBJECT_TYPES.md section 3: 118-121)
    'melee dps': 0x76,           // 118
    'ranged dps': 0x77,          // 119 (generic ranged)
    'physical ranged dps': 0x78, // 120
    'magic ranged dps': 0x79,    // 121

    // Specific Healer Roles
    'pure healer': 0x7a,         // 122
    'barrier healer': 0x7b,      // 123

    // Tanks
    paladin: 0x1b,
    warrior: 0x1d,
    'dark knight': 0x26,
    gunbreaker: 0x2b,

    // Healers
    'white mage': 0x20,
    scholar: 0x23,
    astrologian: 0x27,
    sage: 0x2e,

    // Melee DPS
    monk: 0x1c,
    dragoon: 0x1e,
    ninja: 0x24,
    samurai: 0x28,
    reaper: 0x2d,
    viper: 0x65,

    // Physical Ranged DPS
    bard: 0x1f,
    machinist: 0x25,
    dancer: 0x2c,

    // Magical Ranged DPS
    'black mage': 0x21,
    summoner: 0x22,
    'red mage': 0x29,
    pictomancer: 0x66,
    'blue mage': 0x2a,

    // Base Classes (Section 2)
    gladiator: 0x12,
    pugilist: 0x13,
    marauder: 0x14,
    lancer: 0x15,
    archer: 0x16,
    conjurer: 0x17,
    thaumaturge: 0x18,
    arcanist: 0x19,
    rogue: 0x1a,
};

// Waymark name to type ID (from OBJECT_TYPES.md section 5)
// XIVPlan uses names like 'Waymark A', 'Waymark 1', etc.
const WAYMARK_NAME_TO_ID: Record<string, number> = {
    // Full names as used in XIVPlan's Markers.tsx
    'waymark a': 0x4f,
    'waymark b': 0x50,
    'waymark c': 0x51,
    'waymark d': 0x52,
    'waymark 1': 0x53,
    'waymark 2': 0x54,
    'waymark 3': 0x55,
    'waymark 4': 0x56,
    // Short names (fallback)
    a: 0x4f,
    b: 0x50,
    c: 0x51,
    d: 0x52,
    '1': 0x53,
    '2': 0x54,
    '3': 0x55,
    '4': 0x56,
};

// Marker shape/attack name to type ID (from OBJECT_TYPES.md section 5)
const MARKER_NAME_TO_ID: Record<string, number> = {
    // Attack markers
    'attack 1': 0x41,
    'attack 2': 0x42,
    'attack 3': 0x43,
    'attack 4': 0x44,
    'attack 5': 0x45,
    'attack 6': 0x73,
    'attack 7': 0x74,
    'attack 8': 0x75,
    // Bind markers
    'bind 1': 0x46,
    'bind 2': 0x47,
    'bind 3': 0x48,
    // Ignore markers
    'ignore 1': 0x49,
    'ignore 2': 0x4a,
    // Shape markers
    square: 0x4b,
    circle: 0x4c,
    plus: 0x4d,
    cross: 0x4d,  // Alias for Plus
    triangle: 0x4e,
    // Lock-on markers
    'red lock-on': 0x83,
    'blue lock-on': 0x84,
    'purple lock-on': 0x85,
    'green lock-on': 0x86,
};

// ============================================================================
// XivPlan to Game Object Conversion
// ============================================================================

export interface GameObject {
    typeId: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: [number, number, number];
    transparency: number;
    paramA: number;
    paramB: number;
    paramC: number;
    textContent?: string; // For Text objects (type 0x64)
}

export interface ConversionResult {
    objects: GameObject[];
    skipped: SceneObject[];
    warnings: string[];
}

/**
 * Convert XIVPlan scene objects to game objects
 */
export function sceneToGameObjects(scene: Scene, stepIndex: number = 0): ConversionResult {
    const step = scene.steps[stepIndex];
    if (!step) {
        return { objects: [], skipped: [], warnings: ['No step found at index ' + stepIndex] };
    }

    const objects: GameObject[] = [];
    const skipped: SceneObject[] = [];
    const warnings: string[] = [];

    // XIVPlan uses center-based coordinates with arena origin at center
    // Game uses top-left origin with 512x384 canvas
    const arenaWidth = scene.arena.width;
    const arenaHeight = scene.arena.height;
    const gameWidth = 512;
    const gameHeight = 384;

    const scaleX = gameWidth / arenaWidth;
    const scaleY = gameHeight / arenaHeight;

    for (const obj of step.objects) {
        const gameObj = convertObject(obj, scaleX, scaleY, arenaWidth, arenaHeight);
        if (gameObj) {
            objects.push(gameObj);
        } else {
            skipped.push(obj);
            warnings.push(`Skipped unsupported object type: ${obj.type}`);
        }
    }

    return { objects, skipped, warnings };
}

function convertObject(
    obj: SceneObject,
    scaleX: number,
    scaleY: number,
    arenaWidth: number,
    arenaHeight: number
): GameObject | null {
    // Coordinate conversion:
    // XIVPlan now uses top-left origin matching the game canvas
    // Both use (0,0) at top-left, +Y going down
    // If arena is 512x384, coords are direct (scale = 1)

    let x = 0,
        y = 0;
    if (isMoveable(obj)) {
        // Direct mapping with optional scaling if arena size differs from 512x384
        x = obj.x * scaleX;
        y = obj.y * scaleY;
    }

    // Get rotation
    let rotation = 0;
    if (isRotateable(obj)) {
        rotation = obj.rotation;
    }

    // Get color
    let color: [number, number, number] = [255, 255, 255];
    if (isColored(obj)) {
        color = hexToRgb(obj.color);
    }

    // Default values
    const gameObj: GameObject = {
        typeId: 0,
        x: Math.round(x),
        y: Math.round(y),
        rotation: Math.round(mod360(rotation + 180) - 180),
        scale: 100, // Default size
        color,
        transparency: 100 - (obj.opacity ?? 100), // Map opacity (100=visible) to transparency (0=visible)
        paramA: 0,
        paramB: 0,
        paramC: 0,
    };

    // Convert based on type
    if (isParty(obj)) {
        const pObj = obj as PartyObject;
        const jobName = pObj.name.toLowerCase();
        gameObj.typeId = JOB_NAME_TO_ID[jobName] ?? GAME_TYPES.dps;
        // Scale 100 = 25px. So scale = width * 4
        gameObj.scale = Math.round((pObj.width || 25) * 4);
        return gameObj;
    }

    if (isEnemy(obj)) {
        const enemy = obj as EnemyObject;
        // Map enemy type based on image name or size
        const imageName = enemy.image?.toLowerCase() || '';
        if (imageName.includes('small')) {
            gameObj.typeId = GAME_TYPES.enemy_small;
        } else if (imageName.includes('medium')) {
            gameObj.typeId = GAME_TYPES.enemy_medium;
        } else if (imageName.includes('large')) {
            gameObj.typeId = GAME_TYPES.enemy_large;
        } else {
            // Default based on width: small <= 32, medium <= 48, large > 48
            const size = enemy.width ?? 32;
            if (size <= 32) {
                gameObj.typeId = GAME_TYPES.enemy_small;
            } else if (size <= 48) {
                gameObj.typeId = GAME_TYPES.enemy_medium;
            } else {
                gameObj.typeId = GAME_TYPES.enemy_large;
            }
        }
        return gameObj;
    }

    if (isCircleZone(obj)) {
        switch (obj.type) {
            case ObjectType.Circle:
                gameObj.typeId = GAME_TYPES.circle_aoe;
                break;
            case ObjectType.Proximity:
                gameObj.typeId = GAME_TYPES.proximity;
                break;
            case ObjectType.Knockback:
                gameObj.typeId = GAME_TYPES.radial_knockback;
                break;
            case ObjectType.RotateCW:
                // Game's RotateCW is a symbol, not a circle zone
                gameObj.typeId = GAME_TYPES.rotate_cw;
                gameObj.scale = 100; // Default symbol size
                break;
            case ObjectType.RotateCCW:
                // Game's RotateCCW is a symbol, not a circle zone
                gameObj.typeId = GAME_TYPES.rotate_ccw;
                gameObj.scale = 100; // Default symbol size
                break;
            default:
                // Unknown circle type - skip
                return null;
        }
        if (isRadiusObject(obj) && (obj.type === ObjectType.Circle || obj.type === ObjectType.Proximity || obj.type === ObjectType.Knockback)) {
            // Game scale formula: size = radius / 2.47 (observed ratio: radius_pixels = size * 2.47)
            gameObj.scale = Math.round(obj.radius / 2.47);
        }
        return gameObj;
    }

    if (isStackZone(obj)) {
        gameObj.typeId = GAME_TYPES.stack;
        return gameObj;
    }

    if (isConeZone(obj)) {
        gameObj.typeId = GAME_TYPES.fan_aoe;
        gameObj.paramA = Math.round(obj.coneAngle); // Arc angle

        // Radius uses same formula as circle: scale = radius / 2.47
        const scale = Math.round(obj.radius / 2.47);
        gameObj.scale = scale;

        // Game stores hitbox center, not circle center
        // Both web and game now use clockwise expansion from rotation direction
        const coneAngle = obj.coneAngle;
        const radiusPx = obj.radius;
        const webRotation = obj.rotation || 0;

        // Web and game now use same rotation system (clockwise from start)
        // Normalize to [-180, 180] for game compatibility
        gameObj.rotation = Math.round(mod360(webRotation + 180) - 180);

        // Calculate hitbox offset using rotation-based approach
        // 1. Calculate offset for rotation=0 (cone pointing up)
        // 2. Rotate the offset by the actual rotation angle
        let offsetX = 0;
        let offsetY = 0;

        if (coneAngle < 270) {
            // Calculate bounding box for rotation=0 cone
            const startRad0 = 0;
            const endRad0 = (coneAngle * Math.PI) / 180;

            const startX0 = Math.sin(startRad0);  // 0
            const startY0 = -Math.cos(startRad0); // -1
            const endX0 = Math.sin(endRad0);
            const endY0 = -Math.cos(endRad0);

            let minX0 = Math.min(0, startX0, endX0);
            let maxX0 = Math.max(0, startX0, endX0);
            let minY0 = Math.min(0, startY0, endY0);
            let maxY0 = Math.max(0, startY0, endY0);

            // For rotation=0: 0° is always in arc, check other cardinals
            minY0 = -1; // North always included
            if (coneAngle > 90) maxX0 = 1;   // East
            if (coneAngle > 180) maxY0 = 1;  // South

            // Base offset for rotation=0, scaled by ~1.04 empirical factor
            const scale = 1.04;
            const baseOffsetX = ((minX0 + maxX0) / 2) * radiusPx * scale;
            const baseOffsetY = ((minY0 + maxY0) / 2) * radiusPx * scale;

            // Rotate offset by webRotation (clockwise)
            const rotRad = (webRotation * Math.PI) / 180;
            offsetX = baseOffsetX * Math.cos(rotRad) - baseOffsetY * Math.sin(rotRad);
            offsetY = baseOffsetX * Math.sin(rotRad) + baseOffsetY * Math.cos(rotRad);
        }

        gameObj.x = Math.round(obj.x + offsetX);
        gameObj.y = Math.round(obj.y + offsetY);

        return gameObj;
    }

    if (isDonutZone(obj)) {
        gameObj.typeId = GAME_TYPES.donut_aoe;
        gameObj.paramA = 360; // Full circle
        // Outer radius uses same formula as circle: scale = radius / 2.47
        const scale = Math.round(obj.radius / 2.47);
        gameObj.scale = scale;
        // Inner radius formula: inner_pixel = (scale * paramB) / 100
        // So: paramB = (innerRadius * 100) / scale
        gameObj.paramB = Math.round((obj.innerRadius * 100) / scale);
        return gameObj;
    }

    // Line AOE now uses ObjectType.Rect - handled by isRectangleZone below

    if (isRectangleZone(obj)) {
        // Rectangle zones use paramA for width and paramB for height
        gameObj.paramA = Math.round(obj.width);
        gameObj.paramB = Math.round(obj.height);
        switch (obj.type) {
            case ObjectType.Rect:
                // Game uses General Marker (0x0B) for Line AOE
                gameObj.typeId = GAME_TYPES.marker;
                return gameObj;
            case ObjectType.LineStack:
                // Line Stack has dedicated type 0x0F
                gameObj.typeId = GAME_TYPES.line_stack;
                return gameObj;
            case ObjectType.LineKnockback:
            case ObjectType.LineKnockAway:
                gameObj.typeId = GAME_TYPES.linear_knockback;
                return gameObj;
        }
    }

    if (isTowerZone(obj)) {
        gameObj.typeId = GAME_TYPES.tower;
        return gameObj;
    }

    // XIVPlan Eye zone maps to game Gaze marker (0x0D)
    if (isEye(obj)) {
        gameObj.typeId = GAME_TYPES.gaze;
        if (isRadiusObject(obj)) {
            // Game scale formula: size = radius / 2.47 (observed ratio: radius_pixels = size * 2.47)
            gameObj.scale = Math.round(obj.radius / 2.47);
        }
        return gameObj;
    }

    // XIVPlan Starburst zone maps to game Tower (0x6F)
    if (isStarburstZone(obj)) {
        gameObj.typeId = GAME_TYPES.tower;
        if (isRadiusObject(obj)) {
            // Game scale formula: size = radius / 2.47 (observed ratio: radius_pixels = size * 2.47)
            gameObj.scale = Math.round(obj.radius / 2.47);
        }
        return gameObj;
    }

    // XIVPlan Exaflare zone (Moving AOE) maps to game moving_circle_aoe (0x7E)
    if (isExaflareZone(obj)) {
        gameObj.typeId = GAME_TYPES.moving_circle_aoe;
        if (isRadiusObject(obj)) {
            gameObj.scale = Math.round(obj.radius / 2.47);
        }
        return gameObj;
    }

    // GameLine (0x0C) - game's line/tether type
    // Game stores: one end (position x, y), other end (PARAM_A/B × 10), thickness (PARAM_C)
    // NOTE: Game position is ONE END of the line, not the center!
    // Web: GameLine (x, y) is the CENTER of the line
    if (isGameLine(obj)) {
        gameObj.typeId = GAME_TYPES.line;

        // Web GameLine: (x, y) is the center, rotation 0 = pointing right
        // Game expects: position = one end, PARAM_A/B = other end

        // Add 90° to convert from web rotation (0=right) to math angle for trig
        const rotRad = ((obj.rotation + 90) * Math.PI) / 180;
        const halfLength = obj.length / 2;

        // Scale coordinates and length if arena differs from 512x384
        const scaledCenterX = gameObj.x;  // Already scaled by convertObject
        const scaledCenterY = gameObj.y;
        const scaledHalfLength = halfLength * scaleX;

        // Calculate BOTH endpoints from the center
        // End 1: center - halfLength in direction (this becomes Position)
        const end1X = scaledCenterX - Math.sin(rotRad) * scaledHalfLength;
        const end1Y = scaledCenterY + Math.cos(rotRad) * scaledHalfLength;

        // End 2: center + halfLength in direction (this becomes PARAM_A/B)
        const end2X = scaledCenterX + Math.sin(rotRad) * scaledHalfLength;
        const end2Y = scaledCenterY - Math.cos(rotRad) * scaledHalfLength;

        // Game Position = one end
        gameObj.x = Math.round(end1X);
        gameObj.y = Math.round(end1Y);

        // PARAM_A = other end X × 10, PARAM_B = other end Y × 10
        gameObj.paramA = Math.round(end2X * 10);
        gameObj.paramB = Math.round(end2Y * 10);

        // PARAM_C = thickness (game range 2-10, default 6)
        gameObj.paramC = Math.min(10, Math.max(2, Math.round(obj.width)));

        return gameObj;
    }

    if (isMarker(obj)) {
        const markerName = obj.name.toLowerCase();
        // Check waymarks first
        const waymarkId = WAYMARK_NAME_TO_ID[markerName];
        if (waymarkId !== undefined) {
            gameObj.typeId = waymarkId;
            return gameObj;
        }
        // Check attack/bind/shape markers
        const markerId = MARKER_NAME_TO_ID[markerName];
        if (markerId !== undefined) {
            gameObj.typeId = markerId;
            return gameObj;
        }
        // Default to general marker
        gameObj.typeId = GAME_TYPES.marker;
        return gameObj;
    }

    if (isText(obj)) {
        gameObj.typeId = GAME_TYPES.text;
        gameObj.textContent = obj.text || ''; // Capture text content for export
        return gameObj;
    }

    // Icon objects (Attack 1-8, Bind 1-3, Ignore 1-2, etc.)
    if (isIcon(obj)) {
        const iconName = obj.name?.toLowerCase() || '';
        const iconImage = obj.image?.toLowerCase() || '';

        // Check for highlighted markers (ultimate folder)
        if (iconImage.includes('ultimate')) {
            if (iconImage.includes('circle')) {
                gameObj.typeId = GAME_TYPES.highlight_circle;
                return gameObj;
            } else if (iconImage.includes('cross')) {
                gameObj.typeId = GAME_TYPES.highlight_x;
                return gameObj;
            } else if (iconImage.includes('square')) {
                gameObj.typeId = GAME_TYPES.highlight_square;
                return gameObj;
            } else if (iconImage.includes('triangle')) {
                gameObj.typeId = GAME_TYPES.highlight_triangle;
                return gameObj;
            }
        }

        // Check attack/bind/ignore/shape markers
        const markerId = MARKER_NAME_TO_ID[iconName];
        if (markerId !== undefined) {
            gameObj.typeId = markerId;
            return gameObj;
        }
        // Unsupported icon type
        return null;
    }

    // Unsupported types: Tether, Draw, Arrow, etc.
    return null;
}

/**
 * Convert hex color to RGB tuple
 */
function hexToRgb(hex: string): [number, number, number] {
    // Handle #RRGGBB and #RRGGBBAA (ignore alpha)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d]{2})?$/i.exec(hex);
    if (result && result[1] && result[2] && result[3]) {
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    }
    return [255, 255, 255];
}

// ============================================================================
// Binary Strategy Generation
// ============================================================================

/**
 * Generate FF14 strategy binary data from game objects
 */
export function generateStrategyBinary(title: string, objects: GameObject[]): Uint8Array {
    const num = objects.length;

    // Title encoding
    const titleBytes = new TextEncoder().encode(title + '\0');
    // Pad to 4-byte alignment
    const paddedTitleLen = Math.ceil((28 + titleBytes.length) / 4) * 4 - 28;
    const titlePadded = new Uint8Array(paddedTitleLen);
    titlePadded.set(titleBytes);

    // Build content blocks
    const content: number[] = [];

    // TYPE blocks: 4 bytes each (0x0002, typeId)
    // For Text objects, also emit text content block (03 00 [LEN] 00 [STRING])
    for (const obj of objects) {
        content.push(0x02, 0x00); // Block ID
        content.push(obj.typeId & 0xff, (obj.typeId >> 8) & 0xff);

        // For Text objects, emit text content block immediately after type block
        if (obj.typeId === GAME_TYPES.text && obj.textContent) {
            // Safeguard: Truncate to 30 chars to prevent game crash (buffer overflow)
            const safeText = obj.textContent.slice(0, 30);
            const textBytes = new TextEncoder().encode(safeText + '\0'); // String + null terminator
            // Pad to 4-byte alignment (required by game format)
            const paddedLen = Math.ceil(textBytes.length / 4) * 4;
            content.push(0x03, 0x00); // Block ID
            content.push(paddedLen & 0xff, (paddedLen >> 8) & 0xff); // Length
            for (let i = 0; i < textBytes.length; i++) {
                content.push(textBytes[i]!);
            }
            // Add padding to 4-byte boundary
            for (let i = textBytes.length; i < paddedLen; i++) {
                content.push(0x00);
            }
        }
    }

    // LAYER block: uint16 per object
    content.push(0x04, 0x00, 0x01, 0x00); // Block header
    content.push(num & 0xff, (num >> 8) & 0xff); // Count
    for (let i = 0; i < num; i++) {
        content.push(0x01, 0x00); // Layer = 1
    }

    // COORD block: int16 pairs (x * 10, y * 10)
    content.push(0x05, 0x00, 0x03, 0x00); // Block header
    content.push(num & 0xff, (num >> 8) & 0xff); // Count
    for (const obj of objects) {
        const x10 = Math.round(obj.x * 10);
        const y10 = Math.round(obj.y * 10);
        content.push(x10 & 0xff, (x10 >> 8) & 0xff);
        content.push(y10 & 0xff, (y10 >> 8) & 0xff);
    }

    // ANGLE block: int16 per object
    content.push(0x06, 0x00, 0x01, 0x00); // Block header
    content.push(num & 0xff, (num >> 8) & 0xff); // Count
    for (const obj of objects) {
        // Encode as signed int16 (two's complement for negatives)
        const angle = obj.rotation < 0 ? obj.rotation + 65536 : obj.rotation;
        content.push(angle & 0xff, (angle >> 8) & 0xff);
    }

    // SIZE block: uint8 per object + padding
    content.push(0x07, 0x00, 0x00, 0x00); // Block header
    content.push(num & 0xff, (num >> 8) & 0xff); // Count
    for (const obj of objects) {
        content.push(obj.scale & 0xff);
    }
    if (num % 2 === 1) content.push(0x00); // Padding

    // TRANS block: 4 bytes per object (RGBA)
    content.push(0x08, 0x00, 0x02, 0x00); // Block header
    content.push(num & 0xff, (num >> 8) & 0xff); // Count
    for (const obj of objects) {
        content.push(obj.color[0], obj.color[1], obj.color[2], obj.transparency || 0);
    }

    // PARAM A, B, C blocks: uint16 per object
    for (const blockId of [0x0a, 0x0b, 0x0c]) {
        content.push(blockId, 0x00, 0x01, 0x00); // Block header
        content.push(num & 0xff, (num >> 8) & 0xff); // Count
        for (const obj of objects) {
            const param = blockId === 0x0a ? obj.paramA : blockId === 0x0b ? obj.paramB : obj.paramC;
            content.push(param & 0xff, (param >> 8) & 0xff);
        }
    }

    // FOOTER block
    content.push(0x03, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00);

    // Build header
    const contentBytes = new Uint8Array(content);
    const totalLen = 28 + titlePadded.length + contentBytes.length;

    const header = new Uint8Array(28);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, 2, true); // Version
    headerView.setUint32(4, totalLen - 16, true); // Size
    // bytes 8-17: reserved (zeros)
    headerView.setUint16(18, totalLen - 28, true); // Content size
    // bytes 20-23: reserved
    headerView.setUint16(24, 1, true); // Object count marker
    headerView.setUint16(26, titlePadded.length, true); // Title length

    // Combine all parts
    const binary = new Uint8Array(totalLen);
    binary.set(header, 0);
    binary.set(titlePadded, 28);
    binary.set(contentBytes, 28 + titlePadded.length);

    return binary;
}

// ============================================================================
// Strategy Import (Binary to Scene)
// ============================================================================

/**
 * Convert Game Code to XIVPlan Scene
 */
export function gameCodeToScene(code: string): Scene {
    // 1. Decode base64/compression
    const binary = decodeStrategy(code);

    // 2. Parse binary to GameObjects
    const gameObjects = parseStrategyBinary(binary);

    // 3. Convert GameObjects to SceneObjects
    const sceneObjects: SceneObject[] = [];

    // Create reverse mapping for types
    const ID_TO_GAME_TYPE: Record<number, string> = {};
    for (const [key, value] of Object.entries(GAME_TYPES)) {
        ID_TO_GAME_TYPE[value] = key;
    }
    // Add markers
    for (const [key, value] of Object.entries(WAYMARK_NAME_TO_ID)) {
        ID_TO_GAME_TYPE[value] = key;
    }
    for (const [key, value] of Object.entries(MARKER_NAME_TO_ID)) {
        ID_TO_GAME_TYPE[value] = key;
    }

    for (const gameObj of gameObjects) {
        const sceneObj = convertGameToSceneObject(gameObj, ID_TO_GAME_TYPE);
        if (sceneObj) {
            sceneObjects.push(sceneObj);
        }
    }

    // 4. Construct Scene
    return {
        nextId: sceneObjects.length + 1,
        arena: {
            shape: ArenaShape.Rectangle,
            width: 512,
            height: 384,
            padding: 0,
            grid: { type: GridType.Rectangular, rows: 6, columns: 8 },
            gridVisible: true,
            snapToGrid: false,
            snapGridSize: 32,
        },
        steps: [{ objects: sceneObjects }],
    };
}

function parseStrategyBinary(binary: Uint8Array): GameObject[] {
    const view = new DataView(binary.buffer);
    let offset = 28; // Header size

    // Read Title Length from header
    const titleLen = view.getUint16(26, true);
    offset += titleLen;

    const objects: GameObject[] = [];

    // 1. Parse TYPE blocks (start of content)
    // Structure: 02 00 [ID] 00
    // For Text objects (0x64), text content block follows immediately: 03 00 [LEN] 00 [STRING]
    while (offset < binary.length) {
        if (view.getUint8(offset) !== 0x02) break; // Not a type block

        const typeId = view.getUint16(offset + 2, true);
        const obj: GameObject = {
            typeId,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 100,
            color: [255, 255, 255],
            transparency: 0,
            paramA: 0,
            paramB: 0,
            paramC: 0
        };
        offset += 4;

        // For Text objects, parse the following text content block (03 00 [LEN] 00 [STRING])
        if (typeId === GAME_TYPES.text && offset < binary.length && view.getUint8(offset) === 0x03) {
            const textBlockLen = view.getUint16(offset + 2, true); // Total length including padding

            if (textBlockLen > 0 && textBlockLen < 256) {
                const textStart = offset + 4;
                // Find null terminator to get actual string length
                let textEnd = textStart;
                while (textEnd < textStart + textBlockLen && textEnd < binary.length && view.getUint8(textEnd) !== 0) {
                    textEnd++;
                }
                const textBytes = binary.slice(textStart, textEnd);
                obj.textContent = new TextDecoder('utf-8').decode(textBytes);

                // Move past text block (header 4 bytes + content)
                offset += 4 + textBlockLen;
            }
        }

        objects.push(obj);
    }

    const num = objects.length;

    // 2. Parse remaining blocks
    while (offset < binary.length) {
        const blockId = view.getUint8(offset);

        // 0x03 is footer (text content is now parsed inline with type blocks)
        if (blockId === 0x03) {
            break; // Footer reached
        }

        // Standard block header: [ID] 00 [SUB] 00 [COUNT] 00
        // But count is at offset+4 (2 bytes)
        // const count = view.getUint16(offset + 4, true); // Unused
        const dataStart = offset + 6;
        let blockSize = 6; // Header size

        // Calculate block data size
        switch (blockId) {
            case 0x04: // Layer (2 bytes per obj)
                blockSize += num * 2;
                break;
            case 0x05: // Coords (4 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const x = view.getInt16(dataStart + i * 4, true);
                    const y = view.getInt16(dataStart + i * 4 + 2, true);
                    const obj = objects[i];
                    if (obj) {
                        obj.x = x / 10;
                        obj.y = y / 10;
                    }
                }
                blockSize += num * 4;
                break;
            case 0x06: // Angle (2 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const angle = view.getUint16(dataStart + i * 2, true);
                    const obj = objects[i];
                    if (obj) obj.rotation = angle;
                }
                blockSize += num * 2;
                break;
            case 0x07: // Size (1 byte per obj + padding)
                for (let i = 0; i < num; i++) {
                    const scale = view.getUint8(dataStart + i);
                    const obj = objects[i];
                    if (obj) obj.scale = scale;
                }
                blockSize += num;
                if (num % 2 === 1) blockSize += 1; // Padding
                break;
            case 0x08: // Transparency/Color (4 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const r = view.getUint8(dataStart + i * 4);
                    const g = view.getUint8(dataStart + i * 4 + 1);
                    const b = view.getUint8(dataStart + i * 4 + 2);
                    const t = view.getUint8(dataStart + i * 4 + 3);
                    const obj = objects[i];
                    if (obj) {
                        obj.color = [r, g, b];
                        obj.transparency = t;
                    }
                }
                blockSize += num * 4;
                break;
            case 0x0A: // Param A (2 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const val = view.getUint16(dataStart + i * 2, true);
                    const obj = objects[i];
                    if (obj) obj.paramA = val;
                }
                blockSize += num * 2;
                break;
            case 0x0B: // Param B (2 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const val = view.getUint16(dataStart + i * 2, true);
                    const obj = objects[i];
                    if (obj) obj.paramB = val;
                }
                blockSize += num * 2;
                break;
            case 0x0C: // Param C (2 bytes per obj)
                for (let i = 0; i < num; i++) {
                    const val = view.getUint16(dataStart + i * 2, true);
                    const obj = objects[i];
                    if (obj) obj.paramC = val;
                }
                blockSize += num * 2;
                break;
            case 0x09: // Unknown block - 2 bytes per obj (observed in some codes)
                blockSize += num * 2;
                break;
            default:
                // Unknown block - skip 1 byte and try to continue
                // This prevents infinite loops while still attempting to parse
                blockSize = 1;
                break;
        }

        offset += blockSize;
    }

    return objects;
}

function convertGameToSceneObject(gameObj: GameObject, idMap: Record<number, string>): SceneObject | null {
    const typeName = idMap[gameObj.typeId];
    if (!typeName) return null;

    const base = {
        id: Math.floor(Math.random() * 100000000), // Numeric ID
        type: ObjectType.Undefined,
        x: gameObj.x,
        y: gameObj.y,
        rotation: mod360(gameObj.rotation + 180) - 180,
        opacity: Math.max(0, 100 - gameObj.transparency),
        color: `#${gameObj.color.map(c => c.toString(16).padStart(2, '0')).join('')}`
    };

    // Helper to calc radius
    const getRadius = () => Math.round(gameObj.scale * 2.47);

    // Map Types

    // 1. Circle AOE
    if (gameObj.typeId === GAME_TYPES.circle_aoe) {
        return { ...base, type: ObjectType.Circle, radius: getRadius() } as any;
    }
    // 2. Fan AOE (Cone)
    if (gameObj.typeId === GAME_TYPES.fan_aoe) {
        return {
            ...base,
            type: ObjectType.Cone,
            radius: getRadius(),
            coneAngle: gameObj.paramA || 90
        } as any;
    }
    // 3. Donut
    // Per user observation: inner_pixel = (scale * paramB) / 100
    if (gameObj.typeId === GAME_TYPES.donut_aoe) {
        const outerRadius = getRadius();
        const innerRadius = Math.round((gameObj.scale * gameObj.paramB) / 100);
        return {
            ...base,
            type: ObjectType.Donut,
            radius: outerRadius,
            innerRadius: innerRadius
        } as any;
    }
    // 4. Line AOE
    // Per docs: ParamA = Width, ParamB = Height
    // Now uses ObjectType.Rect (displayed as "Line" in UI)
    if (gameObj.typeId === GAME_TYPES.line_aoe) {
        return {
            ...base,
            type: ObjectType.Rect,  // Line AOE uses Rect type internally
            width: gameObj.paramA || 10,
            height: gameObj.paramB || 10,  // Rect uses 'height' not 'length'
            hollow: false
        } as any;
    }
    // 5. Mechanics
    if (gameObj.typeId === GAME_TYPES.stack) {
        return { ...base, type: ObjectType.Stack, radius: getRadius() } as any;
    }
    if (gameObj.typeId === GAME_TYPES.tower) {
        return { ...base, type: ObjectType.Tower, radius: getRadius() } as any;
    }
    if (gameObj.typeId === GAME_TYPES.gaze) {
        return { ...base, type: ObjectType.Eye, radius: getRadius() } as any;
    }
    if (gameObj.typeId === GAME_TYPES.proximity) {
        return { ...base, type: ObjectType.Proximity, radius: getRadius() } as any;
    }
    if (gameObj.typeId === GAME_TYPES.radial_knockback) {
        return { ...base, type: ObjectType.Knockback, radius: getRadius() } as any;
    }
    if (gameObj.typeId === GAME_TYPES.linear_knockback) {
        return { ...base, type: ObjectType.LineKnockback, width: 20, height: 60 } as any; // Approximate defaults
    }

    // 5.5 Game Line (0x0C) - game's line/tether type
    // Game stores: center position (x, y), end point (paramA/10, paramB/10), thickness (paramC)
    if (gameObj.typeId === GAME_TYPES.line) {
        // Calculate end point from paramA/B (stored as × 10)
        const endX = gameObj.paramA / 10;
        const endY = gameObj.paramB / 10;

        // Calculate length as distance from center to end, doubled (line extends both directions from center)
        const dx = endX - gameObj.x;
        const dy = endY - gameObj.y;
        const halfLength = Math.sqrt(dx * dx + dy * dy);
        const length = Math.round(halfLength * 2);

        // Calculate rotation from direction vector
        // Game: rotation points from center to end
        // Web: rotation 0 = horizontal (right), need to convert from math angle
        let rotation = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        rotation = mod360(rotation + 180) - 180;

        return {
            ...base,
            type: ObjectType.GameLine,
            length: length || 100,
            width: gameObj.paramC || 6,  // thickness, game range 2-10
            rotation: rotation
        } as any;
    }

    // 6. Jobs/Roles (Party)
    // Create mapping from game type ID to job icon info
    const gameTypeToJob: Record<number, { name: string; icon: string }> = {
        // Jobs
        [GAME_TYPES.paladin]: { name: 'Paladin', icon: '/actor/PLD.webp' },
        [GAME_TYPES.warrior]: { name: 'Warrior', icon: '/actor/WAR.webp' },
        [GAME_TYPES.dark_knight]: { name: 'Dark Knight', icon: '/actor/DRK.webp' },
        [GAME_TYPES.gunbreaker]: { name: 'Gunbreaker', icon: '/actor/GNB.webp' },
        [GAME_TYPES.white_mage]: { name: 'White Mage', icon: '/actor/WHM.webp' },
        [GAME_TYPES.scholar]: { name: 'Scholar', icon: '/actor/SCH.webp' },
        [GAME_TYPES.astrologian]: { name: 'Astrologian', icon: '/actor/AST.webp' },
        [GAME_TYPES.sage]: { name: 'Sage', icon: '/actor/SGE.webp' },
        [GAME_TYPES.monk]: { name: 'Monk', icon: '/actor/MNK.webp' },
        [GAME_TYPES.dragoon]: { name: 'Dragoon', icon: '/actor/DRG.webp' },
        [GAME_TYPES.ninja]: { name: 'Ninja', icon: '/actor/NIN.webp' },
        [GAME_TYPES.samurai]: { name: 'Samurai', icon: '/actor/SAM.webp' },
        [GAME_TYPES.reaper]: { name: 'Reaper', icon: '/actor/RPR.webp' },
        [GAME_TYPES.viper]: { name: 'Viper', icon: '/actor/VPR.webp' },
        [GAME_TYPES.bard]: { name: 'Bard', icon: '/actor/BRD.webp' },
        [GAME_TYPES.machinist]: { name: 'Machinist', icon: '/actor/MCH.webp' },
        [GAME_TYPES.dancer]: { name: 'Dancer', icon: '/actor/DNC.webp' },
        [GAME_TYPES.black_mage]: { name: 'Black Mage', icon: '/actor/BLM.webp' },
        [GAME_TYPES.summoner]: { name: 'Summoner', icon: '/actor/SMN.webp' },
        [GAME_TYPES.red_mage]: { name: 'Red Mage', icon: '/actor/RDM.webp' },
        [GAME_TYPES.pictomancer]: { name: 'Pictomancer', icon: '/actor/PCT.webp' },
        [GAME_TYPES.blue_mage]: { name: 'Blue Mage', icon: '/actor/BLU.webp' },
        // Base Classes
        [GAME_TYPES.gladiator]: { name: 'Gladiator', icon: '/actor/GLA.webp' },
        [GAME_TYPES.pugilist]: { name: 'Pugilist', icon: '/actor/PGL.webp' },
        [GAME_TYPES.marauder]: { name: 'Marauder', icon: '/actor/MRD.webp' },
        [GAME_TYPES.lancer]: { name: 'Lancer', icon: '/actor/LNC.webp' },
        [GAME_TYPES.archer]: { name: 'Archer', icon: '/actor/ARC.webp' },
        [GAME_TYPES.conjurer]: { name: 'Conjurer', icon: '/actor/CNJ.webp' },
        [GAME_TYPES.thaumaturge]: { name: 'Thaumaturge', icon: '/actor/THM.webp' },
        [GAME_TYPES.arcanist]: { name: 'Arcanist', icon: '/actor/ACN.webp' },
        [GAME_TYPES.rogue]: { name: 'Rogue', icon: '/actor/ROG.webp' },
        // Generic Roles
        [GAME_TYPES.tank]: { name: 'Tank', icon: '/actor/tank.webp' },
        [GAME_TYPES.tank_1]: { name: 'Tank 1', icon: '/actor/tank.webp' },
        [GAME_TYPES.tank_2]: { name: 'Tank 2', icon: '/actor/tank.webp' },
        [GAME_TYPES.healer]: { name: 'Healer', icon: '/actor/healer.webp' },
        [GAME_TYPES.healer_1]: { name: 'Healer 1', icon: '/actor/healer.webp' },
        [GAME_TYPES.healer_2]: { name: 'Healer 2', icon: '/actor/healer.webp' },
        [GAME_TYPES.dps]: { name: 'DPS', icon: '/actor/dps.webp' },
        [GAME_TYPES.dps_1]: { name: 'DPS 1', icon: '/actor/dps.webp' },
        [GAME_TYPES.dps_2]: { name: 'DPS 2', icon: '/actor/dps.webp' },
        [GAME_TYPES.dps_3]: { name: 'DPS 3', icon: '/actor/dps.webp' },
        [GAME_TYPES.dps_4]: { name: 'DPS 4', icon: '/actor/dps.webp' },
        [GAME_TYPES.melee_dps]: { name: 'Melee DPS', icon: '/actor/melee.webp' },
        [GAME_TYPES.ranged_dps]: { name: 'Ranged DPS', icon: '/actor/ranged.webp' },
        [GAME_TYPES.physical_ranged_dps]: { name: 'Physical Ranged', icon: '/actor/physical_ranged.webp' },
        [GAME_TYPES.magical_ranged_dps]: { name: 'Magic Ranged', icon: '/actor/magic_ranged.webp' },
        [GAME_TYPES.pure_healer]: { name: 'Pure Healer', icon: '/actor/healer.webp' },
        [GAME_TYPES.barrier_healer]: { name: 'Barrier Healer', icon: '/actor/healer.webp' },
    };

    const jobInfo = gameTypeToJob[gameObj.typeId];
    if (jobInfo) {
        // Calculate size from scale (default icon size is 25, scale 100 = default)
        // size = 25 * (scale / 100) = scale / 4
        const size = Math.round(gameObj.scale / 4);
        return {
            ...base,
            type: ObjectType.Party,
            name: jobInfo.name,
            image: jobInfo.icon,
            width: size || 25,
            height: size || 25,
            status: [],
        } as any;
    }

    // 7. Marker (Waymarks)
    if (gameObj.typeId >= 0x4F && gameObj.typeId <= 0x56) { // Waymarks
        const waymarkNames: Record<number, { name: string; image: string; shape: 'circle' | 'square'; color: string }> = {
            0x4F: { name: 'Waymark A', image: '/marker/waymark_a.webp', shape: 'circle', color: '#ff0000' },
            0x50: { name: 'Waymark B', image: '/marker/waymark_b.webp', shape: 'circle', color: '#ffff00' },
            0x51: { name: 'Waymark C', image: '/marker/waymark_c.webp', shape: 'circle', color: '#0000ff' },
            0x52: { name: 'Waymark D', image: '/marker/waymark_d.webp', shape: 'circle', color: '#aa00aa' },
            0x53: { name: 'Waymark 1', image: '/marker/waymark_1.webp', shape: 'square', color: '#ff0000' },
            0x54: { name: 'Waymark 2', image: '/marker/waymark_2.webp', shape: 'square', color: '#ffff00' },
            0x55: { name: 'Waymark 3', image: '/marker/waymark_3.webp', shape: 'square', color: '#0000ff' },
            0x56: { name: 'Waymark 4', image: '/marker/waymark_4.webp', shape: 'square', color: '#aa00aa' },
        };
        const waymark = waymarkNames[gameObj.typeId];
        if (waymark) {
            return {
                ...base,
                type: ObjectType.Marker,
                name: waymark.name,
                image: waymark.image,
                shape: waymark.shape,
                color: waymark.color,
                width: 42,
                height: 42,
            } as any;
        }
    }

    // 7b. General Marker (0x0B) - uses paramA and paramB as width and height
    if (gameObj.typeId === GAME_TYPES.marker) {
        // If it has width/height params, treat as a Rect (Line AOE)
        if (gameObj.paramA > 0 || gameObj.paramB > 0) {
            return {
                ...base,
                type: ObjectType.Rect,
                width: gameObj.paramA || 10,
                height: gameObj.paramB || 10,
                // Rect uses center coords, game also uses center - no adjustment needed
            } as any;
        }
        // Fallback to a basic marker if no params
        return { ...base, type: ObjectType.Marker, name: '' } as any;
    }

    // 8. Highlighted Shapes (Ultimate markers)
    const highlightedShapeMap: Record<number, { name: string; icon: string }> = {
        [GAME_TYPES.highlight_circle]: { name: 'Highlighted Circle', icon: '/marker/ultimate/circle.webp' },
        [GAME_TYPES.highlight_x]: { name: 'Highlighted X', icon: '/marker/ultimate/cross.webp' },
        [GAME_TYPES.highlight_square]: { name: 'Highlighted Square', icon: '/marker/ultimate/square.webp' },
        [GAME_TYPES.highlight_triangle]: { name: 'Highlighted Triangle', icon: '/marker/ultimate/triangle.webp' },
    };

    const highlightedShape = highlightedShapeMap[gameObj.typeId];
    if (highlightedShape) {
        return {
            ...base,
            type: ObjectType.Icon,
            name: highlightedShape.name,
            image: highlightedShape.icon,
            width: 32,
            height: 32,
        } as any;
    }

    // 9. Text
    if (gameObj.typeId === GAME_TYPES.text) {
        return {
            ...base,
            type: ObjectType.Text,
            text: gameObj.textContent || 'Text', // Use parsed text content or default
            fontSize: 24,
            style: 'outline',
            stroke: '#000000',
            align: 'center',
        } as any;
    }

    // Default fallback
    return null;
}

/**
 * Convert XIVPlan Scene to FF14 game strategy code
 */
export function sceneToGameCode(scene: Scene, stepIndex: number = 0, title: string = 'XIVPlan Export'): string {
    const { objects, warnings } = sceneToGameObjects(scene, stepIndex);

    if (objects.length === 0) {
        throw new Error('No exportable objects found. ' + warnings.join('; '));
    }

    const binary = generateStrategyBinary(title, objects);
    return encodeStrategy(binary);
}

/**
 * Check which objects in a scene can be exported to game code
 */
export function getExportableStats(
    scene: Scene,
    stepIndex: number = 0
): { exportable: number; total: number; unsupported: string[] } {
    const step = scene.steps[stepIndex];
    if (!step) return { exportable: 0, total: 0, unsupported: [] };

    const unsupportedTypes = new Set<string>();
    let exportable = 0;

    for (const obj of step.objects) {
        // Check if object is exportable
        if (
            isParty(obj) ||
            isEnemy(obj) ||
            isCircleZone(obj) ||
            isStackZone(obj) ||
            isConeZone(obj) ||
            isDonutZone(obj) ||
            isRectangleZone(obj) ||  // Includes Line AOE (Rect type)
            isTowerZone(obj) ||
            isEye(obj) ||
            isStarburstZone(obj) ||
            isMarker(obj) ||
            isText(obj) ||
            isGameLine(obj) ||  // Game's 0x0C line type
            isIcon(obj)  // Icon objects (highlighted markers, attack/bind markers, etc.)
        ) {
            exportable++;
        } else {
            unsupportedTypes.add(obj.type);
        }
    }

    return {
        exportable,
        total: step.objects.length,
        unsupported: Array.from(unsupportedTypes),
    };
}

/**
 * Export debug information for troubleshooting conversions
 */
export interface DebugObjectInfo {
    originalType: string;
    originalName: string;
    gameTypeId: number;
    gameTypeName: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: [number, number, number];
    paramA: number;
    paramB: number;
    paramC: number;
}

export function getDebugExportData(
    scene: Scene,
    stepIndex: number = 0
): { objects: DebugObjectInfo[]; skipped: string[]; arenaInfo: { width: number; height: number; scaleX: number; scaleY: number } } {
    const step = scene.steps[stepIndex];
    if (!step) {
        return { objects: [], skipped: [], arenaInfo: { width: 0, height: 0, scaleX: 0, scaleY: 0 } };
    }

    const arenaWidth = scene.arena.width;
    const arenaHeight = scene.arena.height;
    const gameWidth = 512;
    const gameHeight = 384;
    const scaleX = gameWidth / arenaWidth;
    const scaleY = gameHeight / arenaHeight;

    const debugObjects: DebugObjectInfo[] = [];
    const skipped: string[] = [];

    for (const obj of step.objects) {
        const gameObj = convertObject(obj, scaleX, scaleY, arenaWidth, arenaHeight);
        if (gameObj) {
            debugObjects.push({
                originalType: obj.type,
                originalName: 'name' in obj ? (obj as { name: string }).name : '',
                gameTypeId: gameObj.typeId,
                gameTypeName: GAME_TYPE_NAMES[gameObj.typeId] ?? `unknown_0x${gameObj.typeId.toString(16)}`,
                x: gameObj.x,
                y: gameObj.y,
                rotation: gameObj.rotation,
                scale: gameObj.scale,
                color: gameObj.color,
                paramA: gameObj.paramA,
                paramB: gameObj.paramB,
                paramC: gameObj.paramC,
            });
        } else {
            skipped.push(`${obj.type}${'name' in obj ? ` (${(obj as { name: string }).name})` : ''}`);
        }
    }

    return {
        objects: debugObjects,
        skipped,
        arenaInfo: { width: arenaWidth, height: arenaHeight, scaleX, scaleY },
    };
}

# Object Type Mapping

Complete binary mapping for FFXIV Strategy Board objects.
Format: `02 00 [TYPE_ID] 00` (4 bytes per object)

---

## 1. Disciple of War & Magic (Jobs)

| ID (Dec) | ID (Hex) | Job Name | Role |
| :---: | :---: | :--- | :--- |
| 27 | 0x1B | Paladin | Tank |
| 29 | 0x1D | Warrior | Tank |
| 38 | 0x26 | Dark Knight | Tank |
| 43 | 0x2B | Gunbreaker | Tank |
| 28 | 0x1C | Monk | Melee DPS |
| 30 | 0x1E | Dragoon | Melee DPS |
| 36 | 0x24 | Ninja | Melee DPS |
| 40 | 0x28 | Samurai | Melee DPS |
| 45 | 0x2D | Reaper | Melee DPS |
| 101 | 0x65 | Viper | Melee DPS |
| 31 | 0x1F | Bard | Physical Ranged DPS |
| 37 | 0x25 | Machinist | Physical Ranged DPS |
| 44 | 0x2C | Dancer | Physical Ranged DPS |
| 33 | 0x21 | Black Mage | Magical Ranged DPS |
| 34 | 0x22 | Summoner | Magical Ranged DPS |
| 41 | 0x29 | Red Mage | Magical Ranged DPS |
| 42 | 0x2A | Blue Mage | Limited Job |
| 102 | 0x66 | Pictomancer | Magical Ranged DPS |
| 32 | 0x20 | White Mage | Healer |
| 35 | 0x23 | Scholar | Healer |
| 39 | 0x27 | Astrologian | Healer |
| 46 | 0x2E | Sage | Healer |

## 2. Classes (Base)

| ID (Dec) | ID (Hex) | Class Name |
| :---: | :---: | :--- |
| 18 | 0x12 | Gladiator |
| 19 | 0x13 | Pugilist |
| 20 | 0x14 | Marauder |
| 21 | 0x15 | Lancer |
| 22 | 0x16 | Archer |
| 23 | 0x17 | Conjurer |
| 24 | 0x18 | Thaumaturge |
| 25 | 0x19 | Arcanist |
| 26 | 0x1A | Rogue |

## 3. Generic Roles

| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 47 | 0x2F | Tank |
| 48 | 0x30 | Tank 1 |
| 49 | 0x31 | Tank 2 |
| 50 | 0x32 | Healer |
| 51 | 0x33 | Healer 1 |
| 52 | 0x34 | Healer 2 |
| 53 | 0x35 | DPS |
| 54 | 0x36 | DPS 1 |
| 55 | 0x37 | DPS 2 |
| 56 | 0x38 | DPS 3 |
| 57 | 0x39 | DPS 4 |
| 118 | 0x76 | Melee DPS |
| 119 | 0x77 | Ranged DPS |
| 120 | 0x78 | Physical Ranged DPS |
| 121 | 0x79 | Magical Ranged DPS |
| 122 | 0x7A | Pure Healer |
| 123 | 0x7B | Barrier Healer |

---

## 4. Attack Markers & Mechanics

| ID (Dec) | ID (Hex) | Name | Category | Notes |
| :---: | :---: | :--- | :--- | :--- |
| 1 | 0x01 | Line AOE | AOE | Params: H, W |
| 9 | 0x09 | Circle AOE | AOE | [Verified] |
| 10 | 0x0A | Fan AOE | AOE | Params: Arc [Verified] |
| 11 | 0x0B | General Marker | Marker | |
| 13 | 0x0D | Gaze | Mechanic | |
| 14 | 0x0E | Stack | Marker | |
| 15 | 0x0F | Line Stack | Marker | |
| 16 | 0x10 | Proximity | AOE | |
| 17 | 0x11 | Donut AOE | AOE | Params: R, Arc |
| 106 | 0x6A | Stack (Multi-hit) | Marker | |
| 107 | 0x6B | Proximity (Player) | Marker | |
| 108 | 0x6C | Tankbuster (Single) | Marker | |
| 109 | 0x6D | Radial Knockback | Mechanic | |
| 110 | 0x6E | Linear Knockback | Mechanic | Params: Counts |
| 111 | 0x6F | Tower | Mechanic | |
| 112 | 0x70 | Targeting Indicator | Marker | |
| 126 | 0x7E | Moving Circle AOE | Attack | |
| 127 | 0x7F | 1-Person AOE | Attack | |
| 128 | 0x80 | 2-Person AOE | Attack | |
| 129 | 0x81 | 3-Person AOE | Attack | |
| 130 | 0x82 | 4-Person AOE | Attack | |

---

## 5. Waymarks, Signs & Indicators

### Waymarks
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 79 | 0x4F | Waymark A |
| 80 | 0x50 | Waymark B |
| 81 | 0x51 | Waymark C |
| 82 | 0x52 | Waymark D |
| 83 | 0x53 | Waymark 1 |
| 84 | 0x54 | Waymark 2 |
| 85 | 0x55 | Waymark 3 |
| 86 | 0x56 | Waymark 4 |

### Target Markers (Targeting & Shapes)
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 65 | 0x41 | Attack 1 |
| 66 | 0x42 | Attack 2 |
| 67 | 0x43 | Attack 3 |
| 68 | 0x44 | Attack 4 |
| 69 | 0x45 | Attack 5 |
| 115 | 0x73 | Attack 6 |
| 116 | 0x74 | Attack 7 |
| 117 | 0x75 | Attack 8 |
| 70 | 0x46 | Bind 1 |
| 71 | 0x47 | Bind 2 |
| 72 | 0x48 | Bind 3 |
| 73 | 0x49 | Ignore 1 |
| 74 | 0x4A | Ignore 2 |
| 75 | 0x4B | Square |
| 76 | 0x4C | Circle |
| 77 | 0x4D | Plus |
| 78 | 0x4E | Triangle |

### Lock-on Markers
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 131 | 0x83 | Red Lock-on |
| 132 | 0x84 | Blue Lock-on |
| 133 | 0x85 | Purple Lock-on |
| 134 | 0x86 | Green Lock-on |

### Enemies & Effects
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 113 | 0x71 | Enhancement Effect |
| 114 | 0x72 | Enfeeblement Effect |
| 60 | 0x3C | Small Enemy |
| 62 | 0x3E | Medium Enemy |
| 64 | 0x40 | Large Enemy |

---

## 6. Signs, Symbols & Fields

### Field Objects
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 4 | 0x04 | Checkered Circle |
| 8 | 0x08 | Checkered Square |
| 124 | 0x7C | Grey Circle |
| 125 | 0x7D | Grey Square |

### Line & Arrows
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 12 | 0x0C | Line |
| 94 | 0x5E | Up Arrow |

### Rotation Symbols
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 103 | 0x67 | Rotate |
| 139 | 0x8B | Rotate CW |
| 140 | 0x8C | Rotate CCW |

### Highlighted Shapes
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 135 | 0x87 | Highlighted Circle |
| 136 | 0x88 | Highlighted X |
| 137 | 0x89 | Highlighted Square |
| 138 | 0x8A | Highlighted Triangle |

### Standard Signs
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 87 | 0x57 | Circle |
| 88 | 0x58 | X |
| 89 | 0x59 | Triangle |
| 90 | 0x5A | Square |

### Text
| ID (Dec) | ID (Hex) | Name |
| :---: | :---: | :--- |
| 100 | 0x64 | Text |

---

## 7. Binary Block Structure

Strategy codes use a block-based binary format. Each block follows the pattern:
```
[BLOCK_ID] 00 [SUB_TYPE] 00 [COUNT] 00 [DATA...]
```

### Block ID Reference

| Block ID | Sub Type | Name | Data Format | Description |
| :---: | :---: | :--- | :--- | :--- |
| 02 | [TYPE] | Object Type | 4 bytes per type | Object type metadata |
| 04 | 01 | Layer Info | 2 bytes | Layer/ordering data |
| 05 | 03 | Coord Header | 2 bytes count | Marks start of coordinates |
| 06 | 01 | Angle Block | int16 per object | Rotation angles (0-360°) |
| 07 | 00 | Size Block | uint8 per object | Object size (0-255), see formula below |
| 08 | 02 | Transparency | 4 bytes per object | RGBA values (0-100 for alpha) |
| 0A | 01 | Param A | 2 bytes per object | Type-specific param 1 |
| 0B | 01 | Param B | 2 bytes per object | Type-specific param 2 |
| 0C | 01 | Param C | 2 bytes per object | Type-specific param 3 |
| 03 | 01 | Footer | 2 bytes | End marker |

### Single Object Code Layout (112 bytes)

```
[0-3]    Header: 02 00 00 00 (Magic/Version)
[4-7]    Total Size: uint32
[8-17]   Reserved: zeros
[18-19]  Content Size: uint16
[20-25]  Object Count + padding
[26-27]  Title Length: uint16
[28-N]   Title: UTF-8 + null terminator

[N+0]    02 00 [TYPE] 00     Object Type
[N+4]    04 00 01 00 ...     Layer info
[N+12]   05 00 03 00 [COUNT] Coord header
[N+18]   [X1][Y1]...         Coordinates (int16 pairs, ×10)

[~54]    06 00 01 00 [COUNT] Angle block
[~62]    07 00 00 00 [COUNT] Size block
[~70]    08 00 02 00 [COUNT] Transparency block

[~80]    0A 00 01 00 [COUNT] Param A block (Arc/Width)
[~88]    0B 00 01 00 [COUNT] Param B block (Height/Radius)
[~96]    0C 00 01 00 [COUNT] Param C block
[~104]   03 00 01 00 [COUNT] Footer
```

### Type-Specific Parameter Mapping

| Object Type | Size (Block 07) | Param A (Block 0A) | Param B (Block 0B) | Param C (Block 0C) |
| :--- | :--- | :--- | :--- | :--- |
| Circle AOE | Outer radius | Unused (0) | Unused (0) | Unused |
| Fan AOE (Cone) | Outer radius | Arc angle (1-360°) | Unused (0) | Unused |
| Donut AOE | Outer radius | Arc angle (default 360°) | Inner radius % (0-100) | Unused |
| Line AOE | Unused | Width (pixels) | Height/Length (pixels) | Unused |
| Line (Tether) | Unused | End X coord ×10 | End Y coord ×10 | Height (2-10, default 6) |
| Line Stack | Unused | Width (pixels) | Height (pixels) | Unused |
| General Marker | Unused | Width (pixels) | Height (pixels) | Unused |
| Tower | Outer radius | Unused | Unused | Unused |
| Stack | Outer radius | Unused | Unused | Unused |
| Proximity | Outer radius | Unused | Unused | Unused |
| Knockback | Outer radius | Unused | Unused | Unused |
| Linear Knockback | Unused | Count | Unused | Unused |
| Moving Circle AOE | Outer radius | Unused | Unused | Unused |
| 1-Person AOE | Outer radius | Unused | Unused | Unused |
| 2-Person AOE | Outer radius | Unused | Unused | Unused |
| 3-Person AOE | Outer radius | Unused | Unused | Unused |
| 4-Person AOE | Outer radius | Unused | Unused | Unused |

---

## 8. Units and Formulas

### Coordinate System
| Property | Unit | Range | Notes |
| :--- | :--- | :--- | :--- |
| X, Y | 0.1 pixels | ±32767 | Stored as int16, divide by 10 for pixels |
| Canvas Size | pixels | 512 × 384 | Fixed game board dimensions |
| Origin | - | Top-left (0, 0) | +X right, +Y down |

### Size / Radius Conversion

The game stores size as a uint8 (0-255). To convert between game size and pixel radius:

```
radius_pixels = size × 2.47
size = radius_pixels / 2.47
```

**Examples:**
| Size (Game) | Radius (Pixels) |
| :---: | :---: |
| 50 | 123.5 px |
| 100 | 247 px |
| 200 | 494 px |

### Rotation
| Property | Unit | Range | Notes |
| :--- | :--- | :--- | :--- |
| Angle | degrees | 0-360 | 0° = North, clockwise |

### Fan AOE (Cone) Hitbox

The game stores the **center of the hitbox bounding box**, not the circle center:
- For arc < 270°: Hitbox center is offset from circle center
- For arc ≥ 270°: Hitbox center = Circle center
- Arc expands **clockwise** from the rotation direction

### Donut Inner Radius

The inner radius is stored as a percentage of the outer radius:

```
inner_radius_pixels = (size × paramB) / 100
```

### Text Object Special Structure

Text objects store content inline in metadata:
```
02 00 64 00              Object Type (Text)
03 00 [LEN] 00 [STRING]  Variable-length UTF-8 content
```

### Multi-Object Strategies

In strategies with N objects:
- Each parameter block contains N values
- Block offsets shift based on title length and object count
- Use signatures (05 00 03 00, 07 00 00 00, etc.) to locate blocks

### Line (Tether) Type (0x0C)

The Line object stores position as the **center point** of the line, with end coordinates in PARAM_A/B:

| Parameter | Block | Description |
| :--- | :--- | :--- |
| Position (X, Y) | 0x05 | Center of line ×10 |
| Rotation | 0x06 | Angle in degrees (0° = right, 90° = down) |
| Color | 0x08 | RGBA values |
| PARAM_A | 0x0A | End point X coordinate ×10 |
| PARAM_B | 0x0B | End point Y coordinate ×10 |
| PARAM_C | 0x0C | Height/thickness in pixels (2-10, default 6) |

**Formula to calculate line length:**
```
endX = PARAM_A / 10
endY = PARAM_B / 10
centerX = position_X / 10
centerY = position_Y / 10

deltaX = endX - centerX
deltaY = endY - centerY
halfLength = sqrt(deltaX² + deltaY²)
fullLength = halfLength × 2
```

**Example:**
- Center: (142.9, 192.0)
- PARAM_A: 3692 → endX = 369.2
- PARAM_B: 1920 → endY = 192.0
- Delta: (226.3, 0) → halfLength = 226.3px → fullLength ≈ 453px

---

## 8. Background Types

Background type is stored at **Offset 126** in single-object codes (128 bytes).

| Value | Background Type |
| :---: | :--- |
| 0x01 | None (Blank) |
| 0x02 | Checkered |
| 0x03 | Checkered Circle |
| 0x04 | Checkered Square |
| 0x05 | Grey |
| 0x06 | Grey Circular |
| 0x07 | Grey Square |

# FF14 Strategy Code Binary Structure

> Complete binary structure analysis based on byte-by-byte comparison of 1-4 object samples.
> **Validation Status**: Verified via in-game import tests.

## 1. Overall Structure Overview

```
[HEADER: 28 bytes]
[TITLE: variable, null-terminated, padded for alignment]
[CONTENT BLOCKS: variable]
```

**Total Size Formula**: `Total = 28 + TitleLen + ContentLen`

| Object Count | Total Size | Increment per Object |
|:---:|:---:|:---:|
| 1 | 128 bytes | - |
| 2 | 150 bytes | +22 |
| 3 | 174 bytes | +24 |
| 4 | 196 bytes | +22 |

---

## 2. Header Structure (28 bytes)

| Offset | Size | Name | Description |
|:---:|:---:|:---|:---|
| 0-3 | 4 | Magic | Fixed `02 00 00 00` |
| 4-7 | 4 | SizeCheck1 | = Total - 16 |
| 8-17 | 10 | Reserved | All zeros |
| 18-19 | 2 | SizeCheck2 | = Total - 28 (Content Size) |
| 20-23 | 4 | Padding | All zeros |
| 24-25 | 2 | Flag | Fixed `01 00` |
| 26-27 | 2 | TitleLen | Title length including padding |

### Header Example (2 Objects, 150 bytes)
```
02 00 00 00   Magic = 2
86 00 00 00   SizeCheck1 = 134 (150-16)
00 00 00 00 00 00 00 00 00 00   Reserved
7a 00         SizeCheck2 = 122 (150-28)
00 00 00 00   Padding
01 00         Flag = 1
14 00         TitleLen = 20
```

---

## 3. Title Block (Variable)

- Start Position: Offset 28
- Format: UTF-8 string + `00` terminator
- **Alignment Rule**: Header (28 bytes) + TitleLen must be a multiple of 4 bytes.
- If 4-byte alignment is not met, the code will fail to import.

### Example
```
"New Strategy Board" = 18 chars + 2 null bytes = 20 bytes
4e 65 77 20 53 74 72 61 74 65 67 79 20 42 6f 61 72 64 00 00
```

---

## 4. Content Blocks Structure

Each block format:
```
[BlockID: 2 bytes] [Count: 2 bytes] [Data: variable]
```

BlockID format is `[ID] 00 [SubType] 00`

### Block Sequence (Fixed)

| # | BlockID | Name | SubType | Data Format |
|:---:|:---:|:---|:---:|:---|
| 1-N | 02 00 XX 00 | TYPE | TypeID | 4 bytes each |
| - | 04 00 01 00 | LAYER | 01 | **uint16** * N |
| - | 05 00 03 00 | COORD | 03 | int16[2] * N |
| - | 06 00 01 00 | ANGLE | 01 | int16 * N |
| - | 07 00 00 00 | SIZE | 00 | uint8 * N (padded) |
| - | 08 00 02 00 | TRANS | 02 | RGBA[4] * N |
| - | 0A 00 01 00 | PARAM_A | 01 | uint16 * N |
| - | 0B 00 01 00 | PARAM_B | 01 | uint16 * N |
| - | 0C 00 01 00 | PARAM_C | 01 | uint16 * N |
| - | 03 00 01 00 | FOOTER | 01 | Fixed 8 bytes |

---

## 5. Block Details

### 5.1 TYPE Block (02 00 XX 00)

One 4-byte block per object, where `XX` = Object Type ID.

```
1 Object: 02 00 2f 00                     (Tank = 0x2F)
2 Objects: 02 00 2f 00 02 00 2f 00         (Tank, Tank)
```

### 5.2 LAYER Block (04 00 01 00)

```
Format: 04 00 01 00 [Count] 00 [uint16 * N]
```

**Key Finding**: LAYER uses `uint16` instead of `uint8`.

| Object Count | Hex |
|:---:|:---|
| 1 | `04 00 01 00 01 00 01 00` |
| 2 | `04 00 01 00 02 00 01 00 01 00` |
| 3 | `04 00 01 00 03 00 01 00 01 00 01 00` |

### 5.3 COORD Block (05 00 03 00)

```
Format: 05 00 03 00 [Count] 00 [X1][Y1] [X2][Y2] ...
Data: int16 pairs (X, Y), scaled by 10
```

Coordinate Example:
- (0, 0) → `00 00 00 00`
- (512, 384) → `00 14 00 0f` (5120, 3840 in raw)

### 5.4 ANGLE Block (06 00 01 00)

```
Format: 06 00 01 00 [Count] 00 [int16 * N]
Each int16 = Rotation Angle * 10
```

### 5.5 SIZE Block (07 00 00 00)

```
Format: 07 00 00 00 [Count] 00 [uint8 * N]
Default value: 0x64 (100%)
If N is odd, append 0x00 for alignment.
```

### 5.6 TRANS Block (08 00 02 00)

```
Format: 08 00 02 00 [Count] 00 [RGBA * N]
Each RGBA = 4 bytes (R, G, B, A)
Default: FF FF FF 00 (White, Opaque)
```

### 5.7 PARAM Blocks (0A/0B/0C 00 01 00)

```
Format: 0X 00 01 00 [Count] 00 [uint16 * N]
```

Usage:
- **0A (PARAM_A)**: Fan AOE Arc Angle
- **0B (PARAM_B)**: Line AOE Width
- **0C (PARAM_C)**: Donut AOE Inner Radius

### 5.8 FOOTER Block (03 00 01 00)

Fixed 8 bytes:
```
03 00 01 00 01 00 01 00
```

---

## 6. Multi-Object Size Increments

Total size increases by approximately **22-24 bytes** for each additional object.

| Block | Per-Object Size |
|:---:|:---:|
| TYPE | +4 bytes |
| LAYER | +2 bytes (uint16) |
| COORD | +4 bytes |
| ANGLE | +2 bytes |
| SIZE | +1 byte |
| TRANS | +4 bytes |
| PARAM_A | +2 bytes |
| PARAM_B | +2 bytes |
| PARAM_C | +2 bytes |
| **Total** | **~23 bytes** |

---

## 7. Coordinate System

- Game coordinate range: 0-512
- Storage format: `int16 * 10`
- Top-left corner: (0, 0)
- Bottom-right corner: (512, 384)

```python
# Encoding
x_raw = int(game_x * 10)
y_raw = int(game_y * 10)

# Decoding
game_x = x_raw / 10.0
game_y = y_raw / 10.0
```

---

## 8. Verified Structure Example

### 2 Objects Complete Binary (150 bytes)
```
[Header 28 bytes]
02 00 00 00 86 00 00 00 00 00 00 00 00 00 00 00
00 00 7a 00 00 00 00 00 01 00 14 00

[Title 20 bytes]
4e 65 77 20 53 74 72 61 74 65 67 79 20 42 6f 61 72 64 00 00

[TYPE x2]
02 00 2f 00 02 00 2f 00

[LAYER]
04 00 01 00 02 00 01 00 01 00

[COORD]
05 00 03 00 02 00 00 00 00 0f 00 00 00 00

[ANGLE]
06 00 01 00 02 00 00 00 00 00

[SIZE]
07 00 00 00 02 00 64 64

[TRANS]
08 00 02 00 02 00 ff ff ff 00 ff ff ff 00

[PARAM_A]
0a 00 01 00 02 00 00 00 00 00

[PARAM_B]
0b 00 01 00 02 00 00 00 00 00

[PARAM_C]
0c 00 01 00 02 00 00 00 00 00

[FOOTER]
03 00 01 00 01 00 01 00
```

---

## 9. Multi-Object Code Scaling Formula

### 9.1 Total Size Calculation

```
Total = 28 + TitleLen + ContentLen
ContentLen = TypeBlocks + LayerBlock + CoordBlock + AngleBlock + 
             SizeBlock + TransBlock + ParamBlocks + Footer
```

### 9.2 Per-Block Size Formula

| Block | Size Formula | N=1 | N=48 |
|:---|:---|:---:|:---:|
| TYPE | 4 × N | 4 | 192 |
| LAYER | 6 + 2 × N | 8 | 102 |
| COORD | 6 + 4 × N | 10 | 198 |
| ANGLE | 6 + 2 × N | 8 | 102 |
| SIZE | 6 + N + (N%2) | 8 | 54 |
| TRANS | 6 + 4 × N | 10 | 198 |
| PARAM_A | 6 + 2 × N | 8 | 102 |
| PARAM_B | 6 + 2 × N | 8 | 102 |
| PARAM_C | 6 + 2 × N | 8 | 102 |
| FOOTER | 8 (fixed) | 8 | 8 |

### 9.3 Quick Calculation

```python
def calc_content_size(n):
    """Calculate total Content block size for N objects"""
    type_block = 4 * n
    layer_block = 6 + 2 * n
    coord_block = 6 + 4 * n
    angle_block = 6 + 2 * n
    size_block = 6 + n + (n % 2)  # Padded to even
    trans_block = 6 + 4 * n
    param_a = 6 + 2 * n
    param_b = 6 + 2 * n
    param_c = 6 + 2 * n
    footer = 8
    
    return (type_block + layer_block + coord_block + angle_block + 
            size_block + trans_block + param_a + param_b + param_c + footer)

# Example
# N=1:  calc_content_size(1) = 80 -> Total = 28 + 20 + 80 = 128
# N=48: calc_content_size(48) = 1160 -> Total = 28 + 12 + 1160 = 1200
```

### 9.4 Empirical Verification Samples

| Object Count | Title | Calculated Size | Actual Size | Status |
|:---:|:---|:---:|:---:|:---:|
| 1 | "New Strategy Board" (20) | 128 | 128 | OK |
| 2 | "New Strategy Board" (20) | 150 | 150 | OK |
| 3 | "New Strategy Board" (20) | 174 | 174 | OK |
| 4 | "New Strategy Board" (20) | 196 | 196 | OK |
| 5 | "Light Party" (12) | 206 | 212 | OK |
| 48 | "All 48 Jobs" (12) | 1200 | 1200 | OK |

---

## 10. Type ID Correction Log

### AOE Types (Verified)

| Name | Correct ID | Incorrect ID | Notes |
|:---|:---:|:---:|:---|
| Circle AOE | **0x09** | ~~0x0A~~ | Previously misidentified as 0x0A |
| Fan AOE | **0x0A** | ~~0x0B~~ | Previously misidentified as 0x0B |
| Donut AOE | 0x11 | - | Correct |
| Line AOE | 0x01 | - | Correct |

### Complete Job Type IDs (Verified)

```
# Tanks
Paladin=0x1B, Warrior=0x1D, DarkKnight=0x26, Gunbreaker=0x2B

# Healers
WhiteMage=0x20, Scholar=0x23, Astrologian=0x27, Sage=0x2E

# Melee DPS
Monk=0x1C, Dragoon=0x1E, Ninja=0x24, Samurai=0x28, Reaper=0x2D, Viper=0x65

# Physical Ranged DPS
Bard=0x1F, Machinist=0x25, Dancer=0x2C

# Magical Ranged DPS
BlackMage=0x21, Summoner=0x22, RedMage=0x29, Pictomancer=0x66, BlueMage=0x2A

# Generic Roles
Tank=0x2F, Tank1=0x30, Tank2=0x31
Healer=0x32, Healer1=0x33, Healer2=0x34
DPS=0x35, DPS1=0x36, DPS2=0x37, DPS3=0x38, DPS4=0x39
MeleeDPS=0x76, RangedDPS=0x77, PhysRanged=0x78, MagicRanged=0x79
PureHealer=0x7A, BarrierHealer=0x7B
```


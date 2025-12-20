# FF14 Strategy Board Codec

> **⚠️ ALPHA STATUS**: This project is under active development. Object type mappings are incomplete, and exported strategy codes may not render correctly in-game. Contributions and bug reports are welcome.

## Abstract

This repository provides a Python implementation of the encoding and decoding algorithms utilized by the Final Fantasy XIV (FFXIV) Strategy Board system. Through reverse engineering of the game client, the underlying serialization format, compression scheme, and obfuscation layers have been identified and replicated. Additionally, a web-based interface enables visual diagram creation with direct export to in-game strategy codes.

## Repository Structure

```
ff14-stratboard-decode/
├── ff14_strategy_pack/      # Python codec library
│   ├── ff14_strategy.py     # Core encode/decode functions
│   └── strategy_generator.py # Programmatic strategy generation
├── docs/
│   ├── OBJECT_TYPES.md      # Comprehensive Type ID mapping
│   └── ColourPalette.md     # Color palette reference
└── web/                     # XIVPlan fork with game export
    └── src/
        └── file/
            ├── gameStrategyCodec.ts    # TypeScript codec port
            └── gameTypeMapping.ts      # XIVPlan → Game type conversion
```

---

## Technical Specification

### Binary Serialization Format

The strategy code format follows a multi-layer encoding pipeline designed to obfuscate the underlying binary data.

#### Data Structure
| Component | Size | Description |
|-----------|------|-------------|
| Header | 28 bytes | Version, length, object count, title length |
| Title | Variable (4-byte aligned) | UTF-8 encoded string, padded to 4-byte boundary |
| Type Block | 6 bytes/object | Object type IDs (uint16) |
| Coordinate Block | 4 bytes/object | X, Y positions (int16 × 10) |
| Additional Blocks | Variable | Scale, rotation, color, parameters |
| Footer | 8 bytes | Termination sequence |

#### Encoding Pipeline
1. **Compression**: DEFLATE (Zlib Level 6), header `0x78 0x9c`.
2. **Checksumming**: CRC32 + uncompressed length prepended.
3. **Base64**: URL-safe variant (`+` → `-`, `/` → `_`).
4. **Obfuscation**: Index-based character shifting with random seed.
5. **Substitution**: Static monoalphabetic cipher.
6. **Formatting**: `[stgy:a...]` wrapper with version/seed prefix.

---

## Python Library

### Dependencies
Standard library only: `zlib`, `base64`, `struct`.

### Example: Strategy Generation
```python
from ff14_strategy_pack.strategy_generator import generate_strategy

objects = [
    ("tank", 180, 120),
    ("healer", 330, 120),
    ("circle_aoe", 256, 192),
]
code = generate_strategy("Example Strategy", objects)
print(code)
```

### Example: Decoding
```python
from ff14_strategy_pack.ff14_strategy import decode_strategy
import struct

binary = decode_strategy("[stgy:a...]")
version = struct.unpack('<I', binary[0:4])[0]
print(f"Version: {version}")
```

---

## Web Interface

The `/web` directory contains a modified fork of [XIVPlan](https://github.com/joelspadin/xivplan) with in-game strategy code export capabilities.

### System Configuration
| Parameter | Value | Description |
|-----------|-------|-------------|
| Canvas Size | 512 × 384 px | Matches in-game strategy board |
| Coordinate Origin | Top-left (0, 0) | +X right, +Y down |
| Coordinate Scale | ×10 | Game stores 100.0 as 1000 |

### Supported Object Types
| Category | Types |
|----------|-------|
| Party Members | All jobs, generic roles (Tank, Healer, DPS, Melee, Ranged) |
| Enemies | Small, Medium, Large, Huge, Circle |
| Zones | Circle, Line, Cone, Donut, Arc, Stack, Tower, Eye, Starburst |
| Markers | Waymarks A–D, 1–4, Arrow |
| Mechanics | Knockback, Proximity |

### Unsupported (Removed from UI)
- Tethers (all types)
- Polygon zones
- Exaflare zones

### Running Locally
```bash
cd web
npm install
npm run dev
```

---

## Development Status

### Phase 1: Core Codec [Complete]
- Binary format reverse engineering
- Substitution cipher derivation
- Zlib compression pipeline
- Encode/decode cycle verification

### Phase 2: Type Quantification [Complete]
- Metadata block structure identification
- Type ID mapping (see `docs/OBJECT_TYPES.md`)
- Color palette mapping (see `docs/ColourPalette.md`)

### Phase 3: Strategy Generation [Complete]
- Programmatic code generation
- Custom color support (RGB / palette)
- 4-byte title alignment fix

### Phase 4: Web Integration [Alpha]
- Modified XIVPlan fork
- 512×384 canvas with top-left origin
- "Export to Game" functionality
- Debug mode for conversion inspection

### Known Limitations (Alpha)
- [x] Size/radius mapping for zones (formula: `radius_px = size × 2.47`)
- [x] Cone hitbox coordinate offset (bounding box center calculation)
- [x] Cone arc expansion (now clockwise from rotation, matching game)
- [ ] Narrow cone arcs (<90°) may have ~7px coordinate offset
- [ ] Text objects not fully tested

---

## Credits

- **Original XIVPlan**: [Joel Spadin](https://github.com/joelspadin/xivplan)
- **Undo/Redo Logic**: [frontendphil/react-undo-redo](https://github.com/frontendphil/react-undo-redo)
- **Arena Images**: [kotarou3/ffxiv-arena-images](https://github.com/kotarou3/ffxiv-arena-images)
- **Limit Cut Icons**: [yullanellis](https://magentalava.gumroad.com/l/limitcuticons)

Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.

## License

This software is provided for educational and research purposes. Users are responsible for ensuring compliance with the terms of service of the target application.

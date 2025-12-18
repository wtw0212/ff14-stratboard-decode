# FF14 Strategy Board Codec

## Abstract

This repository provides a Python implementation of the encoding and decoding algorithms utilized by the Final Fantasy XIV (FFXIV) Strategy Board system. Through reverse engineering of the game client, the underlying serialization format, compression scheme, and obfuscation layers have been identified and replicated. This library enables the programmatic generation, parsing, and modification of strategy codes, facilitating external tool development and tactical planning analysis.

## Technical Specification

The strategy code format follows a multi-layer encoding pipeline designed to obfuscate the underlying binary data. The processing stages are as follows:

### 1. Serialization Format
The core data is typically a binary structure containing:
- **Header**: Version identifiers and total data length.
- **Object Metadata Blocks**: A sequence of 6-byte blocks defining object types and properties.
  - Bytes 0-1: Type ID (e.g., 0x0035 for Tank, 0x0004 for Healer, 0x0001/0x0005 for DPS).
  - Bytes 2-5: Additional configuration data.
- **Coordinate Blocks**: A sequence of 4-byte blocks defining spatial positions.
  - Bytes 0-1: X-coordinate (int16).
  - Bytes 2-3: Y-coordinate (int16).
  - Coordinate values are scaled by a factor of 10 (e.g., a coordinate of 100.0 is stored as 1000).
- **Footer**: Additional control bytes and termination sequences.

### 2. Encoding Pipeline
To transform the binary data into a shareable string, the system employs the following steps:
1.  **Compression**: The binary payload is compressed using the DEFLATE algorithm (Zlib) with a compression level of 6. This aligns with the specific Zlib header (`0x78 0x9c`) expected by the game client.
2.  **Checksumming**: A custom structure consisting of a CRC32 checksum and the uncompressed length is prepended to the compressed payload.
3.  **Base64 Encoding**: The data is encoded using a standard Base64 alphabet, which is subsequently modified to a URL-safe variant (replacing `+` with `-` and `/` with `_`).
4.  **Obfuscation**: A stream cipher-like transformation is applied where each character's value is shifted based on its index and a randomized seed.
5.  **Substitution**: A monoalphabetic substitution cipher is applied using a static lookup table extracted from the game memory.
6.  **Formatting**: The final string is prefixed with a version identifier and the seed character, wrapped in specific delimiters (e.g., `[stgy:a...]`).

## Library Usage

The provided `ff14_strategy_pack` module exposes functions for the full encode/decode cycle, coordinate manipulation, and **strategy generation**.

### Dependencies
The library utilizes only standard Python libraries (`zlib`, `base64`, `struct`) and requires no external dependencies.

### Example: Generating a Strategy
```python
import sys
import os
sys.path.append(os.path.abspath('ff14_strategy_pack'))
from ff14_strategy_pack.strategy_generator import generate_strategy

# Generate a Light Party with Circle AOE
objects = [
    ("tank", 180, 120),
    ("healer", 330, 120),
    ("ninja", 180, 260),
    ("bard", 330, 260),
    ("circle_aoe", 256, 192),
]
code = generate_strategy("Light Party", objects)
print(code)
```

### Example: Decoding a Strategy
```python
from ff14_strategy_pack.ff14_strategy import decode_strategy

# Step 1: Decode the strategy string to binary
strategy_code = "[stgy:a...]"
binary_data = decode_strategy(strategy_code)

# Step 2: Analyze binary content (e.g., read header)
import struct
version = struct.unpack('<I', binary_data[0:4])[0]
print(f"Strategy Version: {version}")
```

### Example: Modifying Coordinates
```python
from ff14_strategy_pack.ff14_strategy import modify_coordinates

# Move the first object (index 0) to coordinates (100.0, 100.0)
original_code = "[stgy:a...]"
new_code = modify_coordinates(original_code, 0, 100.0, 100.0)

print(f"New Code: {new_code}")
```

## Structure Analysis Notes

Analysis of multi-object strategies reveals that the binary structure interleaves metadata and coordinate blocks. For a strategy with $N$ objects:
- The coordinate block typically begins after the metadata block.
- The offset for the coordinate block shifts dynamically based on the number of objects, generally increasing by 10 bytes (6 bytes metadata + 4 bytes coordinates) per additional object.
- Object types can be modified by altering the first 2 bytes of the corresponding metadata block.
- **Title Alignment**: Header(28) + TitleLen must be a multiple of 4 bytes.

## Development Roadmap

This project represents the foundational layer of a broader initiative to enable external creation and importation of tactical diagrams. The current development status and future objectives are outlined below.

### Phase 1: Core Codec Implementation [Completed]
- [x] Reverse engineering of the binary serialization format.
- [x] Derivation of the substitution cipher and obfuscation algorithms.
- [x] Implementation of the Zlib compression pipeline (Level 6).
- [x] Verification of the encode/decode cycle using live game data.

### Phase 2: Object Type Quantification [Completed]
- [x] Identification of the metadata block structure (Type ID locations).
- [x] Comprehensive mapping of all available Type IDs (see `docs/OBJECT_TYPES.md`).
- [x] Analysis of auxiliary data fields within the metadata block.
- [x] Color palette mapping (see `docs/ColourPalette.md`).

### Phase 3: Strategy Generation [Completed]
- [x] Implementation of `ff14_strategy_pack/strategy_generator.py` for programmatic code generation.
- [x] Support for custom colors (RGB tuple or palette lookup).
- [x] Verified generation of 50+ object strategies.
- [x] 4-byte title alignment fix for reliable code generation.

### Phase 4: Web Integration [Pending]
The ultimate objective is to facilitate the generation of strategy codes directly from a web-based drawing interface.
- [ ] Development of a frontend interface for tactical diagramming.
- [ ] Implementation of a coordinate mapping system to translate web canvas coordinates to the game's internal coordinate space ($x \times 10$).
- [ ] Integration of the Python codec (via backend service or Wasm port) to serialize web data into valid strategy strings for game importation.

## License

This software is provided for educational and research purposes. Users are responsible for ensuring compliance with the terms of service of the target application.

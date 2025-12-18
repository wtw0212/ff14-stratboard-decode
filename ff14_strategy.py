"""
FF14 Strategy Code Library
==========================

A Python library for encoding and decoding FF14 Strategy Board codes.

Features:
- Decode strategy codes to binary data
- Encode binary data to strategy codes
- Modify coordinates in existing strategies

Key Discovery:
- Prefix is "stgy:a" (6 chars) - 'a' is version identifier
- Coordinates stored as int16 * 10 (e.g., x=150 stored as 1500)

Usage:
    from ff14_strategy import decode_strategy, encode_strategy

    # Decode
    binary_data = decode_strategy("[stgy:aXXXX...]")

    # Encode
    code = encode_strategy(binary_data)

Author: Reverse-engineered from FF14 game client
"""

import base64
import struct
import zlib
from typing import Tuple, List, Dict, Optional

# Substitution table from game (address 0x1420cf4a0, 256 bytes)
_SUBSTITUTION_TABLE = bytes([
    # ENC table (bytes 0-127) - for encoding
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x62,0x00,0x00,
    0x32,0x77,0x37,0x71,0x53,0x74,0x45,0x56,0x34,0x50,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x66,0x52,0x65,0x41,0x46,0x42,0x75,0x64,0x6b,0x36,0x33,0x4b,0x4c,0x2b,0x59,
    0x2d,0x7a,0x54,0x35,0x44,0x6e,0x48,0x68,0x51,0x55,0x39,0x00,0x00,0x00,0x00,0x57,
    0x00,0x47,0x5a,0x49,0x6a,0x4e,0x72,0x31,0x6d,0x61,0x4f,0x70,0x6f,0x4d,0x58,0x69,
    0x4a,0x6c,0x67,0x38,0x43,0x78,0x63,0x76,0x30,0x73,0x79,0x00,0x00,0x00,0x00,0x00,
    # DEC table (bytes 128-255) - for decoding
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x4e,0x00,0x50,0x00,0x00,
    0x78,0x67,0x30,0x4b,0x38,0x53,0x4a,0x32,0x73,0x5a,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x44,0x46,0x74,0x54,0x36,0x45,0x61,0x56,0x63,0x70,0x4c,0x4d,0x6d,0x65,0x6a,
    0x39,0x58,0x42,0x34,0x52,0x59,0x37,0x5f,0x6e,0x4f,0x62,0x00,0x00,0x00,0x00,0x00,
    0x00,0x69,0x2d,0x76,0x48,0x43,0x41,0x72,0x57,0x6f,0x64,0x49,0x71,0x68,0x55,0x6c,
    0x6b,0x33,0x66,0x79,0x35,0x47,0x77,0x31,0x75,0x7a,0x51,0x00,0x00,0x00,0x00,0x00,
])


def _char_to_value(c: str) -> int:
    """Convert Base64 character to 6-bit value."""
    o = ord(c)
    if 65 <= o <= 90:    return o - 65      # A-Z -> 0-25
    if 97 <= o <= 122:   return o - 71      # a-z -> 26-51
    if 48 <= o <= 57:    return o + 4       # 0-9 -> 52-61
    if c == '-':         return 62
    if c == '_':         return 63
    return 0


def _value_to_char(v: int) -> str:
    """Convert 6-bit value to Base64 character."""
    v &= 0x3f
    if v < 26:   return chr(65 + v)         # 0-25 -> A-Z
    if v < 52:   return chr(97 + v - 26)    # 26-51 -> a-z
    if v < 62:   return chr(48 + v - 52)    # 52-61 -> 0-9
    return '-' if v == 62 else '_'


def _substitute_encode(c: str) -> str:
    """Apply ENC substitution table."""
    idx = ord(c)
    if idx < 128 and _SUBSTITUTION_TABLE[idx] != 0:
        return chr(_SUBSTITUTION_TABLE[idx])
    return c


def _substitute_decode(c: str) -> str:
    """Apply DEC substitution table."""
    idx = ord(c)
    if idx < 128 and _SUBSTITUTION_TABLE[128 + idx] != 0:
        return chr(_SUBSTITUTION_TABLE[128 + idx])
    return c


def decode_strategy(stgy_code: str) -> bytes:
    """
    Decode FF14 strategy code to binary data.

    Args:
        stgy_code: Strategy code in format "[stgy:aXXXX...]"

    Returns:
        Decoded binary data

    Raises:
        ValueError: If CRC check fails or format is invalid
    """
    # Remove wrapper - prefix is "stgy:a" (6 chars)
    code = stgy_code.replace('[stgy:a', '').rstrip(']')

    # Step 1: Apply DEC substitution
    substituted = ''.join(_substitute_decode(c) for c in code)

    # Step 2: Extract seed from first char
    seed = _char_to_value(substituted[0])

    # Step 3: Deobfuscate remaining chars
    deobfuscated = []
    for i, char in enumerate(substituted[1:]):
        val = _char_to_value(char)
        new_val = (val - i - seed) & 0x3f
        deobfuscated.append(_value_to_char(new_val))
    deob_str = ''.join(deobfuscated)

    # Step 4: Base64 decode (URL-safe to standard)
    b64 = deob_str.replace('-', '+').replace('_', '/')
    while len(b64) % 4:
        b64 += '='
    raw = base64.b64decode(b64)

    # Step 5: Parse and verify
    crc_stored = struct.unpack('<I', raw[0:4])[0]
    crc_calc = zlib.crc32(raw[4:]) & 0xffffffff

    if crc_stored != crc_calc:
        raise ValueError(f"CRC mismatch: stored=0x{crc_stored:08x}, calc=0x{crc_calc:08x}")

    # Step 6: Decompress
    return zlib.decompress(raw[6:])


def encode_strategy(binary_data: bytes, seed: int = 10) -> str:
    """
    Encode binary data to FF14 strategy code.

    Args:
        binary_data: Binary data to encode
        seed: Obfuscation seed (0-63), default 10

    Returns:
        Strategy code in format "[stgy:aXXXX...]"
    """
    # Step 1: Compress (Level 6 matches game's 78 9c header)
    compressed = zlib.compress(binary_data, 6)

    # Step 2: Build raw: [CRC32][length][compressed]
    length = len(binary_data)
    payload = struct.pack('<H', length) + compressed
    crc = zlib.crc32(payload) & 0xffffffff
    raw = struct.pack('<I', crc) + payload

    # Step 3: Base64 encode (standard to URL-safe)
    b64 = base64.b64encode(raw).decode().rstrip('=')
    b64 = b64.replace('+', '-').replace('/', '_')

    # Step 4: Obfuscate: (val + index + seed) & 0x3f
    obfuscated = []
    for i, c in enumerate(b64):
        val = _char_to_value(c)
        new_val = (val + i + seed) & 0x3f
        obfuscated.append(_value_to_char(new_val))
    obf_str = ''.join(obfuscated)

    # Step 5: Apply ENC substitution
    substituted = ''.join(_substitute_encode(c) for c in obf_str)

    # Step 6: Add seed char (with ENC substitution)
    seed_char = _value_to_char(seed)
    seed_sub = _substitute_encode(seed_char)

    return f"[stgy:a{seed_sub}{substituted}]"


def modify_coordinates(stgy_code: str, coord_index: int, x: float, y: float) -> str:
    """
    Modify coordinates in a strategy code.

    Args:
        stgy_code: Original strategy code
        coord_index: Which coordinate pair to modify (0-based)
        x: New X coordinate
        y: New Y coordinate

    Returns:
        New strategy code with modified coordinates

    Note:
        Coordinate offset is approximately 56 + (coord_index * 4) bytes
        Coordinates are stored as int16 * 10
    """
    data = bytearray(decode_strategy(stgy_code))

    # Coordinate offset (this may vary based on strategy structure)
    offset = 56 + (coord_index * 4)

    if offset + 4 > len(data):
        raise ValueError(f"Coordinate index {coord_index} out of range")

    # Store as int16 * 10
    data[offset:offset+2] = struct.pack('<h', int(x * 10))
    data[offset+2:offset+4] = struct.pack('<h', int(y * 10))

    return encode_strategy(bytes(data))


# =============================================================================
# Demo
# =============================================================================
if __name__ == "__main__":
    print("FF14 Strategy Code Library")
    print("=" * 60)

    # Test decode
    test_code = "[stgy:aK+3JkUa050jutcbGEWaNN1A5ed+gXkFCEPct0Be0Ey2DYqbB]"
    print(f"\nTest decode:")
    print(f"  Input: {test_code[:40]}...")
    try:
        data = decode_strategy(test_code)
        print(f"  Output: {len(data)} bytes")
        print(f"  Hex: {data.hex()[:60]}...")
    except Exception as e:
        print(f"  Error: {e}")

    # Test encode
    print(f"\nTest round-trip:")
    try:
        re_encoded = encode_strategy(data)
        re_decoded = decode_strategy(re_encoded)
        match = data == re_decoded
        print(f"  Round-trip: {'SUCCESS' if match else 'FAILED'}")
    except Exception as e:
        print(f"  Error: {e}")

    print("\n" + "=" * 60)
    print("Library ready for use!")

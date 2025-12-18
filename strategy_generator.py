"""
Final Strategy Generator - Matches all user samples perfectly
"""
import struct
import sys
import os

sys.path.insert(0, os.path.join(os.getcwd(), 'ff14_strategy_pack'))
from ff14_strategy import encode_strategy

TYPES = {
    # Generic roles
    "tank": 0x2F, "healer": 0x32, "dps": 0x35,
    
    # Tanks
    "paladin": 0x1B, "warrior": 0x1D, "dark_knight": 0x26, "gunbreaker": 0x2B,
    
    # Healers
    "white_mage": 0x20, "scholar": 0x23, "astrologian": 0x27, "sage": 0x2E,
    
    # Melee DPS
    "monk": 0x1C, "dragoon": 0x1E, "ninja": 0x24, "samurai": 0x28, "reaper": 0x2D, "viper": 0x65,
    
    # Ranged Physical DPS
    "bard": 0x1F, "machinist": 0x25, "dancer": 0x2C,
    
    # Caster DPS
    "black_mage": 0x21, "summoner": 0x22, "red_mage": 0x29, "pictomancer": 0x66,
    
    # AOE types
    "circle_aoe": 0x09, "fan_aoe": 0x0A, "donut_aoe": 0x11, "line_aoe": 0x01,
    
    # Markers
    "text": 0x64, "marker": 0x0B,


}


# Valid 8x7 Color Grid (X, Y) -> (R, G, B)
PALETTE_GRID = {
    # Row 0 (Light)
    (0,0): (255, 255, 255), (1,0): (255, 193, 203), (2,0): (255, 224, 208), (3,0): (255, 248, 181), (4,0): (232, 253, 224), (5,0): (229, 253, 251), (6,0): (156, 203, 235), (7,0): (255, 221, 255), 
    # Row 1
    (0,1): (247, 247, 249), (1,1): (255,  18,  45), (2,1): (255, 136,  26), (3,1): (254, 255,   5), (4,1): (  0, 238,   0), (5,1): (  0, 237, 213), (6,1): (  1,   0, 253), (7,1): (255,  17, 255), 
    # Row 2
    (0,2): (222, 222, 225), (1,2): (255,  87, 107), (2,2): (255, 172, 121), (3,2): (255, 255, 180), (4,2): (126, 247,   0), (5,2): (186, 250, 231), (6,2): (  0, 118, 233), (7,2): (224, 103, 167), 
    # Row 3
    (0,3): (214, 214, 217), (1,3): (255, 134, 150), (2,3): (255, 207, 183), (3,3): (240, 202, 118), (4,3): (127, 239,  77), (5,3): (102, 220, 235), (6,3): (148, 188, 250), (7,3): (255, 146, 216), 
    # Row 4
    (0,4): (204, 204, 207), (1,4): (255, 195, 205), (2,4): (255, 113,  29), (3,4): (240, 202, 118), (4,4): (212, 252, 122), (5,4): (171, 216, 223), (6,4): (127, 127, 254), (7,4): (255, 189, 234), 
    # Row 5
    (0,5): (189, 189, 191), (1,5): (214, 192, 198), (2,5): (214, 110, 128), (3,5): (204, 204, 105), (4,5): (171, 211,  67), (5,5): (176, 225, 223), (6,5): (178, 140, 255), (7,5): (222, 170, 198), 
    # Row 6 (Dark)
    (0,6): (166, 166, 168), (1,6): (196, 163, 169), (2,6): (214, 191, 178), (3,6): (199, 192, 162), (4,6): ( 56, 217, 151), (5,6): ( 59, 217, 202), (6,6): (222, 193, 250), (7,6): (222, 141, 247), 
}


def generate_strategy(title: str, objects: list) -> str:
    """
    Generate FF14 strategy code.
    objects: list of tuples. Supported formats:
      - (type, x, y): Default color
      - (type, x, y, color): Custom color
    
    'color' can be:
      - Tuple (r, g, b)
      - String "x,y" for palette lookup (e.g. "1,7")
    """
    num = len(objects)
    
    # Prepare data
    type_ids = []
    coords = []
    colors = []
    
    for obj in objects:
        # Unpack based on length
        if len(obj) == 3:
            t, x, y = obj
            c = None
        elif len(obj) == 4:
            t, x, y, c = obj
        else:
            raise ValueError(f"Invalid object format: {obj}")
            
        tid = TYPES.get(t.lower(), t) if isinstance(t, str) else t
        type_ids.append(tid)
        coords.append((int(x * 10), int(y * 10)))
        
        # Resolve color
        final_color = (255, 255, 255) # Default white
        if c:
            if isinstance(c, tuple) and len(c) >= 3:
                final_color = (c[0], c[1], c[2])
            elif isinstance(c, str):
                # Try to parse "x,y" for palette
                try:
                    px, py = map(int, c.split(','))
                    if (px, py) in PALETTE_GRID:
                        final_color = PALETTE_GRID[(px, py)]
                except:
                    pass
        colors.append(final_color)
    
    # Title - ensure (28 + title_len) is multiple of 4
    title_bytes = title.encode('utf-8') + b'\x00'
    # Pad to ensure 4-byte alignment of content start
    while (28 + len(title_bytes)) % 4 != 0:
        title_bytes += b'\x00'
    title_len = len(title_bytes)
    
    # Build content
    content = bytearray()
    
    # TYPE: 4 bytes each
    for tid in type_ids:
        content += struct.pack('<HH', 0x0002, tid)
    
    # LAYER: uint16 per object
    content += struct.pack('<HHH', 0x0004, 0x0001, num)
    for _ in range(num):
        content += struct.pack('<H', 0x0001)
    
    # COORD: int16 pairs
    content += struct.pack('<HHH', 0x0005, 0x0003, num)
    for x, y in coords:
        content += struct.pack('<hh', x, y)
    
    # ANGLE: int16 per object
    content += struct.pack('<HHH', 0x0006, 0x0001, num)
    for _ in range(num):
        content += struct.pack('<h', 0)
    
    # SIZE: uint8 per object + padding byte
    content += struct.pack('<HHH', 0x0007, 0x0000, num)
    for _ in range(num):
        content += bytes([0x64])
    # Always add padding byte (0xec for 1 obj, 0x00 otherwise based on samples)
    if num % 2 == 1:
        content += bytes([0x00])
    
    # TRANS: 4 bytes per object (RGBA)
    content += struct.pack('<HHH', 0x0008, 0x0002, num)
    for r, g, b in colors:
        content += struct.pack('BBBB', r, g, b, 0x00)
    
    # PARAM A, B, C: uint16 per object
    for bid in [0x000A, 0x000B, 0x000C]:
        content += struct.pack('<HHH', bid, 0x0001, num)
        for _ in range(num):
            content += struct.pack('<H', 0)
    
    # FOOTER: fixed 8 bytes
    content += struct.pack('<HHHH', 0x0003, 0x0001, 0x0001, 0x0001)
    
    # Header
    total_len = 28 + title_len + len(content)
    header = bytearray()
    header += struct.pack('<I', 2)
    header += struct.pack('<I', total_len - 16)
    header += bytes(10)
    header += struct.pack('<H', total_len - 28)
    header += bytes(4)
    header += struct.pack('<H', 1)
    header += struct.pack('<H', title_len)
    header += title_bytes
    
    binary = bytes(header) + bytes(content)
    return encode_strategy(binary)


if __name__ == "__main__":
    # Generate test codes matching user samples
    print("=== Generated Strategy Codes ===\n")
    
    # 1 Tank at top-left
    code1 = generate_strategy("Test 1 Tank", [("tank", 0, 0)])
    print("1 Tank (0,0):")
    print(code1)
    
    # 2 Tanks
    code2 = generate_strategy("Test 2 Tanks", [("tank", 0, 384), ("tank", 0, 0)])
    print("\n2 Tanks:")
    print(code2)
    
    # 3 Tanks
    code3 = generate_strategy("Test 3 Tanks", [("tank", 512, 0), ("tank", 0, 384), ("tank", 0, 0)])
    print("\n3 Tanks:")
    print(code3)
    
    # 4 Tanks at corners
    code4 = generate_strategy("Test 4 Tanks", [("tank", 512, 384), ("tank", 512, 0), ("tank", 0, 384), ("tank", 0, 0)])
    print("\n4 Tanks:")
    print(code4)
    
    # Save to file
    with open("generated_tanks.txt", "w") as f:
        f.write(f"1 Tank:\n{code1}\n\n")
        f.write(f"2 Tanks:\n{code2}\n\n")
        f.write(f"3 Tanks:\n{code3}\n\n")
        f.write(f"4 Tanks:\n{code4}\n")
    print("\nSaved to generated_tanks.txt")

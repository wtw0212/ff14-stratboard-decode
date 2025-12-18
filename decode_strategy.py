"""
FF14 Strategy Code Decoder

Decodes strategy codes and displays contents including title, object types, and coordinates.
Uses ff14_strategy_utils for coord detection and ff14_strategy for encoding/decoding.
"""
import struct
from ff14_strategy import decode_strategy
from ff14_strategy_utils import find_coord_block

TYPE_NAMES = {
    0x01: "Line AOE", 0x04: "Checkered Circle", 0x08: "Checkered Square",
    0x09: "General Marker", 0x0A: "Circle AOE", 0x0B: "Fan AOE", 0x0C: "Line",
    0x0D: "Gaze", 0x0E: "Stack", 0x0F: "Line Stack", 0x10: "Proximity",
    0x11: "Donut AOE", 0x12: "Gladiator", 0x1B: "Paladin", 0x1D: "Warrior",
    0x20: "White Mage", 0x23: "Scholar", 0x26: "Dark Knight", 0x27: "Astrologian",
    0x2B: "Gunbreaker", 0x2E: "Sage", 0x2F: "Tank", 0x32: "Healer", 0x35: "DPS",
    0x40: "Large Enemy", 0x3C: "Small Enemy", 0x3E: "Medium Enemy",
    0x41: "Attack 1", 0x42: "Attack 2", 0x43: "Attack 3", 0x44: "Attack 4",
    0x45: "Attack 5", 0x46: "Bind 1", 0x47: "Bind 2", 0x48: "Bind 3",
    0x4F: "Waymark A", 0x50: "Waymark B", 0x51: "Waymark C", 0x52: "Waymark D",
    0x53: "Waymark 1", 0x54: "Waymark 2", 0x55: "Waymark 3", 0x56: "Waymark 4",
    0x57: "Circle Sign", 0x58: "X Sign", 0x59: "Triangle Sign", 0x5A: "Square Sign",
    0x5E: "Up Arrow", 0x64: "Text", 0x67: "Rotate",
    0x6A: "Stack Multi", 0x6B: "Proximity Player", 0x6C: "Tankbuster",
    0x6D: "Radial KB", 0x6E: "Linear KB", 0x6F: "Tower", 0x70: "Target",
    0x71: "Enhancement", 0x72: "Enfeeblement", 0x73: "Attack 6", 0x74: "Attack 7",
    0x75: "Attack 8", 0x7C: "Grey Circle", 0x7D: "Grey Square",
    0x7E: "Moving AOE", 0x7F: "1P AOE", 0x80: "2P AOE", 0x81: "3P AOE", 0x82: "4P AOE",
    0x83: "Red Lock", 0x84: "Blue Lock", 0x85: "Purple Lock", 0x86: "Green Lock",
    0x87: "HL Circle", 0x88: "HL X", 0x89: "HL Square", 0x8A: "HL Triangle",
    0x8B: "Rotate CW", 0x8C: "Rotate CCW",
}


def get_type_name(type_id: int) -> str:
    return TYPE_NAMES.get(type_id, f"Type 0x{type_id:02x}")


def decode_full(code: str) -> dict:
    """Decode a strategy code and extract title, types, and coordinates."""
    data = decode_strategy(code)
    result = {"size": len(data), "title": "", "objects": []}
    
    # Title (offset 26 = length, 28 = start)
    title_len = struct.unpack('<H', data[26:28])[0]
    title_end = 28 + title_len
    result["title"] = data[28:title_end].rstrip(b'\x00').decode('utf-8', errors='ignore')
    
    # Object count via Size block: 07 00 00 00 [count]
    size_pos = data.find(bytes([0x07, 0x00, 0x00, 0x00]))
    if size_pos == -1:
        return result
    obj_count = struct.unpack('<H', data[size_pos+4:size_pos+6])[0]
    
    # Find coordinate block using utils
    coord_start = find_coord_block(data, obj_count)
    if coord_start == -1:
        return result
    
    # Extract type IDs from metadata (between title and coords)
    type_ids = []
    pos = title_end
    footer_pos = data.find(bytes([0x05, 0x00, 0x03, 0x00]))
    end_pos = footer_pos if footer_pos != -1 else coord_start
    
    while len(type_ids) < obj_count and pos < end_pos - 4:
        if data[pos] == 0x02 and data[pos+1] == 0x00 and data[pos+3] == 0x00:
            type_ids.append(data[pos+2])
            pos += 4
            # Skip Text content if present
            if type_ids[-1] == 0x64 and pos < end_pos - 4:
                if data[pos] == 0x03 and data[pos+1] == 0x00:
                    str_len = struct.unpack('<H', data[pos+2:pos+4])[0]
                    pos += 4 + str_len
        else:
            pos += 1
    
    # Build object list
    for i in range(obj_count):
        type_id = type_ids[i] if i < len(type_ids) else 0
        coff = coord_start + i * 4
        x = struct.unpack('<h', data[coff:coff+2])[0] / 10.0
        y = struct.unpack('<h', data[coff+2:coff+4])[0] / 10.0
        
        result["objects"].append({
            "index": i + 1,
            "type_id": type_id,
            "type_name": get_type_name(type_id),
            "x": x, "y": y
        })
    
    return result


def main():
    print("=" * 60)
    print("FF14 Strategy Code Decoder")
    print("=" * 60)
    print()
    code = input("Paste strategy code: ").strip()
    
    if not code.startswith("[stgy:"):
        print("Error: Invalid format")
        return
    
    result = decode_full(code)
    
    print()
    print(f"Binary Size: {result['size']} bytes")
    print(f"Title: {result['title']}")
    print(f"Object Count: {len(result['objects'])}")
    print()
    print("-" * 60)
    print(f"{'#':<4} {'Type':<25} {'X':>8} {'Y':>8}")
    print("-" * 60)
    
    for obj in result["objects"]:
        print(f"{obj['index']:<4} {obj['type_name']:<25} {obj['x']:>8.1f} {obj['y']:>8.1f}")
    
    print("-" * 60)


if __name__ == "__main__":
    main()

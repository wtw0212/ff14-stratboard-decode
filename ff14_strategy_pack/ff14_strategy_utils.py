"""
FF14 Strategy Code Utilities

Functions for modifying strategy code parameters including coordinates,
object size, angle, and transparency.

Dependencies: ff14_strategy.py (decode_strategy, encode_strategy)
"""
import struct
from .ff14_strategy import decode_strategy, encode_strategy


# ============================================================================
# Parameter Block Signatures
# ============================================================================

def _get_param_signatures(num_objs: int) -> dict:
    """Get binary signatures for parameter blocks based on object count."""
    count_bytes = struct.pack('<H', num_objs)
    return {
        'angle': bytes([0x06, 0x00, 0x01, 0x00]) + count_bytes,
        'size':  bytes([0x07, 0x00, 0x00, 0x00]) + count_bytes,
        'trans': bytes([0x08, 0x00, 0x02, 0x00]) + count_bytes,
    }


def _find_param_block(data: bytes, block_type: str, num_objs: int) -> int:
    """
    Locate a parameter block in the binary data.
    
    Returns the offset of the data section (after the 6-byte header),
    or -1 if not found.
    """
    sigs = _get_param_signatures(num_objs)
    if block_type not in sigs:
        return -1
    off = data.find(sigs[block_type])
    return off + 6 if off != -1 else -1


# ============================================================================
# Coordinate Modification
# ============================================================================

def find_coord_block(data: bytes, num_objs: int) -> int:
    """
    Locate the coordinate block in strategy binary data.
    
    Uses object-count-specific footer signature (05 00 03 00 NN 00)
    for high precision, with fallback to general signature search or
    value-based detection.
    """
    # Method 1: Precise match with object count
    target_sig = struct.pack('<HHH', 0x0005, 0x0003, num_objs)
    pos = data.find(target_sig)
    if pos != -1:
        coord_start = pos + 6
        # Quick validation
        if coord_start + 4 <= len(data):
            return coord_start

    # Method 2: General signature search (any 05 00 03 00)
    footer_sig = bytes([0x05, 0x00, 0x03, 0x00])
    curr = 0
    while True:
        pos = data.find(footer_sig, curr)
        if pos == -1:
            break
        # Check if the count at pos+4 is reasonable (close to or equal to num_objs)
        if pos + 6 <= len(data):
            count_in_binary = struct.unpack('<H', data[pos+4:pos+6])[0]
            if count_in_binary == num_objs or (num_objs > 0 and count_in_binary > 0):
                # We found a potential coord block. 
                # For Japanese sample, we want the one with count=19, not count=3.
                if count_in_binary == num_objs:
                    return pos + 6
        curr = pos + 1

    # Method 3: Value-based detection (fallback)
    for i in range(40, len(data) - num_objs * 4):
        x = struct.unpack('<h', data[i:i+2])[0]
        y = struct.unpack('<h', data[i+2:i+4])[0]
        # Real coords are usually not all near-zero and within board bounds
        if 500 <= x <= 5000 and 500 <= y <= 3800:
            return i

    return -1


def modify_coordinates(code: str, obj_index: int, new_x: float, new_y: float) -> str:
    """
    Modify the coordinates of a specific object.
    
    Args:
        code: Strategy code string
        obj_index: Zero-based object index
        new_x: New X coordinate (game units, e.g., 100.5)
        new_y: New Y coordinate (game units)
    
    Returns:
        Modified strategy code string
    """
    data = bytearray(decode_strategy(code))
    
    # Estimate object count from data size
    # Rough estimate: (size - 100) / 10
    num_objs = max(1, (len(data) - 100) // 10)
    
    coord_start = find_coord_block(data, num_objs)
    if coord_start == -1:
        raise ValueError("Could not locate coordinate block")
    
    offset = coord_start + obj_index * 4
    data[offset:offset+2] = struct.pack('<h', int(new_x * 10))
    data[offset+2:offset+4] = struct.pack('<h', int(new_y * 10))
    
    return encode_strategy(bytes(data))


# ============================================================================
# Size Modification
# ============================================================================

def modify_sizes(code: str, num_objs: int, sizes: list[int]) -> str:
    """
    Modify object sizes.
    
    Args:
        code: Strategy code string
        num_objs: Number of objects in the strategy
        sizes: List of size values (0-255), one per object
    
    Returns:
        Modified strategy code string
    
    Notes:
        Size block format: 1 byte per object.
        Default size is typically 100.
    """
    if len(sizes) != num_objs:
        raise ValueError(f"Expected {num_objs} sizes, got {len(sizes)}")
    
    data = bytearray(decode_strategy(code))
    offset = _find_param_block(data, 'size', num_objs)
    
    if offset == -1:
        raise ValueError("Size parameter block not found")
    
    for i, size in enumerate(sizes):
        data[offset + i] = size
    
    return encode_strategy(bytes(data))


# ============================================================================
# Angle Modification
# ============================================================================

def modify_angles(code: str, num_objs: int, angles: list[int]) -> str:
    """
    Modify object angles.
    
    Args:
        code: Strategy code string
        num_objs: Number of objects in the strategy
        angles: List of angle values (0-360 degrees), one per object
    
    Returns:
        Modified strategy code string
    
    Notes:
        Angle block format: int16 (2 bytes) per object.
    """
    if len(angles) != num_objs:
        raise ValueError(f"Expected {num_objs} angles, got {len(angles)}")
    
    data = bytearray(decode_strategy(code))
    offset = _find_param_block(data, 'angle', num_objs)
    
    if offset == -1:
        raise ValueError("Angle parameter block not found")
    
    for i, angle in enumerate(angles):
        data[offset + i*2 : offset + i*2 + 2] = struct.pack('<H', angle)
    
    return encode_strategy(bytes(data))


# ============================================================================
# Transparency Modification
# ============================================================================

def modify_transparency(code: str, num_objs: int, trans_values: list[int]) -> str:
    """
    Modify object transparency.
    
    Args:
        code: Strategy code string
        num_objs: Number of objects in the strategy
        trans_values: List of transparency values (0=opaque, higher=more transparent)
    
    Returns:
        Modified strategy code string
    
    Notes:
        Transparency block format: 4 bytes per object [R, G, B, Alpha].
        Only the Alpha byte (index 3) is modified. RGB remain 0xFF.
    """
    if len(trans_values) != num_objs:
        raise ValueError(f"Expected {num_objs} values, got {len(trans_values)}")
    
    data = bytearray(decode_strategy(code))
    offset = _find_param_block(data, 'trans', num_objs)
    
    if offset == -1:
        raise ValueError("Transparency parameter block not found")
    
    for i, trans in enumerate(trans_values):
        data[offset + i*4 + 3] = trans
    
    return encode_strategy(bytes(data))


# ============================================================================
# Combined Parameter Modification
# ============================================================================

def modify_all_params(
    code: str,
    num_objs: int,
    sizes: list[int] = None,
    angles: list[int] = None,
    trans_values: list[int] = None
) -> str:
    """
    Modify multiple parameter types in a single operation.
    
    Args:
        code: Strategy code string
        num_objs: Number of objects in the strategy
        sizes: Optional list of size values (0-255)
        angles: Optional list of angle values (0-360)
        trans_values: Optional list of transparency values
    
    Returns:
        Modified strategy code string
    """
    data = bytearray(decode_strategy(code))
    
    if sizes:
        if len(sizes) != num_objs:
            raise ValueError(f"Expected {num_objs} sizes")
        offset = _find_param_block(data, 'size', num_objs)
        if offset != -1:
            for i, v in enumerate(sizes):
                data[offset + i] = v
    
    if angles:
        if len(angles) != num_objs:
            raise ValueError(f"Expected {num_objs} angles")
        offset = _find_param_block(data, 'angle', num_objs)
        if offset != -1:
            for i, v in enumerate(angles):
                data[offset + i*2 : offset + i*2 + 2] = struct.pack('<H', v)
    
    if trans_values:
        if len(trans_values) != num_objs:
            raise ValueError(f"Expected {num_objs} transparency values")
        offset = _find_param_block(data, 'trans', num_objs)
        if offset != -1:
            for i, v in enumerate(trans_values):
                data[offset + i*4 + 3] = v
    
    return encode_strategy(bytes(data))


# ============================================================================
# Analysis Utilities
# ============================================================================

def analyze_strategy(code: str) -> dict:
    """
    Analyze a strategy code and extract basic information.
    
    Returns:
        Dictionary containing:
        - size: Raw binary size in bytes
        - title_offset: Offset of title string (typically 28)
        - title: Extracted title string if found
    """
    data = decode_strategy(code)
    result = {
        'size': len(data),
        'title_offset': 28,
        'title': None,
    }
    
    # Extract title (null-terminated UTF-8 string at offset 28)
    try:
        end = data.index(0, 28)
        result['title'] = data[28:end].decode('utf-8')
    except (ValueError, UnicodeDecodeError):
        pass
    
    return result


def dump_hex(code: str, start: int = 0, length: int = 256) -> str:
    """
    Generate a hex dump of the decoded strategy binary.
    
    Args:
        code: Strategy code string
        start: Starting offset
        length: Number of bytes to dump
    
    Returns:
        Formatted hex dump string
    """
    data = decode_strategy(code)
    end = min(start + length, len(data))
    lines = []
    
    for i in range(start, end, 16):
        hex_part = ' '.join(f'{b:02x}' for b in data[i:i+16])
        lines.append(f'{i:4d}: {hex_part}')
    
    return '\n'.join(lines)


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Example: Modify a 3-tank strategy
    sample = "[stgy:abj1sYMCIBpzt8a0+C2ZlTHNWHr9pIj-JN7FoA+dCxfY8slZSfYai+NOwGI-4TVfab6BGd5f2u0KXaJzxu2aRlkchdGOUXKXLJX9EuglvoAEvIJEg8wXllhfBMbsPsNkICncRiAnDU]"
    
    # Modify sizes to [150, 100, 125]
    result = modify_sizes(sample, 3, [150, 100, 125])
    print("Size Modified:")
    print(result)
    
    # Modify angles to [15, 50, 90]
    result = modify_angles(sample, 3, [15, 50, 90])
    print("\nAngle Modified:")
    print(result)
    
    # Modify all parameters
    result = modify_all_params(
        sample, 3,
        sizes=[150, 100, 125],
        angles=[15, 50, 90],
        trans_values=[0, 50, 75]
    )
    print("\nAll Parameters Modified:")
    print(result)

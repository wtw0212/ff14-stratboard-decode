"""
FF14 Strategy Board Codec
=========================
A comprehensive library for decoding, analyzing, modifying, and encoding 
Final Fantasy XIV Strategy Board codes.

Features:
- Decode/Encode strategy strings (Zlib + Custom Cipher).
- Object Management: Parse positions, types, and metadata.
- Extended Parameters: Handle Size, Angle, and Transparency.

Author: wtw0212
License: MIT
"""

import zlib
import base64
import struct

# --- Constants ---

# Substitution table derived from game memory
_SUBSTITUTION_TABLE = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2e, 0x00, 0x2d, 0x00, 0x00, 0x00,
    0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
    0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x00, 0x5f, 0x00, 0x00, 0x00,
    0x00, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f,
    0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]

def _char_to_value(c):
    return _SUBSTITUTION_TABLE[ord(c)]

def _value_to_char(v):
    for i in range(256):
        if _SUBSTITUTION_TABLE[i] == v:
            if 0x30 <= i <= 0x39 or 0x41 <= i <= 0x5A or 0x61 <= i <= 0x7A or i == 0x2d or i == 0x5f:
                return chr(i)
    return 'A' 

def _substitute_encode(base64_str, seed):
    standard_b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    output = []
    for i, char in enumerate(base64_str):
        if char == '-': char = '+'
        if char == '_': char = '/'
        val = standard_b64.index(char)
        enc_val = (val + seed + i) & 0x3F
        res_char = _value_to_char(enc_val)
        output.append(res_char)
    return "".join(output)

# --- Core Functions ---

def decode_strategy(strategy_string: str) -> bytes:
    """Decodes a strategy string into its raw binary form."""
    if not strategy_string.startswith("[stgy:"):
        raise ValueError("Invalid prefix")
    
    content = strategy_string[6:-1]
    if not content: return b""
    
    inner = strategy_string[1:-1]
    parts = inner.split(':')
    if len(parts) < 2: return b""
    
    payload = parts[1]
    seed_char = payload[0]
    seed = _char_to_value(seed_char)
    data_chars = payload[1:]
    
    decoded_indices = []
    for i, char in enumerate(data_chars):
        raw = _char_to_value(char)
        val = (raw - seed - (i + 1)) & 0x3F
        decoded_indices.append(val)
        
    b64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    b64_string = "".join(b64_chars[x] for x in decoded_indices)
    
    rem = len(b64_string) % 4
    if rem > 0:
        b64_string += "=" * (4 - rem)
        
    compressed_data = base64.urlsafe_b64decode(b64_string)
    
    try:
        decompressed = zlib.decompress(compressed_data)
    except:
        decompressed = zlib.decompress(compressed_data, -15)
        
    return decompressed

def encode_strategy(binary_data: bytes) -> str:
    """Encodes binary data into a strategy string."""
    compressed = zlib.compress(binary_data, level=6)
    b64_bytes = base64.urlsafe_b64encode(compressed)
    b64_str = b64_bytes.decode('ascii').replace('=', '')
    
    seed_char = 'a'
    seed = _char_to_value(seed_char)
    
    obfuscated = [seed_char]
    standard_b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    
    for i, char in enumerate(b64_str):
        if char == '-': idx = 62
        elif char == '_': idx = 63
        else: idx = standard_b64.index(char)
        
        enc_val = (idx + seed + (i + 1)) & 0x3F
        out_char = _value_to_char(enc_val)
        obfuscated.append(out_char)
        
    payload = "".join(obfuscated)
    return f"[stgy:{payload}]"

# --- Strategy Class ---

class StrategyObject:
    """Represents a single object in the strategy."""
    def __init__(self, idx, strategy):
        self.index = idx
        self.strategy = strategy
        self.x = 0.0
        self.y = 0.0
        self.type_id = 0
        self.subtype_id = 0
        self.data_id = 0
        self.size = 100
        self.angle = 0
        self.transparency = 0
        self.color = (255, 255, 255)

class Strategy:
    """High-level class for parsing and manipulating strategy codes."""
    def __init__(self, code: str):
        self.original_binary = bytearray(decode_strategy(code))
        self.objects = []
        self._parse()
        
    def _find_block(self, data, sig):
        return data.find(sig)

    def _parse(self):
        data = self.original_binary
        
        # Locate extended parameter blocks
        self.angle_offset = self._find_block(data, b'\x06\x00\x01\x00')
        self.size_offset = self._find_block(data, b'\x07\x00\x00\x00')
        self.trans_offset = self._find_block(data, b'\x08\x00\x02\x00')
        
        # Determine object count
        count = 0
        if self.size_offset != -1:
            count = struct.unpack('<H', data[self.size_offset+4:self.size_offset+6])[0]
        elif self.angle_offset != -1:
            count = struct.unpack('<H', data[self.angle_offset+4:self.angle_offset+6])[0]
        
        if count == 0:
            # Fallback estimation based on file size and structure
            est_n = (len(data) - 52 - 6) // 10
            count = max(1, est_n) 
            
        self.num_objects = count
        
        # Metadata typically starts after the header (offset 52)
        self.meta_start = 52
        self.coord_start = self.meta_start + (count * 6)
        
        # Populate objects
        for i in range(count):
            obj = StrategyObject(i, self)
            
            # Metadata parsing
            m_off = self.meta_start + i*6
            if m_off + 6 <= len(data):
                obj.type_id = struct.unpack('<H', data[m_off:m_off+2])[0]
                obj.subtype_id = struct.unpack('<H', data[m_off+2:m_off+4])[0]
                obj.data_id = struct.unpack('<H', data[m_off+4:m_off+6])[0]
            
            # Coordinate parsing
            c_off = self.coord_start + i*4
            if c_off + 4 <= len(data):
                vx = struct.unpack('<h', data[c_off:c_off+2])[0]
                vy = struct.unpack('<h', data[c_off+2:c_off+4])[0]
                obj.x = vx / 10.0
                obj.y = vy / 10.0
            
            # Extended parameters: Size (Type 7)
            if self.size_offset != -1:
                s_idx = self.size_offset + 6 + i
                if s_idx < len(data):
                    obj.size = data[s_idx]
            
            # Extended parameters: Angle (Type 6)
            if self.angle_offset != -1:
                a_idx = self.angle_offset + 6 + i*2
                if a_idx+2 <= len(data):
                    obj.angle = struct.unpack('<H', data[a_idx:a_idx+2])[0]
            
            # Extended parameters: Transparency/Color (Type 8)
            if self.trans_offset != -1:
                t_idx = self.trans_offset + 6 + i*4
                if t_idx+4 <= len(data):
                    obj.transparency = data[t_idx+3]
                    obj.color = (data[t_idx], data[t_idx+1], data[t_idx+2])
            
            self.objects.append(obj)

    def to_code(self):
        """Reconstructs and encodes the strategy."""
        data = self.original_binary
        
        for i, obj in enumerate(self.objects):
            # Update Coordinates
            c_off = self.coord_start + i*4
            if c_off + 4 <= len(data):
                vx = int(obj.x * 10)
                vy = int(obj.y * 10)
                data[c_off:c_off+2] = struct.pack('<h', vx)
                data[c_off+2:c_off+4] = struct.pack('<h', vy)
            
            # Update Metadata
            m_off = self.meta_start + i*6
            if m_off + 6 <= len(data):
                data[m_off:m_off+2] = struct.pack('<H', obj.type_id)
                data[m_off+2:m_off+4] = struct.pack('<H', obj.subtype_id)
                data[m_off+4:m_off+6] = struct.pack('<H', obj.data_id)
                
            # Update Extended Parameters
            if self.size_offset != -1:
                 data[self.size_offset + 6 + i] = int(obj.size)
                 
            if self.angle_offset != -1:
                 data[self.angle_offset + 6 + i*2 : self.angle_offset + 6 + i*2 + 2] = struct.pack('<H', int(obj.angle))
                 
            if self.trans_offset != -1:
                 t_idx = self.trans_offset + 6 + i*4
                 data[t_idx+3] = int(obj.transparency)
                 data[t_idx] = obj.color[0]
                 data[t_idx+1] = obj.color[1]
                 data[t_idx+2] = obj.color[2]
                 
        return encode_strategy(bytes(data))

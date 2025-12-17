# Object Type Mapping: Job & Role IDs

This document catalogs the verified **Job and Role IDs** used in the FFXIV Strategy Board system. These IDs are found in the `JOB-MAPPING` section of the strategy data (Format: `02 00 [ID] 00`).

## Disciple of War & Magic (Jobs)

| ID (Dec) | ID (Hex) | Job Name | Role |
| :--- | :--- | :--- | :--- |
| **27** | 0x1B | Paladin | Tank |
| **29** | 0x1D | Warrior | Tank |
| **38** | 0x26 | Dark Knight | Tank |
| **43** | 0x2B | Gunbreaker | Tank |
| **28** | 0x1C | Monk | Melee DPS |
| **30** | 0x1E | Dragoon | Melee DPS |
| **36** | 0x24 | Ninja | Melee DPS |
| **40** | 0x28 | Samurai | Melee DPS |
| **45** | 0x2D | Reaper | Melee DPS |
| **101** | 0x65 | Viper | Melee DPS |
| **31** | 0x1F | Bard | Physical Ranged DPS |
| **37** | 0x25 | Machinist | Physical Ranged DPS |
| **44** | 0x2C | Dancer | Physical Ranged DPS |
| **33** | 0x21 | Black Mage | Magical Ranged DPS |
| **34** | 0x22 | Summoner | Magical Ranged DPS |
| **41** | 0x29 | Red Mage | Magical Ranged DPS |
| **42** | 0x2A | Blue Mage | Limited Job |
| **102** | 0x66 | Pictomancer | Magical Ranged DPS |
| **32** | 0x20 | White Mage | Healer |
| **35** | 0x23 | Scholar | Healer |
| **39** | 0x27 | Astrologian | Healer |
| **46** | 0x2E | Sage | Healer |

## Classes (Base)
| ID (Dec) | ID (Hex) | Class Name |
| :--- | :--- | :--- |
| **18** | 0x12 | Gladiator |
| **20** | 0x14 | Marauder |
| **19** | 0x13 | Pugilist |
| **21** | 0x15 | Lancer |
| **26** | 0x1A | Rogue |
| **22** | 0x16 | Archer |
| **24** | 0x18 | Thaumaturge |
| **25** | 0x19 | Arcanist |
| **23** | 0x17 | Conjurer |

## Generic Roles & Markers

| ID (Dec) | ID (Hex) | Name | Type |
| :--- | :--- | :--- | :--- |
| **47** | 0x2F | Tank | Role Icon |
| **48** | 0x30 | Tank 1 | Role Icon |
| **49** | 0x31 | Tank 2 | Role Icon |
| **50** | 0x32 | Healer | Role Icon |
| **51** | 0x33 | Healer 1 | Role Icon |
| **52** | 0x34 | Healer 2 | Role Icon |
| **122** | 0x7A | Pure Healer | Role Icon |
| **123** | 0x7B | Barrier Healer | Role Icon |
| **53** | 0x35 | DPS | Role Icon |
| **54** | 0x36 | DPS 1 | Role Icon |
| **55** | 0x37 | DPS 2 | Role Icon |
| **56** | 0x38 | DPS 3 | Role Icon |
| **57** | 0x39 | DPS 4 | Role Icon |
| **118** | 0x76 | Melee DPS | Role Icon |
| **119** | 0x77 | Ranged DPS | Role Icon |
| **120** | 0x78 | Physical Ranged DPS | Role Icon |
| **121** | 0x79 | Magical Ranged DPS | Role Icon |


## Usage Note
These IDs correspond to the values found in the `JOB-MAPPING` or `ATTACK-TYPES-MAPPING` block. To change an icon, locate the target object entry in this block and replace its ID.

## Attack Markers & Mechanics

| ID (Dec) | ID (Hex) | Name | Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **130** | 0x82 | 4-Person AOE | Attack | |
| **129** | 0x81 | 3-Person AOE | Attack | |
| **128** | 0x80 | 2-Person AOE | Attack | |
| **127** | 0x7F | 1-Person AOE | Attack | |
| **126** | 0x7E | Moving Circle AOE | Attack | |
| **112** | 0x70 | Targeting Indicator | Marker | |
| **111** | 0x6F | Tower | Mechanic | |
| **110** | 0x6E | Linear Knockback | Mechanic | Has Param (Count) |
| **109** | 0x6D | Radial Knockback | Mechanic | |
| **108** | 0x6C | Tankbuster (Single) | Marker | |
| **107** | 0x6B | Proximity (Player) | Marker | |
| **106** | 0x6A | Stack (Multi-hit) | Marker | |
| **17** | 0x11 | Donut AOE | AOE | Params: Radius, Arc |
| **16** | 0x10 | Proximity | AOE | |
| **15** | 0x0F | Line Stack | Marker | |
| **14** | 0x0E | Stack | Marker | |
| **13** | 0x0D | Gaze | Mechanic | |
| **1** | 0x01 | Line AOE | AOE | Params: Height, Width |
| **11** | 0x0B | Fan AOE | AOE | Params: Arc |
| **10** | 0x0A | Circle AOE | AOE | |
| **9** | 0x09 | General Marker | Marker | |

## Extended Parameter Blocks

Objects with custom properties (Size, Angle, Transparency) store these in dedicated blocks **after** the coordinate data. These follow a Type-Length-Value (TLV) concept but use fixed headers.

### Type 6 Block: Angle
- **Header**: `06 00 01 00 [Count 2B]`
- **Format**: `int16` (2 bytes, Little Endian) per object.
- **Range**: 0-360 (degrees).
- **Data Start**: Header Offset + 6.

### Type 7 Block: Size
- **Header**: `07 00 00 00 [Count 2B]`
- **Format**: `byte` (1 byte) per object.
- **Range**: 0-255 (100 = default size).
- **Data Start**: Header Offset + 6.

### Type 8 Block: Color/Transparency
- **Header**: `08 00 02 00 [Count 2B]`
- **Format**: 4 bytes per object (`[R] [G] [B] [Alpha]`).
- **Data Start**: Header Offset + 6.
- **Values**:
  - **R, G, B**: Indexes 0-2. Typically `255 255 255` (White).
  - **Alpha (Transparency)**: Index 3. 
    - `0`: Default (Opaque, or not set?).
    - `1-100`: Transparency percentage.

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
These IDs correspond to the values found in the `JOB-MAPPING` block. To change an icon, locate the target object entry in this block and replace its ID.

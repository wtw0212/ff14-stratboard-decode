"""
FF14 Strategy Board Type ID Mapping
Derived from strategy code analysis.
"""

TYPE_IDS = {
    'ARCANIST': 25,
    'THAUMATURGE': 24,
    'ARCHER': 22,
    'ROGUE': 26,
    'LANCER': 21,
    'PUGILIST': 19,
    'CONJURER': 23,
    'MARAUDER': 20,
    'GLADIATOR': 18,
    'BLUE_MAGE': 42,
    'PICTOMANCER': 102,
    'RED_MAGE': 41,
    'SUMMONER': 34,
    'BLACK_MAGE': 33,
    'DANCER': 44,
    'MACHINIST': 37,
    'BARD': 31,
    'VIPER': 101,
    'REAPER': 45,
    'SAMURAI': 40,
    'NINJA': 36,
    'DRAGOON': 30,
    'MONK': 28,
    'SAGE': 46,
    'ASTROLOGIAN': 39,
    'SCHOLAR': 35,
    'WHITE_MAGE': 32,
    'GUNBREAKER': 43,
    'DARK_KNIGHT': 38,
    'WARRIOR': 29,
    'PALADIN': 27,
    'MAGICAL_RANGED_DPS': 121,
    'PHYSCIAL_RANGED_DPS': 120,
    'RANGED_DPS': 119,
    'MELEE_DPS': 118,
    'DPS_4': 57,
    'DPS_3': 56,
    'DPS_2': 55,
    'DPS_1': 54,
    'DPS': 53,
    'BARRIER_HEALER': 123,
    'PURE_HEALER': 122,
    'HEALER_2': 52,
    'HEALER_1': 51,
    'HEALER': 50,
    'TANK_2': 49,
    'TANK_1': 48,
    'TANK': 47,
}

def get_id(name: str) -> int:
    """Get Type ID by name (case-insensitive, spaces to underscores)."""
    key = name.upper().replace(' ', '_')
    return TYPE_IDS.get(key)

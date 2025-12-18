"""
Generate Light Party Strategy Board
- 1 Tank, 1 Healer, 2 DPS (random jobs)
- 1 Circle AOE in center
"""
import random
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ff14_strategy_pack.strategy_generator import generate_strategy

# Job pools
TANKS = ["paladin", "warrior", "dark_knight", "gunbreaker"]
HEALERS = ["white_mage", "scholar", "astrologian", "sage"]
DPS_MELEE = ["monk", "dragoon", "ninja", "samurai", "reaper"]
DPS_RANGED = ["bard", "machinist", "dancer"]
DPS_CASTER = ["black_mage", "summoner", "red_mage"]

# Random selection
tank = random.choice(TANKS)
healer = random.choice(HEALERS)
dps1 = random.choice(DPS_MELEE)
dps2 = random.choice(DPS_RANGED + DPS_CASTER)

print(f"=== Light Party Composition ===")
print(f"Tank:   {tank.replace('_', ' ').title()}")
print(f"Healer: {healer.replace('_', ' ').title()}")
print(f"DPS 1:  {dps1.replace('_', ' ').title()}")
print(f"DPS 2:  {dps2.replace('_', ' ').title()}")
print()

# Positions (spread around center, AOE in middle)
# Center of map is approximately (256, 192)
objects = [
    (tank, 180, 120),      # Tank - top left of center
    (healer, 330, 120),    # Healer - top right of center
    (dps1, 180, 260),      # DPS 1 - bottom left of center
    (dps2, 330, 260),      # DPS 2 - bottom right of center
    ("circle_aoe", 256, 192),  # Circle AOE - center
]

print(f"=== Positions ===")
for obj_type, x, y in objects:
    print(f"{obj_type.replace('_', ' ').title()}: ({x}, {y})")
print()

# Generate code
code = generate_strategy("Light Party", objects)

print("=== Generated Strategy Code ===")
print(code)

# Save to file
with open("light_party.txt", "w") as f:
    f.write(f"Light Party Composition:\n")
    f.write(f"- Tank: {tank.replace('_', ' ').title()}\n")
    f.write(f"- Healer: {healer.replace('_', ' ').title()}\n")
    f.write(f"- DPS 1: {dps1.replace('_', ' ').title()}\n")
    f.write(f"- DPS 2: {dps2.replace('_', ' ').title()}\n")
    f.write(f"- Circle AOE in center\n\n")
    f.write(f"Code:\n{code}\n")

print("\nSaved to light_party.txt")

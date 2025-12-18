"""
Generate Strategy Board with ALL 48 Job Icons (organized by category)
"""
import sys
import os

sys.path.insert(0, os.path.join(os.getcwd(), 'ff14_strategy_pack'))
from strategy_generator import generate_strategy

# Complete Type ID mapping from OBJECT_TYPES.md
ALL_JOBS = {
    # === TANKS (Row 1) ===
    "Paladin": 0x1B,
    "Warrior": 0x1D,
    "Dark Knight": 0x26,
    "Gunbreaker": 0x2B,
    
    # === HEALERS (Row 2) ===
    "White Mage": 0x20,
    "Scholar": 0x23,
    "Astrologian": 0x27,
    "Sage": 0x2E,
    
    # === MELEE DPS (Row 3) ===
    "Monk": 0x1C,
    "Dragoon": 0x1E,
    "Ninja": 0x24,
    "Samurai": 0x28,
    "Reaper": 0x2D,
    "Viper": 0x65,
    
    # === PHYSICAL RANGED DPS (Row 4) ===
    "Bard": 0x1F,
    "Machinist": 0x25,
    "Dancer": 0x2C,
    
    # === MAGICAL RANGED DPS (Row 5) ===
    "Black Mage": 0x21,
    "Summoner": 0x22,
    "Red Mage": 0x29,
    "Pictomancer": 0x66,
    "Blue Mage": 0x2A,
    
    # === BASE CLASSES (Row 6) ===
    "Gladiator": 0x12,
    "Pugilist": 0x13,
    "Marauder": 0x14,
    "Lancer": 0x15,
    "Archer": 0x16,
    "Conjurer": 0x17,
    "Thaumaturge": 0x18,
    "Arcanist": 0x19,
    "Rogue": 0x1A,
    
    # === GENERIC ROLES (Row 7-8) ===
    "Tank": 0x2F,
    "Tank 1": 0x30,
    "Tank 2": 0x31,
    "Healer": 0x32,
    "Healer 1": 0x33,
    "Healer 2": 0x34,
    "DPS": 0x35,
    "DPS 1": 0x36,
    "DPS 2": 0x37,
    "DPS 3": 0x38,
    "DPS 4": 0x39,
    "Melee DPS": 0x76,
    "Ranged DPS": 0x77,
    "Phys Ranged": 0x78,
    "Magic Ranged": 0x79,
    "Pure Healer": 0x7A,
    "Barrier Healer": 0x7B,
}

# Organize by rows (spread across the canvas)
ROWS = [
    # Row 1: Tanks (4)
    [("Paladin", 0x1B), ("Warrior", 0x1D), ("Dark Knight", 0x26), ("Gunbreaker", 0x2B)],
    
    # Row 2: Healers (4)
    [("White Mage", 0x20), ("Scholar", 0x23), ("Astrologian", 0x27), ("Sage", 0x2E)],
    
    # Row 3: Melee DPS (6)
    [("Monk", 0x1C), ("Dragoon", 0x1E), ("Ninja", 0x24), ("Samurai", 0x28), ("Reaper", 0x2D), ("Viper", 0x65)],
    
    # Row 4: Physical Ranged DPS (3)
    [("Bard", 0x1F), ("Machinist", 0x25), ("Dancer", 0x2C)],
    
    # Row 5: Magical Ranged DPS (5)
    [("Black Mage", 0x21), ("Summoner", 0x22), ("Red Mage", 0x29), ("Pictomancer", 0x66), ("Blue Mage", 0x2A)],
    
    # Row 6: Base Classes (9)
    [("Gladiator", 0x12), ("Pugilist", 0x13), ("Marauder", 0x14), ("Lancer", 0x15), ("Archer", 0x16),
     ("Conjurer", 0x17), ("Thaumaturge", 0x18), ("Arcanist", 0x19), ("Rogue", 0x1A)],
    
    # Row 7: Generic Roles Part 1 (11)
    [("Tank", 0x2F), ("Tank 1", 0x30), ("Tank 2", 0x31), 
     ("Healer", 0x32), ("Healer 1", 0x33), ("Healer 2", 0x34),
     ("DPS", 0x35), ("DPS 1", 0x36), ("DPS 2", 0x37), ("DPS 3", 0x38), ("DPS 4", 0x39)],
    
    # Row 8: Generic Roles Part 2 (6)
    [("Melee DPS", 0x76), ("Ranged DPS", 0x77), ("Phys Ranged", 0x78), 
     ("Magic Ranged", 0x79), ("Pure Healer", 0x7A), ("Barrier Healer", 0x7B)],
]

# Calculate positions
objects = []
canvas_width = 512
canvas_height = 384
margin_x = 30
margin_y = 20

# Calculate row spacing
num_rows = len(ROWS)
row_height = (canvas_height - 2 * margin_y) / num_rows

for row_idx, row in enumerate(ROWS):
    y = margin_y + row_idx * row_height + row_height / 2
    
    # Calculate spacing for this row
    num_items = len(row)
    item_spacing = (canvas_width - 2 * margin_x) / max(num_items - 1, 1)
    
    for item_idx, (name, type_id) in enumerate(row):
        if num_items == 1:
            x = canvas_width / 2
        else:
            x = margin_x + item_idx * item_spacing
        
        objects.append((type_id, x, y))

print(f"Total objects: {len(objects)}")
print(f"Objects per row: {[len(r) for r in ROWS]}")

# Generate strategy code
code = generate_strategy("All 48 Jobs", objects)

print("\n=== Generated Strategy Code ===")
print(code)

# Save
with open("all_48_jobs.txt", "w") as f:
    f.write(f"All 48 Job Icons Strategy Board\n")
    f.write(f"Total: {len(objects)} objects\n\n")
    for i, row in enumerate(ROWS):
        f.write(f"Row {i+1}: {', '.join(name for name, _ in row)}\n")
    f.write(f"\nCode:\n{code}\n")

print(f"\nSaved to all_48_jobs.txt")

"""Plot proposed hotspots on plates for visual verification."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(".")
OUT = Path("preview/vehicle-explore/shots/hotspot-verify")
OUT.mkdir(parents=True, exist_ok=True)

# Proposed maps: (label, src, {id: (x,y)})
PLATES = [
  ("fire-truck-outside", "preview/vehicle-explore/scene-art/fire-truck/closed-composite.png", {
    "cab": (32, 52), "door-f": (36, 58), "door-r": (45, 58),
    "pump": (55, 68), "comp-f": (60, 58), "comp-r": (75, 58),
    "hatch": (86, 52), "ladder": (58, 34),
    "w-f": (43, 73), "w-m": (72, 72), "w-r": (78, 72),
  }),
  ("fire-truck-inside", "public/images/truck-36822-art/fire-truck-pierce-open.png", {
    "cab": (34, 45), "door-f": (30, 52), "door-r": (42, 50),
    "pump": (55, 72), "comp-f": (55, 52), "comp-r": (68, 52),
    "hatch": (92, 55), "ladder": (55, 16),
    "w-f": (41, 80), "w-m": (72, 82), "w-r": (80, 82),
  }),
  ("ambulance-outside", "preview/vehicle-explore/scene-art/ambulance/closed-composite.png", {
    "cab": (39, 55), "door": (52, 62), "comp": (71, 53),
    "comp-door": (63, 62), "lights": (48, 42),
    "w-f": (44, 86), "w-r": (73, 83),
  }),
  ("ambulance-front", "Backup/ambulance_front_transparent.png", {
    "cab": (50, 35), "door": (88, 48), "lights": (50, 5),
    "comp": (89, 60), "w-f": (78, 85), "w-ff": (8, 95),
  }),
  ("ambulance-back", "Backup/ambulance_back_transparent.png", {
    "comp": (48, 40), "comp-door": (88, 40),
  }),
  ("police-outside", "preview/vehicle-explore/scene-art/police-car/closed-composite.png", {
    "cab": (47, 48), "door-f": (60, 62), "door-r": (74, 62),
    "lights": (55, 41), "bumper": (28, 70),
    "w-f": (49, 81), "w-r": (75, 79),
  }),
  ("police-front", "Backup/police_front_transparent.png", {
    "cab": (50, 28), "door-f": (88, 52), "lights": (55, 3),
    "bumper": (35, 72), "w-f": (78, 78),
  }),
  ("airport-outside", "preview/vehicle-explore/scene-art/airport-fire-truck/closed-composite.png", {
    "cab": (28, 48), "door": (38, 50), "comp": (55, 58),
    "roof": (22, 30), "bumper": (22, 57),
    "w-f": (44, 68), "w-m": (65, 68), "w-r": (74, 68),
  }),
  ("airport-inside", "Backup/airport_fire_truck_Panther_open.png", {
    "cab": (18, 45), "door": (30, 48), "comp": (50, 52),
    "roof": (12, 5), "w-f": (22, 80), "w-m": (65, 85), "w-r": (82, 85),
  }),
  ("excavator-outside", "preview/vehicle-explore/scene-art/excavator/closed-composite.png", {
    "cab": (60, 50), "door": (62, 55), "boom": (40, 30),
    "stick": (26, 52), "bucket": (24, 78), "track": (60, 76),
  }),
  ("excavator-more", "Backup/excavator_CAT320_cartoon_operator.png", {
    "cab": (50, 40), "door": (55, 48), "boom": (25, 18),
    "stick": (8, 35), "bucket": (8, 85), "track": (60, 90),
  }),
  ("dump-outside", "preview/vehicle-explore/scene-art/dump-truck/closed-composite.png", {
    "cab": (28, 41), "door": (36, 52), "body": (65, 45),
    "w-f": (43, 72), "w-m": (63, 72), "w-r": (70, 71),
  }),
  ("dump-inside", "Backup/dump-truck-open.png", {
    "cab": (40, 22), "door": (42, 38), "body": (75, 28),
    "w-f": (18, 88), "w-m": (78, 88), "w-r": (91, 88),
  }),
  ("crane-outside", "preview/vehicle-explore/scene-art/mobile-crane/closed-composite.png", {
    "d-cab": (26, 52), "d-door": (32, 58), "c-cab": (63, 45),
    "c-door": (66, 48), "boom": (35, 32), "hook": (16, 60),
    "w1": (31, 80), "w2": (46, 76), "w3": (58, 75), "w5": (73, 74),
  }),
  ("crane-inside", "Backup/mobile_crane_Liebherr_open.png", {
    "d-cab": (20, 45), "d-door": (28, 50), "c-cab": (80, 22),
    "c-door": (82, 30), "boom": (40, 18), "hook": (5, 55),
    "w1": (45, 80), "w2": (58, 80), "w3": (72, 80), "w5": (85, 80),
  }),
  ("tractor-outside", "preview/vehicle-explore/scene-art/tractor/closed-composite.png", {
    "cab": (65, 45), "door": (68, 52), "ladder": (67, 68),
    "hitch": (34, 70), "w-f": (39, 74), "w-r": (82, 69),
  }),
  ("tractor-trailer", "Backup/tractor_JohnDeere_with_trailer.png", {
    "cab": (43, 28), "door": (50, 40), "ladder": (51, 70),
    "hitch": (7, 75), "w-f": (38, 78), "w-r": (62, 74),
  }),
  ("rover-outside", "preview/vehicle-explore/scene-art/mars-rover/closed-composite.png", {
    "body": (55, 55), "mast": (53, 34), "arm": (32, 60),
    "turret": (22, 62), "rocker": (48, 70),
    "w-f": (35, 75), "w-m": (56, 79), "w-r": (77, 74),
  }),
  ("rover-inside", "Backup/mars-rover-open.png", {
    "body": (50, 52), "mast": (55, 8), "arm": (22, 50),
    "turret": (6, 50), "rocker": (55, 65),
    "w-f": (35, 72), "w-m": (50, 68), "w-r": (65, 58),
    "w-fm": (83, 80), "w-fr": (95, 70),
  }),
]

try:
  font = ImageFont.truetype("arial.ttf", 16)
except Exception:
  font = ImageFont.load_default()

for name, src, spots in PLATES:
  path = ROOT / src
  if not path.exists():
    print("MISSING", src)
    continue
  im = Image.open(path).convert("RGBA")
  w, h = im.size
  scale = min(1.0, 1200 / w)
  nw, nh = int(w * scale), int(h * scale)
  base = im.resize((nw, nh), Image.Resampling.LANCZOS)
  overlay = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
  d = ImageDraw.Draw(overlay)
  for label, (x, y) in spots.items():
    px, py = int(nw * x / 100), int(nh * y / 100)
    r = 10
    d.ellipse((px - r, py - r, px + r, py + r), outline=(0, 255, 80, 255), width=3)
    d.ellipse((px - 2, py - 2, px + 2, py + 2), fill=(255, 0, 0, 255))
    d.text((px + 12, py - 8), label, fill=(255, 255, 0, 255), font=font)
  out = Image.alpha_composite(base, overlay).convert("RGB")
  out_path = OUT / f"{name}-dots.png"
  out.save(out_path, quality=90)
  print(out_path.name)

print("done")

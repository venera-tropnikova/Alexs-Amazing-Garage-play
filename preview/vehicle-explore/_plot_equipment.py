"""Plot equipment hotspots from fleet.js views that have parts[]."""
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(".")
OUT = Path("preview/vehicle-explore/shots/equipment-verify")
OUT.mkdir(parents=True, exist_ok=True)
text = (ROOT / "preview/vehicle-explore/fleet.js").read_text(encoding="utf-8")

# Parse view blocks with parts + hotspots roughly via exec of extracted data — use regex pairs.
# Simpler: eval fleet via node dump.
import json
import subprocess

dump = r"""
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('preview/vehicle-explore/fleet.js','utf8');
const ctx = { window: {}, console };
vm.runInNewContext(code, ctx);
const out = [];
for (const v of ctx.window.VehicleExploreFleet) {
  for (const view of (v.scene && v.scene.views) || []) {
    if (!view.parts) continue;
    out.push({
      vehicle: v.id,
      view: view.id,
      label: view.label,
      src: view.src,
      parts: view.parts,
      hotspots: view.hotspots
    });
  }
}
console.log(JSON.stringify(out));
"""
raw = subprocess.check_output(["node", "-e", dump], cwd=str(ROOT), text=True)
plates = json.loads(raw)
try:
    font = ImageFont.truetype("arial.ttf", 15)
except Exception:
    font = ImageFont.load_default()

for plate in plates:
    path = ROOT / plate["src"]
    if not path.exists():
        print("MISSING", plate["src"])
        continue
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    scale = min(1.0, 1200 / w)
    nw, nh = int(w * scale), int(h * scale)
    base = im.resize((nw, nh), Image.Resampling.LANCZOS)
    overlay = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for part in plate["parts"]:
        spot = plate["hotspots"].get(part["id"])
        if not spot:
            continue
        x, y = spot["x"], spot["y"]
        px, py = int(nw * x / 100), int(nh * y / 100)
        d.ellipse((px - 11, py - 11, px + 11, py + 11), outline=(0, 220, 90, 255), width=3)
        d.ellipse((px - 2, py - 2, px + 2, py + 2), fill=(255, 40, 40, 255))
        d.text((px + 12, py - 8), part["name"], fill=(255, 255, 0, 255), font=font)
    out = Image.alpha_composite(base, overlay).convert("RGB")
    name = f"{plate['vehicle']}-{plate['view']}-eq.png"
    out.save(OUT / name, quality=90)
    print(name, len(plate["parts"]))

print("done", len(plates))

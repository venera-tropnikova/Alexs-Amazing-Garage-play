"""List asset paths referenced by vehicle-explore fleet/shell."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
files = [
    ROOT / "preview/vehicle-explore/fleet.js",
    ROOT / "preview/vehicle-explore/explore-shell.js",
    ROOT / "preview/vehicle-explore/explore-shell.css",
    ROOT / "preview/vehicle-explore/explore.html",
]
pat = re.compile(
    r"""["']((?:preview/vehicle-explore|public|content)/[^"']+)["']"""
)
found: set[str] = set()
for path in files:
    text = path.read_text(encoding="utf-8")
    found.update(m.replace("\\", "/") for m in pat.findall(text))

# closed composites for all 9 ids
for vid in (
    "fire-truck",
    "airport-fire-truck",
    "police-car",
    "excavator",
    "mobile-crane",
    "tractor",
    "dump-truck",
    "mars-rover",
    "ambulance",
):
    found.add(f"preview/vehicle-explore/scene-art/{vid}/closed-composite.png")

print("count", len(found))
missing = []
for rel in sorted(found):
    ok = (ROOT / rel).is_file()
    print(("OK" if ok else "MISS"), rel)
    if not ok:
        missing.append(rel)
print("missing", len(missing))

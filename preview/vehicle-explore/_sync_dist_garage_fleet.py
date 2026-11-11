"""Copy Explore fleet destinations from root garage.html into dist/garage.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
root_text = (ROOT / "garage.html").read_text(encoding="utf-8")
dist_path = ROOT / "dist" / "garage.html"
dist_text = dist_path.read_text(encoding="utf-8")

root_fleet = re.search(r"var fleet = \[(.*?)\];", root_text, re.S)
if not root_fleet:
    raise SystemExit("root fleet missing")

dist_new, n = re.subn(
    r"var fleet = \[(.*?)\];",
    root_fleet.group(0),
    dist_text,
    count=1,
    flags=re.S,
)
# From /dist/garage.html on the project server, Explore lives one level up.
dist_new = dist_new.replace(
    "preview/vehicle-explore/explore.html",
    "../preview/vehicle-explore/explore.html",
)
dist_path.write_text(dist_new, encoding="utf-8")
print(
    {
        "fleet_replaced": n,
        "panther_left": "panther.html" in dist_new,
        "liebherr_left": "liebherr.html" in dist_new,
        "airport": "../preview/vehicle-explore/explore.html?v=airport-fire-truck"
        in dist_new,
        "default_href": 'id="explore" href="../preview/vehicle-explore/explore.html?v=fire-truck"'
        in dist_new,
    }
)

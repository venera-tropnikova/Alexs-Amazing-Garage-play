"""Capture CLOSED full-composite Explore screenshots (preview only)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PREVIEW = Path(__file__).resolve().parent
SHOTS = PREVIEW / "shots"
CHECK = PREVIEW / "CHECK.json"

VEHICLES = [
    "fire-truck",
    "airport-fire-truck",
    "police-car",
    "excavator",
    "mobile-crane",
    "tractor",
    "dump-truck",
    "mars-rover",
    "ambulance",
]

VIEWPORTS = [
    (1280, 800),
    (1024, 768),
    (768, 1024),
]


def main() -> int:
    SHOTS.mkdir(parents=True, exist_ok=True)
    report = {
        "ok": True,
        "visualPassCount": 0,
        "note": "CLOSED composites wired; visualPass left false for user acceptance",
        "vehicles": {},
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        for vid in VEHICLES:
            entry = {
                "title": vid,
                "awaiting": False,
                "closedComposite": True,
                "visualPass": False,
                "issues": [],
                "viewports": {},
            }
            for w, h in VIEWPORTS:
                label = f"{w}x{h}"
                page = browser.new_page(viewport={"width": w, "height": h})
                page.goto(
                    f"http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v={vid}&diag=1",
                    wait_until="networkidle",
                    timeout=60000,
                )
                page.wait_for_selector(".scene-composite-img", timeout=20000)
                page.wait_for_function(
                    "() => { const i = document.querySelector('.scene-composite-img');"
                    " return i && i.complete && i.naturalWidth > 0; }"
                )
                # Settle layout
                page.wait_for_timeout(250)

                body_cls = page.evaluate("() => document.body.className")
                guide_bg = page.evaluate(
                    """() => {
                      const f = document.querySelector('.scene-frame');
                      if (!f) return null;
                      return getComputedStyle(f).getPropertyValue('--explore-bg').trim();
                    }"""
                )
                img_info = page.evaluate(
                    """() => {
                      const i = document.querySelector('.scene-composite-img');
                      const p = document.querySelector('.scene-composite-plate');
                      if (!i) return null;
                      return {
                        src: i.currentSrc || i.src,
                        natural: [i.naturalWidth, i.naturalHeight],
                        display: [i.clientWidth, i.clientHeight],
                        plate: p ? [p.clientWidth, p.clientHeight] : null
                      };
                    }"""
                )
                sections = page.locator(".section-button").count()
                hits = page.locator(".scene-hit").count()
                replay = page.locator(".part-card-replay").count()
                issues = []
                if "scene-full-composite" not in body_cls:
                    issues.append("missing body.scene-full-composite")
                if guide_bg:
                    issues.append(f"guide BG CSS var set: {guide_bg[:80]}")
                if not img_info:
                    issues.append("composite img missing")
                else:
                    nw, nh = img_info["natural"]
                    dw, dh = img_info["display"]
                    if nw != 1672 or nh != 941:
                        issues.append(f"unexpected natural size {nw}x{nh}")
                    if dw < 40 or dh < 40:
                        issues.append(f"display too small {dw}x{dh}")
                    # Aspect ratio preserved (±2%)
                    nat_ar = nw / nh
                    disp_ar = dw / dh if dh else 0
                    if abs(nat_ar - disp_ar) > 0.03:
                        issues.append(f"aspect drift nat={nat_ar:.3f} disp={disp_ar:.3f}")
                if sections < 1:
                    issues.append("no section buttons")
                if hits < 1:
                    issues.append("no hotspots")
                if replay < 1:
                    issues.append("Replay control missing from card markup")

                out = SHOTS / f"{vid}-closed-{label}.png"
                page.screenshot(path=str(out), full_page=False)
                page.close()

                entry["viewports"][label] = {
                    "sections": sections,
                    "hits": hits,
                    "shot": out.name,
                    "issues": issues,
                    "img": img_info,
                }
                if issues:
                    entry["issues"].extend([f"{label}: {i}" for i in issues])
                    report["ok"] = False

            report["vehicles"][vid] = entry

        browser.close()

    CHECK.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "shots": str(SHOTS), "check": str(CHECK)}, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

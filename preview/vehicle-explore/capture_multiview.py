"""Verify Explore UI shell: modes, pins, lesson panel, Parts — all 9 vehicles."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

PREVIEW = Path(__file__).resolve().parent
SHOTS = PREVIEW / "shots"
CHECK = PREVIEW / "CHECK.json"
BASE = "http://127.0.0.1:8877"

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
VIEWPORTS = [(1280, 800), (1024, 768), (768, 1024)]


def main() -> int:
    SHOTS.mkdir(parents=True, exist_ok=True)
    report = {
        "ok": True,
        "visualPassCount": 0,
        "note": "Kids-game Explore UI; visualPass false; auto check ≠ visual acceptance",
        "vehicles": {},
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(f"{BASE}/preview/vehicle-explore/index.html", wait_until="networkidle")
        page.wait_for_selector("#fleet a")
        page.screenshot(path=str(SHOTS / "menu-1280x800.png"))
        page.close()

        for vid in VEHICLES:
            entry = {"visualPass": False, "issues": [], "viewports": {}, "views": []}
            for w, h in VIEWPORTS:
                label = f"{w}x{h}"
                page = browser.new_page(viewport={"width": w, "height": h})
                page.goto(
                    f"{BASE}/preview/vehicle-explore/explore.html?v={vid}",
                    wait_until="networkidle",
                    timeout=60000,
                )
                page.wait_for_selector(".scene-composite-img", timeout=20000)
                page.wait_for_function(
                    "() => { const i=document.querySelector('.scene-composite-img');"
                    " return i && i.complete && i.naturalWidth>0; }"
                )
                page.wait_for_timeout(200)

                view_btns = page.locator(".mode-btn")
                view_count = view_btns.count()
                hits = page.locator(".scene-hit").count()
                pins = page.locator(".scene-pin").count()
                parts_toggle = page.locator(".parts-toggle").count()
                fake = page.locator(".scene-state-toggle").count()
                src = page.evaluate(
                    "() => document.querySelector('.scene-composite-img')?.currentSrc || ''"
                )
                scroll_x = page.evaluate(
                    "() => document.documentElement.scrollWidth - window.innerWidth"
                )
                issues = []
                if pins and pins != hits:
                    issues.append(f"pin/hit mismatch {pins}/{hits}")
                if "closed-composite.png" not in src and label == "1280x800":
                    issues.append("Outside not using closed-composite")
                if hits < 1:
                    issues.append("no Outside hotspots")
                if parts_toggle < 1:
                    issues.append("no Parts toggle")
                if fake:
                    issues.append("fake Open/Raise toggle present")
                if scroll_x > 2:
                    issues.append(f"horizontal overflow {scroll_x}px")

                page.screenshot(path=str(SHOTS / f"{vid}-outside-{label}.png"))

                labels = [
                    t.strip()
                    for t in page.locator(".mode-btn .mode-label").all_inner_texts()
                ]
                entry["views"] = labels
                if "altHits" not in entry:
                    entry["altHits"] = {}

                if label == "1280x800" and hits >= 1:
                    page.evaluate("() => document.querySelector('.scene-hit')?.click()")
                    page.wait_for_function(
                        "() => document.body.classList.contains('lesson-open')",
                        timeout=10000,
                    )
                    page.screenshot(path=str(SHOTS / f"{vid}-card-1280x800.png"))
                    # Parts open with lesson visible
                    page.locator(".parts-toggle").click()
                    page.wait_for_timeout(200)
                    page.screenshot(path=str(SHOTS / f"{vid}-parts-open-1280x800.png"))
                    page.evaluate("() => document.querySelector('.lesson-close')?.click()")
                    page.wait_for_function(
                        "() => !document.body.classList.contains('lesson-open')"
                    )

                for vi in range(1, view_count):
                    view_btns.nth(vi).click()
                    page.wait_for_timeout(450)
                    page.wait_for_function(
                        "() => { const i=document.querySelector('.scene-composite-img');"
                        " return i && i.complete && i.naturalWidth>0; }"
                    )
                    alt_src = page.evaluate(
                        "() => document.querySelector('.scene-composite-img')?.currentSrc || ''"
                    )
                    vlabel = labels[vi] if vi < len(labels) else f"view{vi}"
                    safe = vlabel.lower().replace(" ", "-")
                    if "closed-composite.png" in alt_src:
                        issues.append(f"{vlabel} still shows composite")
                    alt_hits = page.locator(".scene-hit").count()
                    if label == "1280x800":
                        entry["altHits"][vlabel] = alt_hits
                        if alt_hits < 1:
                            issues.append(f"no hotspots on {vlabel}")
                    page.screenshot(path=str(SHOTS / f"{vid}-{safe}-{label}.png"))
                    if label == "1280x800" and alt_hits >= 1:
                        page.evaluate("() => document.querySelector('.scene-hit')?.click()")
                        page.wait_for_function(
                            "() => document.body.classList.contains('lesson-open')",
                            timeout=10000,
                        )
                        page.screenshot(
                            path=str(SHOTS / f"{vid}-{safe}-card-1280x800.png")
                        )
                        if "inside" in safe:
                            page.screenshot(
                                path=str(SHOTS / f"{vid}-look-inside-active-1280x800.png")
                            )
                        page.evaluate(
                            "() => document.querySelector('.lesson-close')?.click()"
                        )
                        page.wait_for_function(
                            "() => !document.body.classList.contains('lesson-open')"
                        )
                if view_count > 1:
                    view_btns.nth(0).click()
                    page.wait_for_timeout(200)

                entry["viewports"][label] = {
                    "hits": hits,
                    "partsToggle": parts_toggle,
                    "views": view_count,
                    "issues": issues,
                }
                if issues:
                    entry["issues"].extend([f"{label}: {i}" for i in issues])
                    report["ok"] = False
                page.close()

            report["vehicles"][vid] = entry

        browser.close()

    CHECK.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "check": str(CHECK)}, indent=2))
    for vid, e in report["vehicles"].items():
        print(vid, "views=", e.get("views"), "issues=", e.get("issues"))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

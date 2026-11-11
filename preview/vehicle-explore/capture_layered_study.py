"""Capture layered-study Explore screenshots + verify hotspots/card (preview only)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
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
        "note": "Layered study restored; composites are references; OPEN not playable; visualPass false",
        "vehicles": {},
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        # Menu
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(f"{BASE}/preview/vehicle-explore/index.html", wait_until="networkidle")
        page.wait_for_selector("#fleet a img")
        page.screenshot(path=str(SHOTS / "menu-1280x800.png"))
        tech = page.locator("text=visualPass").count() + page.locator("text=scene ready").count()
        if tech:
            report["ok"] = False
            report["menuIssues"] = ["technical labels visible in kid menu"]
        page.close()

        for vid in VEHICLES:
            entry = {
                "visualPass": False,
                "openPlayable": False,
                "issues": [],
                "viewports": {},
            }
            for w, h in VIEWPORTS:
                label = f"{w}x{h}"
                page = browser.new_page(viewport={"width": w, "height": h})
                page.goto(
                    f"{BASE}/preview/vehicle-explore/explore.html?v={vid}",
                    wait_until="networkidle",
                    timeout=60000,
                )
                page.wait_for_selector(".scene-closed", timeout=20000)
                page.wait_for_function(
                    "() => { const i=document.querySelector('.scene-closed');"
                    " return i && i.complete && i.naturalWidth>0; }"
                )
                page.wait_for_timeout(200)

                hits = page.locator(".scene-hit").count()
                dock = page.locator(".part-dock-button").count()
                bg = page.evaluate(
                    """() => getComputedStyle(document.querySelector('.game-panel'))
                       .getPropertyValue('--explore-bg').trim()"""
                )
                open_toggle = page.locator(".scene-state-toggle").count()
                composite_as_plate = page.locator(".scene-composite-img").count()
                scroll = page.evaluate(
                    "() => ({x: document.documentElement.scrollWidth - window.innerWidth,"
                    " y: document.documentElement.scrollHeight - window.innerHeight})"
                )

                issues = []
                if hits < 1:
                    issues.append("no hotspots")
                if dock < 1:
                    issues.append("no part dock buttons")
                if not bg or "url(" not in bg:
                    issues.append("thematic BG missing on game-panel")
                if open_toggle:
                    issues.append("OPEN toggle present without layers")
                if composite_as_plate:
                    issues.append("composite used as play plate")
                if scroll["x"] > 2:
                    issues.append(f"horizontal overflow {scroll['x']}px")

                # Hotspot click → card; dock click as fallback
                if hits:
                    page.locator(".scene-hit").nth(min(2, hits - 1)).click(force=True)
                    page.wait_for_selector(".part-card:not([hidden])", timeout=5000)
                    title = page.locator(".part-card-title").inner_text().strip()
                    replay = page.locator(".part-card-replay:not([hidden])").count()
                    close_btn = page.locator(".part-card-close").count()
                    if not title:
                        issues.append("card title empty")
                    if not replay:
                        issues.append("Replay missing")
                    if not close_btn:
                        issues.append("Close missing")
                    if label == "1280x800":
                        page.screenshot(path=str(SHOTS / f"{vid}-card-{label}.png"))
                    page.locator(".part-card-close").click()
                elif dock:
                    page.locator(".part-dock-button").first.click()
                    page.wait_for_selector(".part-card:not([hidden])", timeout=5000)
                    page.locator(".part-card-close").click()

                page.screenshot(path=str(SHOTS / f"{vid}-layered-{label}.png"))
                # Keep legacy closed names updated for acceptance folder
                page.screenshot(path=str(SHOTS / f"{vid}-closed-{label}.png"))

                entry["viewports"][label] = {
                    "hits": hits,
                    "dock": dock,
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
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

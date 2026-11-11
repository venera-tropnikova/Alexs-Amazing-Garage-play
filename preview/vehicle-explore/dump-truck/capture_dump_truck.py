"""Capture Dump Truck CLOSED preview screenshots (no Raise Bed)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

SHOTS = Path(__file__).resolve().parents[1] / "shots"
BASE = "http://127.0.0.1:8877"
VIEWPORTS = [(1280, 800), (1024, 768), (768, 1024)]
URL = f"{BASE}/preview/vehicle-explore/explore.html?v=dump-truck"


def main() -> int:
    SHOTS.mkdir(parents=True, exist_ok=True)
    report = {"ok": True, "raiseBedPlayable": False, "viewports": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        for w, h in VIEWPORTS:
            label = f"{w}x{h}"
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(URL, wait_until="networkidle", timeout=60000)
            page.wait_for_selector(".scene-composite-img", timeout=20000)
            page.wait_for_function(
                "() => { const i=document.querySelector('.scene-composite-img');"
                " return i && i.complete && i.naturalWidth>0; }"
            )
            page.wait_for_timeout(200)

            info = page.evaluate(
                """() => ({
                  body: document.body.className,
                  closed: document.querySelector('.scene-composite-img')?.currentSrc || '',
                  bgVar: getComputedStyle(document.querySelector('.game-panel'))
                    .getPropertyValue('--explore-bg').trim(),
                  hits: document.querySelectorAll('.scene-hit').length,
                  dock: [...document.querySelectorAll('.part-dock-button')]
                    .map(b => b.textContent),
                  raiseToggle: document.querySelectorAll('.scene-state-toggle').length,
                  scrollX: document.documentElement.scrollWidth - window.innerWidth
                })"""
            )
            issues = []
            if "scene-full-composite" not in info["body"]:
                issues.append("missing scene-full-composite")
            if "closed-composite.png" not in info["closed"]:
                issues.append("etalon composite not used as CLOSED plate")
            if info["bgVar"]:
                issues.append("guide BG applied under composite")
            if info["hits"] != 7:
                issues.append(f"expected 7 hits, got {info['hits']}")
            if len(info["dock"]) != 7:
                issues.append(f"expected 7 dock buttons, got {len(info['dock'])}")
            if info["raiseToggle"]:
                issues.append("Raise/OPEN toggle present without layers")
            if info["scrollX"] > 2:
                issues.append(f"horizontal overflow {info['scrollX']}px")

            page.locator(".scene-hit").nth(2).click(force=True)
            page.wait_for_selector(".part-card:not([hidden])")
            title = page.locator(".part-card-title").inner_text().strip()
            if not title:
                issues.append("empty card title")
            if page.locator(".part-card-replay:not([hidden])").count() < 1:
                issues.append("Replay missing")
            page.screenshot(path=str(SHOTS / f"dump-truck-card-{label}.png"))
            page.locator(".part-card-close").click()

            page.screenshot(path=str(SHOTS / f"dump-truck-closed-{label}.png"))
            report["viewports"][label] = {"issues": issues, "titleSample": title, "info": info}
            if issues:
                report["ok"] = False
            page.close()
        browser.close()

    out = Path(__file__).resolve().parent / "CHECK_DUMP_TRUCK.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "check": str(out)}, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

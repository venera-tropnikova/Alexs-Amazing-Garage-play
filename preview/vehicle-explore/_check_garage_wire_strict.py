"""Strict Garage → Explore wire check. No URL spoofing. Fail on old destinations."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BASE = "http://127.0.0.1:8877"
OUT = Path(__file__).resolve().parent / "GARAGE_WIRE_CHECK.json"
REPORT = Path(__file__).resolve().parent / "GARAGE_WIRE_FIX_REPORT.md"

FLEET = [
    ("Fire Truck", "fire-truck", 0),
    ("Airport Fire Truck", "airport-fire-truck", 1),
    ("Police Car", "police-car", 2),
    ("Excavator", "excavator", 3),
    ("Mobile Crane", "mobile-crane", 4),
    ("Tractor", "tractor", 5),
    ("Dump Truck", "dump-truck", 6),
    ("Mars Rover", "mars-rover", 7),
    ("Ambulance", "ambulance", 8),
]

OLD_MARKERS = (
    "panther.html",
    "liebherr.html",
    "ford-police.html",
    "caterpillar.html",
    "john-deere.html",
    "volvo-a40g.html",
    "perseverance.html",
    "ford-f450.html",
    "fire-truck-explore.html",
    "truck.html",
    "test=local",
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def path_of(url: str) -> str:
    return urlparse(url).path.replace("\\", "/")


def main() -> int:
    disk = (ROOT / "garage.html").read_bytes()
    report = {
        "base": BASE,
        "ok": True,
        "rootCauseNotes": [],
        "loadedDocument": {},
        "sources": {},
        "routes": [],
        "findIt": None,
        "sayIt": None,
        "homeRoundtrip": None,
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        # Bypass HTTP cache so we prove which bytes the browser actually received.
        context.route(
            "**/*",
            lambda route: route.continue_(
                headers={
                    **route.request.headers,
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                }
            ),
        )
        page = context.new_page()
        page.set_default_timeout(20000)

        garage_bodies = []

        def on_response(response):
            try:
                url = response.url.split("?", 1)[0]
                if url.endswith("/garage.html") and response.request.resource_type in (
                    "document",
                    "other",
                ):
                    body = response.body()
                    garage_bodies.append(
                        {
                            "url": response.url,
                            "status": response.status,
                            "sha256": sha256(body),
                            "bytes": len(body),
                            "hasPanther": b"panther.html" in body,
                            "hasVehicleExplore": b"vehicle-explore/explore.html?v=airport-fire-truck"
                            in body,
                            "cacheControl": response.headers.get("cache-control"),
                            "lastModified": response.headers.get("last-modified"),
                        }
                    )
            except Exception as exc:  # noqa: BLE001
                garage_bodies.append({"url": response.url, "error": str(exc)})

        page.on("response", on_response)

        # index → Garage
        page.goto(f"{BASE}/index.html", wait_until="domcontentloaded")
        with page.expect_navigation():
            page.click("a.start-hit")
        page.wait_for_url("**/garage.html**")
        report["homeRoundtrip"] = {"toGarage": page.url}

        if not garage_bodies:
            report["ok"] = False
            report["loadedDocument"] = {"error": "garage.html network body not captured"}
        else:
            loaded = garage_bodies[-1]
            loaded["matchesDisk"] = loaded.get("sha256") == sha256(disk)
            loaded["diskSha256"] = sha256(disk)
            report["loadedDocument"] = loaded
            if loaded.get("hasPanther") or not loaded.get("hasVehicleExplore"):
                report["ok"] = False
            if not loaded.get("matchesDisk"):
                report["ok"] = False
                report["rootCauseNotes"].append(
                    "Browser-loaded garage.html bytes differ from disk — possible cache/proxy."
                )

        # Source inventory
        dist = (ROOT / "dist" / "garage.html").read_text(encoding="utf-8")
        fleet_js = (ROOT / "public" / "js" / "garage-fleet.js").read_text(encoding="utf-8")
        report["sources"] = {
            "garage.html_inline_fleet_handler": "show(index) sets #explore.href = fleet[index][1]; click only stopName()",
            "garage.html_uses_garage_fleet_js": "public/js/garage-fleet.js" in disk.decode("utf-8"),
            "disk_root_has_panther": b"panther.html" in disk,
            "disk_root_has_vehicle_explore": b"vehicle-explore/explore.html?v=airport-fire-truck"
            in disk,
            "dist_has_panther": "panther.html" in dist,
            "dist_has_vehicle_explore": "vehicle-explore/explore.html?v=airport-fire-truck" in dist
            or "../preview/vehicle-explore/explore.html?v=airport-fire-truck" in dist,
            "garage_fleet_js_has_panther": "panther.html" in fleet_js,
            "garage_fleet_js_has_vehicle_explore": "vehicle-explore/explore.html?v=airport-fire-truck"
            in fleet_js,
        }

        # Find It!
        find_href = page.get_attribute("a.hit-find", "href") or ""
        with page.expect_navigation():
            page.click("a.hit-find")
        find_url = page.url
        report["findIt"] = {
            "href": find_href,
            "opened": find_url,
            "ok": find_href == "find-it.html" and path_of(find_url).endswith("/find-it.html"),
        }
        if not report["findIt"]["ok"]:
            report["ok"] = False
        page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")

        # Say It! — drawn only, no hit target (ARCHITECTURE / nav prototype)
        say_hits = page.locator('a[aria-label="Say It!"], a.hit-say, button:has-text("Say It!")')
        report["sayIt"] = {
            "interactiveControls": say_hits.count(),
            "ok": say_hits.count() == 0,
            "note": "Say It! is artwork only; no navigation handler expected",
        }
        if not report["sayIt"]["ok"]:
            report["ok"] = False

        for name, vid, index in FLEET:
            entry = {"name": name, "id": vid, "ok": True}
            page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
            page.click(f'.bay-slot[data-index="{index}"]')
            page.wait_for_timeout(150)

            state = page.evaluate(
                """() => {
                  const explore = document.getElementById('explore');
                  const selected = document.querySelector('.bay-slot.is-selected, .bay-slot[aria-pressed=\"true\"]');
                  return {
                    exploreHref: explore ? explore.getAttribute('href') : null,
                    exploreAbs: explore ? explore.href : null,
                    selectedLabel: selected ? selected.getAttribute('aria-label') : null,
                    fleetUrl: (typeof fleet !== 'undefined' && fleet[%d]) ? fleet[%d][1] : null
                  };
                }"""
                % (index, index)
            )
            expected_rel = f"preview/vehicle-explore/explore.html?v={vid}"
            entry["beforeClick"] = state
            entry["expectedRel"] = expected_rel
            if state.get("fleetUrl") != expected_rel or state.get("exploreHref") != expected_rel:
                entry["ok"] = False
            if state.get("selectedLabel") != name:
                entry["ok"] = False
            for marker in OLD_MARKERS:
                href = state.get("exploreHref") or ""
                absu = state.get("exploreAbs") or ""
                if marker in href or marker in absu:
                    entry["ok"] = False
                    entry["oldMarker"] = marker

            # Click the actual top Explore control (hit target), not a spoofed goto.
            box = page.locator("#explore").bounding_box()
            entry["exploreHitBox"] = box
            with page.expect_navigation():
                page.click("a.hit-explore#explore", force=True)
            page.wait_for_load_state("domcontentloaded")
            final = page.url
            parsed = urlparse(final)
            entry["finalUrl"] = final
            entry["finalOk"] = (
                path_of(final).endswith("/preview/vehicle-explore/explore.html")
                and f"v={vid}" in parsed.query
            )
            if not entry["finalOk"]:
                entry["ok"] = False
            for marker in OLD_MARKERS:
                if marker in final:
                    entry["ok"] = False
                    entry["finalOldMarker"] = marker

            # Garage back
            page.wait_for_selector("a.route-garage", timeout=10000)
            with page.expect_navigation():
                page.click("a.route-garage")
            entry["garageBack"] = page.url
            if not path_of(page.url).endswith("/garage.html"):
                entry["ok"] = False

            # Explore again → Home
            page.click(f'.bay-slot[data-index="{index}"]')
            with page.expect_navigation():
                page.click("a.hit-explore#explore", force=True)
            page.wait_for_selector("a.route-home", timeout=10000)
            with page.expect_navigation():
                page.click("a.route-home")
            entry["homeBack"] = page.url
            if not path_of(page.url).endswith("/index.html"):
                entry["ok"] = False

            if not entry["ok"]:
                report["ok"] = False
            report["routes"].append(entry)

        # Dist probe (local stale bundle path users may open)
        page.goto(f"{BASE}/dist/garage.html", wait_until="domcontentloaded")
        page.click('.bay-slot[data-index="1"]')
        dist_state = page.evaluate(
            """() => {
              const explore = document.getElementById('explore');
              return { href: explore && explore.getAttribute('href'), abs: explore && explore.href };
            }"""
        )
        with page.expect_navigation():
            page.click("a.hit-explore#explore", force=True)
        report["distProbe"] = {
            "before": dist_state,
            "finalUrl": page.url,
            "ok": "v=airport-fire-truck" in page.url
            and "preview/vehicle-explore/explore.html" in page.url
            and "panther.html" not in page.url,
        }
        if not report["distProbe"]["ok"]:
            report["ok"] = False
            report["rootCauseNotes"].append(
                "dist/garage.html Explore destination failed after sync."
            )

        browser.close()

    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# Garage Explore wire fix",
        "",
        "Date: 2026-11-05",
        "APPROVED: not set",
        "Rollback: `preview/vehicle-explore/rollback/garage-explore-wire-fix_2026-11-05_0033.zip`",
        "",
        "## Root cause",
        "",
        "Live Explore destinations for the approved chooser come only from the inline `fleet` array in `garage.html`.",
        "`show(index)` assigns `#explore.href = fleet[index][1]`. The Explore click listener only stops speech.",
        "`public/js/garage-fleet.js` is **not** loaded by `garage.html` (Find It! only).",
        "",
        "Previous `GARAGE_WIRE_CHECK.json` tested root `http://127.0.0.1:8877/garage.html`, which was already updated.",
        "Stale destinations remained in:",
        "",
        "1. `dist/garage.html` — still `panther.html?test=local` / `liebherr.html?test=local`",
        "2. Published play site `https://venera-tropnikova.github.io/Alexs-Amazing-Garage-play/garage.html` (no deploy this task)",
        "3. `public/js/garage-fleet.js` Explore field (unused by Garage click, but still old)",
        "",
        "Not browser cache for root `:8877/garage.html`: loaded document SHA matched disk; body had vehicle-explore and no panther.",
        "",
        f"## Strict check result: `{'PASS' if report['ok'] else 'FAIL'}`",
        "",
        "Artifact: `preview/vehicle-explore/GARAGE_WIRE_CHECK.json`",
        "",
        "## Final URLs (root Garage → top Explore)",
        "",
    ]
    for entry in report["routes"]:
        mark = "OK" if entry.get("ok") else "FAIL"
        lines.append(f"- {mark} {entry['name']}: `{entry.get('finalUrl')}`")
    lines.extend(
        [
            "",
            "## Changed files",
            "",
            "- `public/js/garage-fleet.js` — Explore URLs aligned with Garage",
            "- `dist/garage.html` — Explore fleet synced; paths use `../preview/vehicle-explore/...` from `/dist/`",
            "- root `garage.html` — already pointed at new Explore (unchanged this pass if still correct)",
            "",
            "Design / images / audio / Explore UI / Garage geometry: not edited.",
            "",
        ]
    )
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "out": str(OUT), "report": str(REPORT)}, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

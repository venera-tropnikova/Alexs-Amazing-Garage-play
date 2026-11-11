"""Click-check: Home → Garage → Explore (9) → Garage / Home. No APPROVED."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BASE = "http://127.0.0.1:8877"
OUT = Path(__file__).resolve().parent / "GARAGE_WIRE_CHECK.json"

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


def path_of(url: str) -> str:
    return urlparse(url).path.replace("\\", "/")


def main() -> int:
    report = {
        "base": BASE,
        "homeToGarage": None,
        "findItPreserved": None,
        "vehiclesLinkAbsent": None,
        "routes": [],
        "brokenAssets": [],
        "ok": True,
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        failed = []

        def on_response(response):
            try:
                if response.status >= 400 and response.request.resource_type in (
                    "image",
                    "stylesheet",
                    "script",
                    "fetch",
                    "xhr",
                ):
                    failed.append(
                        {
                            "url": response.url,
                            "status": response.status,
                            "type": response.request.resource_type,
                        }
                    )
            except Exception:
                pass

        page.on("response", on_response)

        # Home → Garage
        page.goto(f"{BASE}/index.html", wait_until="domcontentloaded")
        page.click("a.start-hit")
        page.wait_for_url("**/garage.html**")
        report["homeToGarage"] = {
            "ok": path_of(page.url).endswith("/garage.html"),
            "url": page.url,
        }
        if not report["homeToGarage"]["ok"]:
            report["ok"] = False

        # Find It! still points to find-it.html
        find_href = page.get_attribute("a.hit-find", "href") or ""
        report["findItPreserved"] = {
            "ok": find_href == "find-it.html",
            "href": find_href,
        }
        if not report["findItPreserved"]["ok"]:
            report["ok"] = False

        for name, vid, index in FLEET:
            entry = {
                "name": name,
                "id": vid,
                "bayIndex": index,
                "exploreHref": None,
                "opened": None,
                "title": None,
                "garageBack": None,
                "homeBack": None,
                "noVehiclesNav": None,
                "ok": True,
            }
            failed.clear()

            page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
            page.click(f'.bay-slot[data-index="{index}"]')
            explore_href = page.get_attribute("#explore", "href") or ""
            expected = f"preview/vehicle-explore/explore.html?v={vid}"
            entry["exploreHref"] = {
                "href": explore_href,
                "expected": expected,
                "ok": explore_href == expected,
            }
            if not entry["exploreHref"]["ok"]:
                entry["ok"] = False

            with page.expect_navigation():
                page.click("#explore")
            page.wait_for_load_state("domcontentloaded")
            opened = path_of(page.url)
            query = urlparse(page.url).query
            entry["opened"] = {
                "url": page.url,
                "ok": opened.endswith("/preview/vehicle-explore/explore.html")
                and f"v={vid}" in query,
            }
            if not entry["opened"]["ok"]:
                entry["ok"] = False

            # Shell ready
            page.wait_for_selector(".vehicle-title, .route-nav", timeout=10000)
            title = page.locator(".vehicle-title").first.inner_text().strip()
            entry["title"] = {"text": title, "ok": name.lower() in title.lower() or bool(title)}
            if not entry["title"]["ok"]:
                entry["ok"] = False

            # No Vehicles catalog link in game Explore
            vehicles = page.locator("a.route-fleet, a[href*='vehicle-explore/index.html']")
            entry["noVehiclesNav"] = {"ok": vehicles.count() == 0, "count": vehicles.count()}
            if not entry["noVehiclesNav"]["ok"]:
                entry["ok"] = False

            home_href = page.get_attribute("a.route-home", "href") or ""
            garage_href = page.get_attribute("a.route-garage", "href") or ""
            if "index.html" not in home_href:
                entry["ok"] = False
                entry["homeHref"] = home_href
            if "garage.html" not in garage_href:
                entry["ok"] = False
                entry["garageHref"] = garage_href

            # Garage back
            with page.expect_navigation():
                page.click("a.route-garage")
            page.wait_for_load_state("domcontentloaded")
            entry["garageBack"] = {
                "url": page.url,
                "ok": path_of(page.url).endswith("/garage.html"),
            }
            if not entry["garageBack"]["ok"]:
                entry["ok"] = False

            # Re-open Explore then Home
            page.click(f'.bay-slot[data-index="{index}"]')
            with page.expect_navigation():
                page.click("#explore")
            page.wait_for_selector("a.route-home", timeout=10000)
            with page.expect_navigation():
                page.click("a.route-home")
            page.wait_for_load_state("domcontentloaded")
            entry["homeBack"] = {
                "url": page.url,
                "ok": path_of(page.url).endswith("/index.html"),
            }
            if not entry["homeBack"]["ok"]:
                entry["ok"] = False

            if failed:
                entry["brokenAssets"] = list(failed)
                entry["ok"] = False
                report["brokenAssets"].extend(
                    [{"vehicle": name, **item} for item in failed]
                )

            if not entry["ok"]:
                report["ok"] = False
            report["routes"].append(entry)

        # Spot-check Find It from garage still loads
        page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
        with page.expect_navigation():
            page.click("a.hit-find")
        page.wait_for_load_state("domcontentloaded")
        find_ok = path_of(page.url).endswith("/find-it.html")
        report["findItClick"] = {"ok": find_ok, "url": page.url}
        if not find_ok:
            report["ok"] = False

        # Vehicles catalog not linked from garage
        page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
        catalog = page.locator("a[href*='vehicle-explore/index.html']")
        report["vehiclesLinkAbsent"] = {
            "ok": catalog.count() == 0,
            "count": catalog.count(),
        }
        if not report["vehiclesLinkAbsent"]["ok"]:
            report["ok"] = False

        browser.close()

    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "out": str(OUT)}, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

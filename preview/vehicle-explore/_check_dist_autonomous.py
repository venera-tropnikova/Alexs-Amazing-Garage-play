"""Strict autonomous dist/ check. Document root MUST be dist/ only."""
from __future__ import annotations

import http.server
import json
import socketserver
import sys
import threading
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
PORT = 8890
BASE = f"http://127.0.0.1:{PORT}"
OUT = Path(__file__).resolve().parent / "DIST_AUTONOMOUS_CHECK.json"
REPORT = Path(__file__).resolve().parent / "DIST_AUTONOMOUS_REPORT.md"

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


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def log_message(self, format, *args):  # noqa: A003
        return


def path_of(url: str) -> str:
    return urlparse(url).path.replace("\\", "/")


def main() -> int:
    if not (DIST / "index.html").is_file():
        print("FAIL: dist/ missing — run tools/build_online_dist.py")
        return 1

    report = {
        "ok": True,
        "base": BASE,
        "documentRoot": str(DIST),
        "outsideDistRefs": [],
        "routes": [],
        "findIt": None,
        "sayIt": None,
        "tts": [],
        "notes": [],
    }

    # Prove no ../preview leftovers in dist play files.
    for path in DIST.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".html", ".js", ".css", ".json"}:
            continue
        text = path.read_text(encoding="utf-8")
        if "preview/vehicle-explore" in text or "../preview/" in text or 'Backup/' in text:
            rel = path.relative_to(DIST).as_posix()
            report["outsideDistRefs"].append(rel)
            report["ok"] = False

    server = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler)
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome", headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            failed: list[str] = []
            js_errors: list[str] = []

            page.on("pageerror", lambda e: js_errors.append(str(e)))
            page.on(
                "response",
                lambda r: failed.append(f"{r.status} {r.url}")
                if r.status >= 400
                and r.request.resource_type in ("image", "stylesheet", "script", "fetch", "xhr", "document")
                else None,
            )

            # Home → Garage
            page.goto(f"{BASE}/index.html", wait_until="domcontentloaded")
            with page.expect_navigation():
                page.click("a.start-hit")
            if not path_of(page.url).endswith("/garage.html"):
                report["ok"] = False
                report["notes"].append(f"Home→Garage failed: {page.url}")

            # Say It! remains non-interactive
            say = page.locator('a[aria-label="Say It!"], a.hit-say, button:has-text("Say It!")')
            report["sayIt"] = {"interactiveControls": say.count(), "ok": say.count() == 0}
            if not report["sayIt"]["ok"]:
                report["ok"] = False

            for name, vid, index in FLEET:
                entry = {"name": name, "id": vid, "ok": True}
                failed.clear()
                js_errors.clear()

                page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
                page.click(f'.bay-slot[data-index="{index}"]')
                href = page.get_attribute("#explore", "href") or ""
                expected = f"vehicle-explore/explore.html?v={vid}"
                entry["exploreHref"] = href
                if href != expected:
                    entry["ok"] = False

                with page.expect_navigation():
                    page.click("a.hit-explore#explore", force=True)
                page.wait_for_selector(".vehicle-title", timeout=12000)
                entry["finalUrl"] = page.url
                if not (
                    path_of(page.url).endswith("/vehicle-explore/explore.html")
                    and f"v={vid}" in page.url
                ):
                    entry["ok"] = False
                if "preview/" in page.url or "Backup/" in page.url:
                    entry["ok"] = False

                title = page.locator(".vehicle-title").inner_text().strip()
                entry["title"] = title

                # Images on Outside
                broken = page.evaluate(
                    """() => [...document.images]
                      .filter(img => !img.complete || img.naturalWidth === 0)
                      .map(img => img.currentSrc || img.src)"""
                )
                entry["brokenImagesOutside"] = broken
                if broken:
                    entry["ok"] = False

                # Hotspot → lesson card + Hear it (browser TTS path)
                hits = page.locator(".scene-hit, button.scene-hit, .scene-pin button")
                entry["hotspotCount"] = hits.count()
                if hits.count() < 1:
                    entry["ok"] = False
                else:
                    hits.first.click(force=True)
                    page.wait_for_timeout(250)
                    if page.locator(".lesson-panel, .lesson-title").count() < 1:
                        entry["ok"] = False
                        entry["lesson"] = "missing"
                    else:
                        entry["lesson"] = page.locator(".lesson-title").first.inner_text().strip()
                        hear = page.locator(
                            "button.lesson-hear, .lesson-panel button:has-text('Hear'), "
                            "button:has-text('Hear it')"
                        )
                        tts_note = {"vehicle": name, "hearPresent": hear.count() > 0}
                        if hear.count():
                            spoke = page.evaluate(
                                """async () => {
                                  const before = !!(window.speechSynthesis &&
                                    (speechSynthesis.speaking || speechSynthesis.pending));
                                  const btn = document.querySelector(
                                    'button.lesson-hear, .lesson-panel button'
                                  );
                                  // Prefer labeled Hear control
                                  const buttons = [...document.querySelectorAll('.lesson-panel button')];
                                  const hearBtn = buttons.find(b => /hear/i.test(b.textContent||'')) || buttons[0];
                                  if (!hearBtn) return {ok:false, reason:'no-button'};
                                  hearBtn.click();
                                  await new Promise(r => setTimeout(r, 400));
                                  const after = !!(window.speechSynthesis &&
                                    (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused));
                                  if (window.speechSynthesis) speechSynthesis.cancel();
                                  return {
                                    ok: true,
                                    supported: 'speechSynthesis' in window,
                                    speakingObserved: before || after,
                                  };
                                }"""
                            )
                            tts_note.update(spoke if isinstance(spoke, dict) else {"raw": spoke})
                        report["tts"].append(tts_note)

                # Parts sheet
                parts_btn = page.locator(".parts-toggle, button.parts-toggle")
                if parts_btn.count() < 1:
                    parts_btn = page.locator("button:has-text('Parts')")
                if parts_btn.count() < 1:
                    entry["ok"] = False
                    entry["parts"] = "missing"
                else:
                    parts_btn.first.click()
                    page.wait_for_timeout(200)
                    items = page.locator(
                        ".parts-sheet button, .parts-list button, .parts-sheet [role='option'], "
                        ".parts-sheet a, .parts-panel button"
                    )
                    entry["partsCount"] = items.count()
                    if items.count() < 1:
                        entry["ok"] = False

                # Additional views
                modes = page.locator(".mode-btn, [role='tab'].mode-btn, .mode-bar [role='tab']")
                if modes.count() < 1:
                    modes = page.locator("[role='tab']")
                entry["modeCount"] = modes.count()
                if modes.count() > 1:
                    modes.nth(1).click()
                    page.wait_for_timeout(400)
                    broken2 = page.evaluate(
                        """() => [...document.images]
                          .filter(img => !img.complete || img.naturalWidth === 0)
                          .map(img => img.currentSrc || img.src)"""
                    )
                    entry["brokenImagesAlt"] = broken2
                    if broken2:
                        entry["ok"] = False
                    # Look Inside labeled button if any
                    look = page.locator(
                        "[role='tab']:has-text('Look'), .mode-btn:has-text('Look')"
                    )
                    if look.count():
                        look.first.click()
                        page.wait_for_timeout(400)
                        broken3 = page.evaluate(
                            """() => [...document.images]
                              .filter(img => !img.complete || img.naturalWidth === 0)
                              .map(img => img.currentSrc || img.src)"""
                        )
                        entry["brokenImagesLookInside"] = broken3
                        if broken3:
                            entry["ok"] = False

                if failed:
                    entry["httpErrors"] = failed[:]
                    entry["ok"] = False
                if js_errors:
                    entry["jsErrors"] = js_errors[:]
                    entry["ok"] = False

                # Garage back
                with page.expect_navigation():
                    page.click("a.route-garage")
                entry["garageBack"] = page.url
                if not path_of(page.url).endswith("/garage.html"):
                    entry["ok"] = False

                # Explore → Home
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

            # Find It!
            page.goto(f"{BASE}/garage.html", wait_until="domcontentloaded")
            with page.expect_navigation():
                page.click("a.hit-find")
            find_ok = path_of(page.url).endswith("/find-it.html")
            if find_ok:
                # bay grid present
                bays = page.locator(".bay-slot, #bays .bay-slot").count()
                page.click("#find-garage")
                page.wait_for_load_state("domcontentloaded")
                report["findIt"] = {
                    "ok": find_ok and path_of(page.url).endswith("/garage.html"),
                    "bays": bays,
                    "url": page.url,
                }
            else:
                report["findIt"] = {"ok": False, "url": page.url}
            if not report["findIt"]["ok"]:
                report["ok"] = False

            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# Autonomous dist/ build report",
        "",
        "Date: 2026-11-05",
        "APPROVED: not set",
        "Commit / push / deploy: none",
        f"Rollback: `preview/vehicle-explore/rollback/dist-autonomous_2026-11-05_0109.zip`",
        "",
        f"## Local test server",
        "",
        f"- URL: `{BASE}/`",
        f"- Document root: `{DIST.as_posix()}` (dist only, not project root)",
        "",
        f"## Result: `{'PASS' if report['ok'] else 'FAIL'}`",
        "",
        "Artifact: `preview/vehicle-explore/DIST_AUTONOMOUS_CHECK.json`",
        "",
        "## Routes (real clicks)",
        "",
    ]
    for entry in report["routes"]:
        mark = "OK" if entry.get("ok") else "FAIL"
        lines.append(f"- {mark} {entry['name']}: `{entry.get('finalUrl')}`")
    lines.extend(
        [
            "",
            "## Changed tooling / outputs",
            "",
            "- `tools/build_online_dist.py` — packages `vehicle-explore/`, rewrites paths, copies plates",
            "- `tools/check_online_dist.py` — expects unified Explore destinations",
            "- `dist/**` — rebuilt autonomous bundle",
            "",
            "Source play paths under project root (`preview/vehicle-explore/`, root `garage.html`) unchanged by design;",
            "dist copies are rewritten to `vehicle-explore/` with no `../preview/` or `Backup/`.",
            "",
            "## Baseline checks",
            "",
            "`tools/check_garage_approved.py` still fails: Explore destinations differ from frozen `?test=local` lock.",
            "Cause: intentional Garage→Explore wiring. Lock not rewritten.",
            "",
        ]
    )
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"ok": report["ok"], "base": BASE, "out": str(OUT)}, indent=2))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

from pathlib import Path
from playwright.sync_api import sync_playwright

SHOTS = Path(__file__).resolve().parent / "shots"
BASE = "http://127.0.0.1:8877"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    for w, h in [(1280, 800), (1024, 768), (768, 1024)]:
        page = browser.new_page(viewport={"width": w, "height": h})
        page.goto(
            f"{BASE}/preview/vehicle-explore/explore.html?v=ambulance",
            wait_until="networkidle",
            timeout=60000,
        )
        page.wait_for_selector(".scene-composite-img")
        page.wait_for_function(
            "() => { const i=document.querySelector('.scene-composite-img');"
            " return i && i.complete && i.naturalWidth>0; }"
        )
        page.wait_for_timeout(200)
        page.screenshot(path=str(SHOTS / f"ambulance-outside-{w}x{h}.png"))
        page.locator(".view-bar-button").nth(1).click()
        page.wait_for_timeout(500)
        page.wait_for_function(
            "() => { const i=document.querySelector('.scene-composite-img');"
            " return i && i.complete && i.naturalWidth>0; }"
        )
        hits = page.locator(".scene-hit").count()
        dock = page.locator(".part-dock-button").count()
        page.screenshot(path=str(SHOTS / f"ambulance-front-{w}x{h}.png"))
        if w == 1280:
            page.locator(".scene-hit").first.click(force=True)
            page.wait_for_selector(".part-card:not([hidden])")
            page.screenshot(path=str(SHOTS / "ambulance-front-card-1280x800.png"))
            page.locator(".view-bar-button").nth(2).click()
            page.wait_for_timeout(500)
            page.screenshot(path=str(SHOTS / "ambulance-back-1280x800.png"))
            back_hits = page.locator(".scene-hit").count()
            back_dock = page.locator(".part-dock-button").count()
            print("front", hits, dock, "back", back_hits, back_dock)
        page.close()
    browser.close()
print("done")

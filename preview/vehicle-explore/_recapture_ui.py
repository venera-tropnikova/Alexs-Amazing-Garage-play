from pathlib import Path
from playwright.sync_api import sync_playwright

SHOTS = Path(__file__).resolve().parent / "shots"
BASE = "http://127.0.0.1:8877"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(
        f"{BASE}/preview/vehicle-explore/explore.html?v=fire-truck",
        wait_until="networkidle",
        timeout=60000,
    )
    page.wait_for_selector(".scene-hit")
    page.wait_for_timeout(300)
    page.screenshot(path=str(SHOTS / "fire-truck-outside-1280x800.png"))
    page.evaluate("() => document.querySelector('.scene-hit')?.click()")
    page.wait_for_function("() => document.body.classList.contains('card-open')")
    page.screenshot(path=str(SHOTS / "fire-truck-card-1280x800.png"))
    page.evaluate("() => document.querySelector('.part-card-close')?.click()")
    page.locator(".view-bar-button").nth(1).click()
    page.wait_for_timeout(500)
    page.wait_for_function(
        "() => { const i=document.querySelector('.scene-composite-img');"
        " return i && i.complete && i.naturalWidth>0; }"
    )
    page.screenshot(path=str(SHOTS / "fire-truck-look-inside-1280x800.png"))
    page.evaluate("() => document.querySelector('.scene-hit')?.click()")
    page.wait_for_function("() => document.body.classList.contains('card-open')")
    page.screenshot(path=str(SHOTS / "fire-truck-look-inside-card-1280x800.png"))
    page.close()
    browser.close()
print("ok")

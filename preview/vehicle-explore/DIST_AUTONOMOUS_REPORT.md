# Autonomous dist/ build report

Date: 2026-11-05  
APPROVED: not set  
Commit / push / deploy: none  
Rollback: `preview/vehicle-explore/rollback/dist-autonomous_2026-11-05_0109.zip`

## Local test server

- **URL:** http://127.0.0.1:8890/
- **Document root:** `D:/Alexs_Amazing_Garage/dist` (только `dist/`, не корень проекта)
- Cover: http://127.0.0.1:8890/index.html
- Garage: http://127.0.0.1:8890/garage.html
- Explore example: http://127.0.0.1:8890/vehicle-explore/explore.html?v=fire-truck

## Result: PASS

Artifact: `preview/vehicle-explore/DIST_AUTONOMOUS_CHECK.json`  
Also: `tools/check_online_dist.py` → PASSED  
Manifest: `verification/online-ready/dist-manifest.json` (82 files; 109 audio excluded by rights policy)

## What “autonomous” means

- Unified Explore packaged as `dist/vehicle-explore/` (not `preview/`).
- Alt-view plates copied from `Backup/` into `dist/vehicle-explore/plates/` (no `Backup/` inside dist).
- Garage / fleet Explore URLs rewritten to `vehicle-explore/explore.html?v=<id>`.
- No `../preview/`, no `preview/vehicle-explore`, no `Backup/` refs in dist HTML/JS/CSS/JSON.
- Source tree (`preview/vehicle-explore/`, root `garage.html` Explore paths for project-root play) kept for development.

## Real click routes (server root = dist)

| Machine | Final Explore URL |
|---------|-------------------|
| Fire Truck | `/vehicle-explore/explore.html?v=fire-truck` |
| Airport Fire Truck | `/vehicle-explore/explore.html?v=airport-fire-truck` |
| Police Car | `/vehicle-explore/explore.html?v=police-car` |
| Excavator | `/vehicle-explore/explore.html?v=excavator` |
| Mobile Crane | `/vehicle-explore/explore.html?v=mobile-crane` |
| Tractor | `/vehicle-explore/explore.html?v=tractor` |
| Dump Truck | `/vehicle-explore/explore.html?v=dump-truck` |
| Mars Rover | `/vehicle-explore/explore.html?v=mars-rover` |
| Ambulance | `/vehicle-explore/explore.html?v=ambulance` |

Also verified per vehicle: Outside images, hotspot → lesson card, Parts list, additional views / Look Inside plates, Garage back, Home back, browser TTS Hear control (speechSynthesis observed).  
Find It! opens and returns to Garage. Say It! still has no hit target (unchanged).  
No HTTP ≥400 on images/css/js/fetch during those routes. No page JS errors after speak race fix.

## Fleet consistency

`dist/garage.html` inline `fleet[*][1]` matches `dist/public/js/garage-fleet.js` Explore URLs (both `vehicle-explore/explore.html?v=…`).  
Selection mechanism unchanged: bay → `show(index)` → `#explore.href`.

## Changed files

| Path | Change |
|------|--------|
| `tools/build_online_dist.py` | Package `vehicle-explore/`, plates, path rewrite, fleet gate |
| `tools/check_online_dist.py` | Expect unified Explore; richer shell checks |
| `dist/**` | Full rebuild (82 files) |
| `garage.html` | Defensive speak/stopName race fix when WAV missing (dist); Explore URLs for root play already pointed at preview |
| `public/js/garage-fleet.js` | Explore URLs aligned (root still `preview/…`; dist copy rewritten) |
| `verification/online-ready/dist-manifest.json` | Regenerated |
| `verification/online-ready/http-check.txt` | Regenerated |
| `preview/vehicle-explore/DIST_AUTONOMOUS_*.md/json` | This report + check |

Design / Garage geometry / Explore UI / images content: not redesigned. Plates are copies of existing art.

## Baseline checks (not rewritten)

- `tools/check_garage_approved.py` — **FAIL expected**: frozen lock still expects old `?test=local` Explore pages; live Garage uses new Explore. Lock not updated.
- `tools/check_garage_allowed_delta.py` — still documents only Fire Truck → `fire-truck-explore.html` as allowed delta; now all 9 use unified Explore. **Not edited for PASS**; report the mismatch cause if run.

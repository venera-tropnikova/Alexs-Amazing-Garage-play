# Garage Explore wire fix

Date: 2026-11-05
APPROVED: not set
Rollback: `preview/vehicle-explore/rollback/garage-explore-wire-fix_2026-11-05_0033.zip`

## Root cause

Live Explore destinations for the approved chooser come only from the inline `fleet` array in `garage.html`.
`show(index)` assigns `#explore.href = fleet[index][1]`. The Explore click listener only stops speech.
`public/js/garage-fleet.js` is **not** loaded by `garage.html` (Find It! only).

Previous `GARAGE_WIRE_CHECK.json` tested root `http://127.0.0.1:8877/garage.html`, which was already updated.
Stale destinations remained in:

1. `dist/garage.html` — still `panther.html?test=local` / `liebherr.html?test=local`
2. Published play site `https://venera-tropnikova.github.io/Alexs-Amazing-Garage-play/garage.html` (no deploy this task)
3. `public/js/garage-fleet.js` Explore field (unused by Garage click, but still old)

Not browser cache for root `:8877/garage.html`: loaded document SHA matched disk; body had vehicle-explore and no panther.

## Strict check result: `PASS`

Artifact: `preview/vehicle-explore/GARAGE_WIRE_CHECK.json`

## Final URLs (root Garage → top Explore)

- OK Fire Truck: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=fire-truck`
- OK Airport Fire Truck: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=airport-fire-truck`
- OK Police Car: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=police-car`
- OK Excavator: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=excavator`
- OK Mobile Crane: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=mobile-crane`
- OK Tractor: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=tractor`
- OK Dump Truck: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=dump-truck`
- OK Mars Rover: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=mars-rover`
- OK Ambulance: `http://127.0.0.1:8877/preview/vehicle-explore/explore.html?v=ambulance`

## Changed files

- `public/js/garage-fleet.js` — Explore URLs aligned with Garage
- `dist/garage.html` — Explore fleet + default `#explore` href synced; paths use `../preview/vehicle-explore/...` from `/dist/`
- root `garage.html` — already pointed at new Explore (bytes unchanged this pass; SHA matched loaded document)

Design / images / audio / Explore UI / Garage geometry: not edited.

## Still old (no deploy)

`https://venera-tropnikova.github.io/Alexs-Amazing-Garage-play/garage.html` still contains `panther.html` / `liebherr.html`. Local root/dist were the fix targets; published play was not updated.


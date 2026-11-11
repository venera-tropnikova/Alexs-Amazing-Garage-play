# Garage → Explore integration

Date: 2026-11-05  
Scope: wire approved `garage.html` to unified Explore; remove duplicate Vehicles route from play  
Rollback: `preview/vehicle-explore/rollback/garage-explore-wire_2026-11-05_0020.zip`  
APPROVED: not set  
Commit / push / deploy: none

## Intent

One play garage (approved chooser with Alex). Nine Explore destinations open the new shell. Dev catalog `preview/vehicle-explore/index.html` stays on disk, off the game route.

## Changes

| File | Change |
|------|--------|
| `garage.html` | Explore URLs only (fleet + default `#explore` href). Visual / CSS / bay geometry / audio / images untouched. |
| `preview/vehicle-explore/explore-shell.js` | Nav is Home + Garage only; Vehicles link removed. |
| `preview/vehicle-explore/index.html` | Kept for development; lede marks it as not on the game route. |

Not changed: Find It! / `public/js/garage-fleet.js` (Find It does not navigate via Explore URLs), old vehicle pages, Explore UI, scene art, hotspot data, TTS, registries, Garage CSS/images.

## Live routes (verified by click)

`index.html` → Start Adventure → `garage.html` → bay select → Explore → shell → Garage / Home.

| Machine | Explore |
|---------|---------|
| Fire Truck | `preview/vehicle-explore/explore.html?v=fire-truck` |
| Airport Fire Truck | `preview/vehicle-explore/explore.html?v=airport-fire-truck` |
| Police Car | `preview/vehicle-explore/explore.html?v=police-car` |
| Excavator | `preview/vehicle-explore/explore.html?v=excavator` |
| Mobile Crane | `preview/vehicle-explore/explore.html?v=mobile-crane` |
| Tractor | `preview/vehicle-explore/explore.html?v=tractor` |
| Dump Truck | `preview/vehicle-explore/explore.html?v=dump-truck` |
| Mars Rover | `preview/vehicle-explore/explore.html?v=mars-rover` |
| Ambulance | `preview/vehicle-explore/explore.html?v=ambulance` |

From each Explore: **Garage** → `garage.html`, **Home** → `index.html`. No Vehicles catalog control in the shell.

## Click check

Script: `preview/vehicle-explore/_check_garage_wire.py`  
Result: `preview/vehicle-explore/GARAGE_WIRE_CHECK.json` → `"ok": true`

Checked for all 9:

- Garage Explore `href` matches expected `?v=`
- Page opens with correct title
- Garage back lands on `garage.html`
- Home back lands on `index.html`
- No `vehicle-explore/index.html` link in shell or garage
- Find It! hit still `find-it.html` and opens
- No HTTP ≥400 on image / css / script / fetch during those navigations

## Garage approval lock

`python tools/check_garage_approved.py` → **FAILED** (expected for this wiring):

- `garage.html` hash / `fleet` field differ from freeze (Explore destinations only)
- Lock still expects old `*.html?test=local` / `truck.html?test=local`
- Script itself opened the new Explore URLs for all 9 (confirms wiring)
- Small screenshot pixel diffs during that run are not a Garage CSS change; layout/CSS/images were not edited

Do not re-freeze without separate consent. APPROVED not set.

## Left for development

- `preview/vehicle-explore/index.html` — manual fleet catalog
- Old pages (`fire-truck-explore.html`, `panther.html?test=local`, …) — not deleted

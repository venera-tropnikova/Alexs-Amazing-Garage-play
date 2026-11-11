# Equipment study report (preview)

Date: 2026-11-04  
Scope: `preview/vehicle-explore/` only  
Rollback: `preview/vehicle-explore/rollback/equipment-views_2026-11-04_0737.zip`  
Status: **not APPROVED** (`visualPass: false`)

## What a child can study

| Vehicle | Outside | Extra view(s) | Equipment / gear on extra view |
|---------|---------|---------------|--------------------------------|
| Fire Truck | Body parts (registry) | **Look inside** | Fire hose, Air tanks, First aid kit, Tools, Pump panel |
| Airport Fire Truck | Body parts | **Look inside** | Roof turret, Hose reel, Air tanks, First aid kit, Ventilation fan, Fire extinguisher |
| Police Car | Body parts | **Front** · **Look inside** | Front: Light bar, Push bumper, Spotlight · Trunk: Police case, Safety vest, First aid kit, Radios, Megaphone, Flashlight, Traffic cones |
| Excavator | Body parts | **Look inside** | Engine, Oil filters, Boom, Stick, Bucket |
| Mobile Crane | Body parts | **Look inside** | Boom, Hook, Winch cable, Lifting straps, Shackles, Fire extinguisher, Traffic cone |
| Tractor | Body parts | **Trailer** | Engine, Front weights, Grain trailer, Cab |
| Dump Truck | Body parts | **Look inside** | Engine, Dump body, Cab |
| Mars Rover | Body parts | **Look inside** | Computers, Mast camera, Robot arm, Science tools |
| Ambulance | Body parts | **Front** · **Look inside** | Front: Warning lights, Star of Life · Inside: Stretcher, Heart monitor, Oxygen tanks, Medical bag, Spine board |

## UX

- Hint line under the scene explains what the child is exploring.
- Buttons: **Outside** / **Look inside** / **Front** / **Trailer** (clear, not “Open doors”).
- Cards: English name + short explanation + Replay + browser TTS.
- Extra-view points use a **view-local** catalog — not copied Outside hotspots.
- Extra views are separate detail plates, **not** fake door/mechanism animation.

## Gaps (no approximate points)

- Airport Look inside: bumper turret not clearly separable on the open profile plate.
- Police Front / Ambulance Front: crew close-ups — limited gear (not open lockers).
- Dump Look inside: engine-open plate, **not** a raised dump bed (Raise Bed still needs layers).
- Same-camera OPEN animation layers still missing for all vehicles.

## Checks

- Screenshots: `preview/vehicle-explore/shots/*-outside-*.png`, `*-look-inside-*.png`, `*-front-*.png`, `*-trailer-*.png`, cards.
- Viewports: 1280×800, 1024×768, 768×1024.
- `CHECK.json` technical pass ≠ visual PASS. APPROVED not set.

## Preserved

- Approved Garage, Outside composites, Outside hotspots, EN cards, Replay, TTS.
- No source-image edits, no live game / Pages changes, no commit / push / deploy.

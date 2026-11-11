# Explore Scene Spec — 9 vehicles

Status: **specification only**. Backgrounds kept as visual guides; no generation/replacement in this stage.  
Source basis: `SOURCE_INVENTORY.json`. Live game / Garage / Pages unchanged.

## 1. Unified production rules (all 9)

| Rule | Requirement |
|---|---|
| Plate | One master render per vehicle; CLOSED and OPEN are **states of that plate**, not different artworks |
| Camera | Fixed camera for the pair: same FOV, height, angle, distance |
| Environment | Same background plate (or locked camera into that scene); existing `public/images/backgrounds/*-bg.png` are **guides** |
| Light | One key light direction for vehicle + environment; soft contact shadow under wheels/tracks matching that key |
| Ground | Wheels/tracks share one ground line on the scene floor; no floating silhouette |
| Scale | Vehicle fills ~65–80% stage width on 1280×800; full machine visible (no crop of wheels, boom, ladder, arm) |
| Canvas | Recommended master **1920×1080** or **1672×941** (match BG family); PNG RGBA; vehicle on transparent or pre-composited scene |
| Layers (preferred) | `scene-bg` (locked guide) · `vehicle-body` · optional `mechanism` / `compartment-contents` · `contact-shadow` |
| Forbidden | Swap to another photo/render on state change; new characters that change Alex; Zira/CANDIDATE/preview text in kid UI |
| Copy / speech | Keep registry English names + explanations; browser TTS + Replay (WAV reserve optional, not required for publish) |
| Interaction | One hotspot = one action; OPEN only when matching layer/state art exists |

**Backgrounds (do not replace now):**

| id | Guide path | Size |
|---|---|---|
| fire-truck | `public/images/backgrounds/fire-truck-bg.png` | 1671×941 |
| airport-fire-truck | `…/airport-fire-truck-bg.png` | 1672×941 |
| police-car | `…/police-car-bg.png` | 1600×900 |
| excavator | `…/excavator-bg.png` | 1672×941 |
| mobile-crane | `…/mobile-crane-bg.png` | 1600×900 |
| tractor | `…/tractor-bg.png` | 1600×900 |
| dump-truck | `…/dump-truck-bg.png` | 1600×900 |
| mars-rover | `…/mars-rover-bg.png` | 1600×900 |
| ambulance | `…/ambulance-bg.png` | 1600×900 |

Existing cutouts in `truck-36822-art/`, `garage-review/`, `Backup/` = **reference / inventory only**. None are accepted as final Explore scene plates (perspective mismatch confirmed).

---

## 2. Per-vehicle scene card

### Fire Truck
- **Guide BG:** fire station apron, low angle, polished concrete, light from right.
- **Camera / scale:** ¾ driver-side, camera ~1.2–1.5 m height; truck sits in open bay / on yellow bay lines; ~75% width.
- **Ground contact:** all visible tire patches on concrete; soft contact shadow under chassis, light from right.
- **Horizon:** building eave / mid frame; match BG vanishing toward left-open bay.
- **CLOSED:** shutters closed, ladder stowed.
- **OPEN (required):** same truck — left side compartments open (hose / air tanks / tools / pump panel readable). Prefer layers: body+doors vs contents, or single OPEN plate from same camera.
- **Existing usable?** BG as guide only. Current CLOSED/OPEN pair **rejected as mismatched models**. Need new CLOSED+OPEN (+ optional compartment content layers).

### Airport Fire Truck
- **Guide BG:** airport fire & rescue hangar + tarmac, sunny, light upper-right.
- **Camera / scale:** ¾ front-right (matches Panther silhouette kids know); ~70–75% width on apron.
- **Ground contact:** six tires on painted tarmac; contact shadow.
- **Horizon:** hangar / tower mid-high.
- **CLOSED:** roll-up shutters closed; turrets stowed.
- **OPEN:** same vehicle — side equipment bays open (hose reels, air, rescue gear) and/or turret highlight as layer if animated later.
- **Existing usable?** BG guide. `panther-red-polished` / Backup open **not** scene-compatible. Need CLOSED+OPEN.

### Police Car
- **Guide BG:** urban station glass façade, street, sun.
- **Camera / scale:** ¾ front; SUV fully in frame; ~65–70% width.
- **Ground contact:** tires on asphalt/sidewalk plane of BG; contact shadow; light matches sun (upper).
- **Horizon:** building mid-line.
- **CLOSED:** doors shut.
- **OPEN:** driver and/or rear door open on **same** side (equipment visible if credible); not a different front/rear photo.
- **Existing usable?** BG guide. Lesson/Backup angles unusable as pair. Need CLOSED+OPEN (door).

### Excavator
- **Guide BG:** construction dirt yard, short shadows to lower-left, light upper-right.
- **Camera / scale:** ¾ or true side matching BG eye height; tracks fully on dirt; boom/bucket uncropped; ~70% width.
- **Ground contact:** full track footprint on soil; contact shadow aligned with BG cones/barricade shadows.
- **Horizon:** ~mid frame (BG).
- **CLOSED (idle):** bucket near ground, boom folded for transport/work idle.
- **OPEN / second:** boom+stick extended **or** bucket dig pose — same machine, same camera (layer boom/stick/bucket preferred).
- **Existing usable?** BG guide. Lesson + Backup operator scene rejected for toggle. Need CLOSED+second pose (or layered arm).

### Mobile Crane
- **Guide BG:** worksite / yard (guide file).
- **Camera / scale:** ¾ showing driver cab, crane cab, boom full length, all near-side wheels; ~70–80% width (long vehicle).
- **Ground contact:** tires on ground; if OPEN shows outriggers, pads must plant on same plane.
- **Horizon:** mid; light consistent with BG.
- **CLOSED:** boom retracted on travel; outriggers in.
- **OPEN:** outriggers down and/or side lockers open — **same** crane render; optional layers: outriggers, locker doors, contents.
- **Existing usable?** BG guide. Lesson vs Backup open = different cameras. Need CLOSED+OPEN.

### Tractor
- **Guide BG:** farm / yard guide.
- **Camera / scale:** ¾; large rear tires fully visible; ~70% width.
- **Ground contact:** all tires on ground plane; contact shadow.
- **CLOSED:** hitch idle, no trailer required for MVP.
- **OPEN / second:** front hitch implement **or** linked trailer only if same camera plate; prefer hitch/PTO layer over new vehicle.
- **Existing usable?** BG guide. Trailer Backup = different scene. Need CLOSED; second state only with matching hitch/trailer plate.

### Dump Truck
- **Guide BG:** quarry/haul road guide.
- **Camera / scale:** ¾ articulated hauler; all six wheels visible; ~75% width.
- **Ground contact:** tires on road; shadow under articulation.
- **CLOSED:** dump body down.
- **OPEN:** dump body raised (hydraulics visible) — same truck; prefer layer `dump-body`.
- **Existing usable?** BG guide. Backup “open” is engine cutaway / wrong facing — **not** dump-up. Need CLOSED+body-up.

### Mars Rover
- **Guide BG:** Mars terrain, soft light upper-right, uneven soil.
- **Camera / scale:** ¾; mast, arm, six wheels uncropped; ~70% width; sit in clear foreground patch.
- **Ground contact:** wheels in dust; soft contact shadow (diffused light).
- **CLOSED:** arm/mast nominal stowed/explore pose.
- **OPEN / second:** side tech bay open **or** arm to sample pose — same rover; layers: bay door, arm.
- **Existing usable?** BG guide. Lesson vs Backup open mismatched. Need CLOSED+second.

### Ambulance
- **Guide BG:** EMS / station guide.
- **Camera / scale:** ¾ Type I module visible; F-450 cab distinct; ~70% width.
- **Ground contact:** tires on pavement; contact shadow.
- **CLOSED:** cab + module doors shut.
- **OPEN:** module side/rear door open showing patient bay gear **or** cab door — same ambulance; not front/back alternate stills.
- **Existing usable?** BG guide. Backup front/back unusable as OPEN. Need CLOSED+OPEN door.

---

## 3. Suitability of current sources

| Asset class | Role now |
|---|---|
| `backgrounds/*-bg.png` | **Keep** as composition / lighting / horizon guides |
| Lesson cutouts `truck-36822-art/*` | Inventory + hotspot text reference only — **not** final scene plates |
| `garage-review/*` | Garage-approved slots — **not** Explore scenes |
| `Backup/*` open/alt angles | Candidates rejected for state toggle (wrong camera/model) |
| Current pierce CLOSED/OPEN pair | **Do not** ship as one vehicle |

---

## 4. Missing images only (must create)

Minimum set for professional unified Explore:

| # | Deliverable | Notes |
|---|---|---|
| 1–9 | **Scene CLOSED** × 9 | Vehicle seated on matching guide BG (or equivalent locked camera); contact shadow; RGBA or flattened scene |
| 10 | Fire Truck **OPEN** | Same model/camera as Fire Truck CLOSED; compartments |
| 11 | Airport FT **OPEN** | Same as its CLOSED; bays/equipment |
| 12 | Police **OPEN** | Same; door(s) |
| 13 | Excavator **second pose** | Same; boom/bucket (or layered arm set) |
| 14 | Mobile Crane **OPEN** | Same; outriggers and/or lockers |
| 15 | Dump Truck **body up** | Same; raised dump (layer OK) |
| 16 | Ambulance **OPEN** | Same; module/cab door |
| 17 | Mars Rover **second** | Same; bay and/or arm |
| 18 | Tractor **second** (optional MVP) | Same camera hitch/trailer; can defer if CLOSED-only ship for tractor |

**Optional layer packs** (instead of full second plate): compartment contents (FT, Airport, Crane), dump body, excavator boom/stick/bucket, rover arm/bay door — each must register to CLOSED camera.

**Not required for this spec stage:** new backgrounds; WAV; Garage art changes; Alex redesign.

---

## 5. Acceptance checklist (before calling a scene ready)

1. Same vehicle identity CLOSED↔OPEN (livery, proportions, details).  
2. Same camera and environment.  
3. Wheels/tracks read as planted; shadow matches key light.  
4. No crop of critical parts at 1280×800, 1024×768, 768×1024.  
5. English labels + TTS/Replay work; no technical banners in kid UI.  
6. Visual sign-off by user (not `CHECK.json` alone).

*Not APPROVED — awaiting art production and user visual acceptance.*

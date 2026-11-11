# Explore art production briefs — 9 vehicles

Ready-to-create assignments for artists / 3D.  
Guides: `EXPLORE_SCENE_SPEC.md`, `MISSING_ART.md`, shell `fleet.js` + `explore-shell.js`.  
**Do not replace** guide backgrounds. **Do not** ship old cutouts as finished scenes.

---

## A. Global technical rules (all 9)

### A1. Required delivery format (primary)
| Layer role | Requirement |
|---|---|
| Background | **Immutable** file already in `public/images/backgrounds/*-bg.png` — never edit/replace |
| Vehicle / mechanisms | **Transparent RGBA** PNGs on a canvas **exactly equal to that BG’s pixel size** |
| Contact shadow | **Separate** RGBA layer `contact-shadow.png` (same canvas, same registration) — not a CSS oval |

**Not primary:** full RGB composites that bake BG into the vehicle plate. If a preview composite is needed for review only, it is extra — integration still uses BG + RGBA layers.

### A2. Scene coordinate system (shared)
| Rule | Value |
|---|---|
| Origin | Top-left of the **guide BG** = `(0, 0)` |
| +X / +Y | Right / down |
| Units | **Integer pixels** of the native BG |
| Layer canvas | **W×H = exact BG size** for every RGBA layer of that vehicle |
| Registration | All layers for one vehicle share one locked camera; stack is pixel-aligned (no scale/offset between layers) |

Adaptive display (shell) scales the whole registered stack uniformly into the stage and places it using `fleet.js` `placement` percentages derived from these pixel anchors. Artists author in **BG pixel space**, not in “~96–98% of cutout”.

### A3. Ground contact (mandatory per vehicle)
Each brief lists **contact points** `(x, y)` in scene coordinates: the tire/track patches that must sit on the BG ground plane.

Rules:
- Every listed contact point’s **y** lies on the vehicle’s **ground contact line** for that scene (see each card).
- Contact shadow alphas sit under those points and share the same key-light direction as the BG.
- After registration, moving from CLOSED → second state **must not** move any contact point (wheels/tracks stay fixed unless the brief explicitly moves a pad, e.g. crane outrigger).

### A4. CLOSED ↔ second state — pixel lock
| Must be identical | May differ |
|---|---|
| Camera, FOV, pose of chassis/body (except stated mechanism) | Only the named mechanism layers |
| Model, livery, scale, world position | Open shutters / doors / boom / body / arm / etc. |
| Lighting, environment (BG) | Visible contents revealed by OPEN |
| Canvas size, layer registration origin | — |

**Acceptance test:** after aligning layers, **static regions** (pixels not belonging to a moving mechanism mask) are **identical** between CLOSED and second-state stacks (bit-exact or visually indistinguishable at 100% zoom). Changing angle, model, scale, or whole-vehicle position between states is **reject**.

### A5. Mechanism layers — required metadata
For every movable part, the delivery note must include:
| Field | Meaning |
|---|---|
| `pivot` | `(x, y)` in scene px — hinge / rotation or slide origin |
| `motion` | `rotate` \| `slide` \| `swap-visibility` |
| `axis` / `direction` | e.g. rotate Z; slide +Y (down) |
| `range` | CLOSED pose → OPEN pose (degrees or px) |
| `z-order` | Draw order (bottom → top) |
| `mask` | Optional: pixels that are allowed to change |

### A6. Resolution families (match existing BGs)
| Family | Canvas W×H | Vehicles |
|---|---|---|
| A | **1671×941** | fire-truck (`fire-truck-bg.png` is 1671×941) |
| A≈ | **1672×941** | airport-fire-truck, excavator |
| B | **1600×900** | police-car, mobile-crane, tractor, dump-truck, mars-rover, ambulance |

All RGBA layers for a vehicle use **that vehicle’s family size exactly**.

### A7. Integration (existing architecture only)
Drop under `preview/vehicle-explore/scene-art/<vehicle-id>/`, then wire in `fleet.js`:
- `scene.layers.closed` — static body (RGBA) or body+closed mechanisms  
- `scene.layers.contactShadow` — separate shadow  
- `scene.layers.mechanisms[]` and/or `scene.layers.open` — second state  
- `visualStatus` / `visualPass` only after user visual sign-off  

Shell keeps EN labels + browser TTS. No new architecture in this brief.

### A8. Locked identity references (not final plates)
| Vehicle id | Guide BG | Livery / model reference |
|---|---|---|
| fire-truck | `public/images/backgrounds/fire-truck-bg.png` | Pierce-class ladder; one model for both states |
| airport-fire-truck | `…/airport-fire-truck-bg.png` | Rosenbauer Panther 6×6 |
| police-car | `…/police-car-bg.png` | Ford Police Interceptor Utility |
| excavator | `…/excavator-bg.png` | CAT 320 |
| mobile-crane | `…/mobile-crane-bg.png` | Liebherr LTM 1090-4.2 |
| tractor | `…/tractor-bg.png` | John Deere 8R 410 |
| dump-truck | `…/dump-truck-bg.png` | Volvo A40G |
| mars-rover | `…/mars-rover-bg.png` | Perseverance-class |
| ambulance | `…/ambulance-bg.png` | Ford F-450 Type I |

---

## B. Visual acceptance criteria (PASS)

1. Realism / one style family across all 9.  
2. Sharpness at 1280×800 (tread, decals, gear readable).  
3. Perspective matches guide BG ground plane + horizon.  
4. **No floating** — contact points on ground; shadow layer matches key light.  
5. No crop of critical parts at 1280×800, 1024×768, 768×1024.  
6. CLOSED/second: **static pixels match** after registration; only mechanisms change.  
7. No watermarks / “preview” burned into art.  
8. User visual sign-off (`CHECK.json` alone insufficient).

---

## C. Per-vehicle briefs (assignments kept + tech fixed)

Coordinates: scene px on that vehicle’s BG canvas. Contact **y** = ground line for that scene.

### 1. Fire Truck — `fire-truck`
| | |
|---|---|
| **Canvas** | **1671×941** (= BG) |
| **Guide BG** | `public/images/backgrounds/fire-truck-bg.png` |
| **Camera** | ¾ driver-side; ~1.2–1.5 m height; truck on apron / yellow bay lines |
| **Light** | Key from **right** (BG sun); shadow falls left/under chassis |
| **Ground line Y** | **772** (`y = round(0.82 × 941)`) |
| **Contact points** | Front tire `(560, 772)` · Mid tire `(980, 772)` · Rear tire `(1185, 772)` |
| **Body stack center X** | **802** (`round(0.48 × 1671)`) — chassis must straddle these X’s |
| **CLOSED** | Shutters closed; ladder stowed |
| **Second** | Left compartments open; hose / air tanks / tools / pump readable |
| **Layer order (bottom → top)** | `contact-shadow.png` → `body.png` → `shutter-doors.png` → `compartment-contents.png` |
| **Mechanisms** | **Shutters** — pivot: top of each bay opening (approx `(720, 410)`, `(900, 410)`, `(1080, 410)`); motion: `slide` **up** (−Y); range: **0 → −120 px** (CLOSED→OPEN). Contents: `swap-visibility` (hidden→shown), no pivot. |
| **Files** | `scene-art/fire-truck/contact-shadow.png`, `body.png`, `shutter-doors.png`, `compartment-contents.png` *(or* `closed-body.png` + `open-doors+contents.png` *with identical static pixels)* |
| **Forbidden** | `fire-truck-transparent` + `pierce-open` as a pair |

### 2. Airport Fire Truck — `airport-fire-truck`
| | |
|---|---|
| **Canvas** | **1672×941** |
| **Guide BG** | `…/airport-fire-truck-bg.png` |
| **Camera** | ¾ front-right on tarmac; six wheels visible |
| **Light** | Upper-right sun |
| **Ground line Y** | **790** (`round(0.84 × 941)`) |
| **Contact points** | Front `(980, 790)` · Mid `(720, 790)` · Rear `(480, 790)` · Far-side patches as needed on same Y |
| **Body center X** | **869** (`round(0.52 × 1672)`) |
| **CLOSED** | Roll-ups closed; turrets stowed |
| **Second** | Side bays open (hose / air / rescue gear) |
| **Layer order** | `contact-shadow` → `body` → `bay-doors` → `bay-contents` |
| **Mechanisms** | **Bay doors** — pivot: upper track of each bay; `slide` −Y; range **0 → −110 px**. Contents: `swap-visibility`. |
| **Files** | `scene-art/airport-fire-truck/contact-shadow.png`, `body.png`, `bay-doors.png`, `bay-contents.png` |

### 3. Police Car — `police-car`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/police-car-bg.png` |
| **Camera** | ¾ front; lightbar & push bumper visible |
| **Light** | Street sun from above/front |
| **Ground line Y** | **720** (`round(0.80 × 900)`) |
| **Contact points** | Front `(980, 720)` · Rear `(620, 720)` |
| **Body center X** | **800** |
| **CLOSED** | All doors shut |
| **Second** | Driver and/or rear door open on **same** side |
| **Layer order** | `contact-shadow` → `body` → `door-open` |
| **Mechanisms** | **Front door** — pivot hinge `(905, 480)`; `rotate` around Z; range **0° → −65°** (opens toward camera/out). Optional rear door: hinge `(700, 500)`; **0° → −60°**. |
| **Files** | `scene-art/police-car/contact-shadow.png`, `body.png`, `door-open.png` |
| **Forbidden** | Backup front/back stills as OPEN |

### 4. Excavator — `excavator`
| | |
|---|---|
| **Canvas** | **1672×941** |
| **Guide BG** | `…/excavator-bg.png` |
| **Camera** | Side/¾ matching dirt-yard eye height; tracks & boom/bucket uncropped |
| **Light** | Upper-right; short shadows toward lower-left (match BG cones) |
| **Ground line Y** | **734** (`round(0.78 × 941)`) |
| **Contact points** | Track front `(920, 734)` · Track mid `(1100, 734)` · Track rear `(1280, 734)` |
| **Body center X** | **803** (`round(0.48 × 1672)`) |
| **CLOSED** | Idle boom; bucket near ground |
| **Second** | Dig pose (boom/stick/bucket) |
| **Layer order** | `contact-shadow` → `body-tracks` → `boom` → `stick` → `bucket` |
| **Mechanisms** | **Boom** pivot `(1180, 420)` rotate Z **0° → −25°**. **Stick** pivot on boom tip (CLOSED tip ≈ `(780, 380)`) **0° → +35°**. **Bucket** pivot on stick tip **0° → +40°**. Ranges relative to CLOSED pose; final OPEN must keep tracks’ contact points fixed. |
| **Files** | `scene-art/excavator/contact-shadow.png`, `body-tracks.png`, `boom.png`, `stick.png`, `bucket.png` |

### 5. Mobile Crane — `mobile-crane`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/mobile-crane-bg.png` |
| **Camera** | ¾; driver cab, crane cab, full boom, near-side axles |
| **Light** | Match BG |
| **Ground line Y** | **720** |
| **Contact points (tires)** | Axle1 `(980, 720)` · Axle2 `(860, 720)` · Axle3 `(740, 720)` · Axle4 `(620, 720)` |
| **Body center X** | **800** |
| **CLOSED** | Boom retracted; outriggers in |
| **Second** | Outriggers planted and/or side lockers open |
| **Layer order** | `contact-shadow` → `body` → `outriggers` → `locker-doors` → `locker-contents` |
| **Mechanisms** | **Outriggers** — vertical `slide` +Y for pads; CLOSED pad Y above ground; OPEN pad contact e.g. front pad `(520, 720)`, rear `(1100, 720)` (pads become extra contact points when OPEN). Travel **≈ 0 → +80 px**. **Lockers** — `slide` −Y **0 → −90 px** or hinge rotate; contents `swap-visibility`. Tire contacts stay fixed. |
| **Files** | `scene-art/mobile-crane/contact-shadow.png`, `body.png`, `outriggers.png`, `locker-doors.png`, `locker-contents.png` |
| **Forbidden** | Side-profile Backup open vs ¾ closed |

### 6. Tractor — `tractor`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/tractor-bg.png` |
| **Camera** | ¾; large rear tires uncropped |
| **Light** | Match BG |
| **Ground line Y** | **729** (`round(0.81 × 900)`) |
| **Contact points** | Front `(980, 729)` · Rear `(560, 729)` · Far front if visible on same Y |
| **Body center X** | **800** |
| **CLOSED** | Hitch idle (MVP may ship CLOSED-only) |
| **Second (optional)** | Front hitch implement — same camera |
| **Layer order** | `contact-shadow` → `body` → `hitch-implement` |
| **Mechanisms** | **Hitch** — pivot `(1050, 620)`; `rotate` Z **0° → −20°** (implement down) or `swap-visibility` for attached tool. Wheel contacts fixed. |
| **Files** | `scene-art/tractor/contact-shadow.png`, `body.png`, optional `hitch-implement.png` |

### 7. Dump Truck — `dump-truck`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/dump-truck-bg.png` |
| **Camera** | ¾; all six wheels visible |
| **Light** | Match BG |
| **Ground line Y** | **720** |
| **Contact points** | Front `(1000, 720)` · Mid `(780, 720)` · Rear `(560, 720)` |
| **Body center X** | **800** |
| **CLOSED** | Dump body down |
| **Second** | Dump body raised (hydraulics visible) |
| **Layer order** | `contact-shadow` → `chassis-cab` → `dump-body` |
| **Mechanisms** | **Dump body** — pivot at rear hinge `(520, 560)`; `rotate` Z **0° → −45°** (bed rises). Chassis + all wheel contacts **fixed**. |
| **Files** | `scene-art/dump-truck/contact-shadow.png`, `chassis-cab.png`, `dump-body.png` |
| **Forbidden** | Backup engine-cutaway as “body up” |

### 8. Mars Rover — `mars-rover`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/mars-rover-bg.png` |
| **Camera** | ¾; mast, arm, six wheels uncropped; clear foreground soil |
| **Light** | Soft upper-right; soft dust shadow |
| **Ground line Y** | **684** (`round(0.76 × 900)`) |
| **Contact points** | Wheel F `(980, 684)` · M `(820, 684)` · R `(660, 684)` (+ far-side on same Y if visible) |
| **Body center X** | **800** |
| **CLOSED** | Nominal explore pose |
| **Second** | Tech bay open and/or arm to sample |
| **Layer order** | `contact-shadow` → `body-wheels` → `bay-door` → `arm` |
| **Mechanisms** | **Bay door** — hinge `(780, 500)`; `rotate` **0° → +75°** or `slide`. **Arm** — shoulder pivot `(900, 480)`; compound `rotate` toward ground **0° → +30°** shoulder / wrist as needed. Wheel contacts fixed. |
| **Files** | `scene-art/mars-rover/contact-shadow.png`, `body-wheels.png`, `bay-door.png`, `arm.png` |

### 9. Ambulance — `ambulance`
| | |
|---|---|
| **Canvas** | **1600×900** |
| **Guide BG** | `…/ambulance-bg.png` |
| **Camera** | ¾ Type I; cab distinct from module |
| **Light** | Match BG |
| **Ground line Y** | **720** |
| **Contact points** | Front `(1000, 720)` · Rear `(640, 720)` · Far front if visible |
| **Body center X** | **800** |
| **CLOSED** | Cab + module doors shut |
| **Second** | Module side or rear door open (patient gear readable) |
| **Layer order** | `contact-shadow` → `body` → `module-door` |
| **Mechanisms** | **Module door** — hinge `(720, 470)`; `rotate` Z **0° → −70°** (opens out). Optional contents: `swap-visibility` behind door. Wheel contacts fixed. |
| **Files** | `scene-art/ambulance/contact-shadow.png`, `body.png`, `module-door.png` |
| **Forbidden** | Backup front/back angles as OPEN |

---

## D. Delivery checklist (artist → project)

For each vehicle:

- [ ] Guide BG unchanged; layers canvas = BG W×H  
- [ ] `contact-shadow.png` separate RGBA  
- [ ] Contact points hit listed `(x, y)` on ground line  
- [ ] Mechanism pivots / range / z-order documented  
- [ ] Static pixels match CLOSED ↔ second after registration  
- [ ] No crop of critical parts on three viewports  
- [ ] No old cutout as final  
- [ ] Package path: `preview/vehicle-explore/scene-art/<id>/`  

**Minimum:** 9× (`contact-shadow` + `body`) + mechanism/second layers as above.  
**Wire into `fleet.js` only after user visual PASS.**

*Not APPROVED. No art generated in this edit.*

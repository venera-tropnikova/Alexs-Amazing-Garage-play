# Dump Truck — layer analysis (preview)

Rollback: `preview/vehicle-explore/rollback/dump-truck-explore_2026-11-04_0619.zip`  
Source PNGs were **not** modified.

## Materials checked

| Asset | Size | Role |
|---|---|---|
| `scene-art/dump-truck/closed-composite.png` | 1672×941 RGB | Beautiful CLOSED etalon (BG + truck baked) |
| `public/images/backgrounds/dump-truck-bg.png` | 1600×900 RGB | Separate thematic BG (different canvas than composite) |
| `public/images/truck-36822-art/Volvo A40G.png` | 1671×910 RGBA | CLOSED cutout, bed **down** |
| `Backup/dump-truck-open.png` | 913×459 RGBA | Different art (operator / hood cutaway); bed still **down** — not a raised-bed plate |

## Can we extract playable layers?

| Layer needed | Available? | Notes |
|---|---|---|
| Clean BG | Partially | `dump-truck-bg.png` exists, but **≠** composite canvas (1600×900 vs 1672×941) and lighting/framing differ from the etalon scene |
| Chassis + cab (wheels fixed) | **No** | Bed is painted into the cutout; cropping the bed leaves a **hole** where frame/hydraulics should remain (see `layer-separation-attempt.png`) |
| Dump body alone | Incomplete | Side silhouette can be roughly cropped; underside / hinge / occlusion for raise are missing |
| Contact shadow | **No separate file** | Baked into composite / under tires on cutout |
| Raised-bed state | **No** | `dump-truck-open.png` is **not** bed-up and not same camera as CLOSED |

## Raise Bed / Lower Bed verdict

**Not implemented.** Rotating the whole truck or the unsuitable open PNG would be a fake.  
Credible Raise Bed needs same-camera layers:

1. `chassis-cab.png` — tractor + rear frame + wheels, **without** dump body (area under bed painted)
2. `dump-body.png` — bed only, pivot at rear hinge
3. Optional `hydraulics.png` / raised pose plate
4. Optional `contact-shadow.png`
5. Target look: match `closed-composite.png`

## What this preview does instead

Working **CLOSED** Explore on the etalon composite: hotspots on parts, EN card, Replay, browser TTS, compact UI. No Raise/Lower control.

# Hotspot calibration report (preview only)

Date: 2026-11-04  
Scope: `preview/vehicle-explore/` only  
Rollback: `preview/vehicle-explore/rollback/hotspots-fix_2026-11-04_0657.zip`  
Status: **not APPROVED** (technical check ≠ visual PASS)

## Method

1. Grid overlays on every Outside closed-composite and every alt plate.
2. Dot verification overlays against current images (not old PNG coords).
3. Points that could not be placed on the matching detail → omitted from that view + listed as NEEDS_REVIEW.
4. View switch shows only hotspots defined for the active plate.

## Checked points by vehicle

### Fire Truck
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, front/rear door, pump, 3 compartments/hatch, ladder, 3 wheels | OK on composite |
| Inside (pierce-open) | same set on open equipment plate | Compartment points sit on open bay contents |

### Airport Fire Truck
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, door, compartment, roof/bumper turrets, 3 near wheels | Far wheels omitted |
| Inside (open bays) | cab, door, compartment, roof turret, 3 wheels | Bumper turret omitted |

### Police Car
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, front/rear door, light bar, push bumper, 2 wheels | OK |
| Front | cab, front door, light bar, push bumper, front wheel | Rear door/wheel omitted |
| Back | **none** | Cargo hatch equipment ≠ registry exterior parts |

### Excavator
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, door, boom, stick, bucket, track | Stick on stick arm; track on pads |
| More | same set | Door on cab frame (not joystick) |

### Mobile Crane
| View | Placed | Notes |
|------|--------|-------|
| Outside | driver/crane cabs+doors, boom, hook, 4 wheels | OK |
| Inside (open lockers) | same set | OK |

### Tractor
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, door, ladder, hitch, front/rear wheel | Far front omitted |
| Trailer | same except far front | OK on tractor+trailer plate |

### Dump Truck
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, door, body, 3 near wheels | Far front omitted; no Raise Bed |
| Inside (engine open) | same near set | Separate detail plate, not Raise |

### Mars Rover
| View | Placed | Notes |
|------|--------|-------|
| Outside | body, mast, arm, turret, rocker, 3 near wheels | Far wheels omitted |
| Inside (panel open) | body, mast, arm, turret, rocker, front/mid + far mid/rear | Near rear wheel omitted |

### Ambulance
| View | Placed | Notes |
|------|--------|-------|
| Outside | cab, door, compartment, compartment door, lights, 2 near wheels | Far front omitted |
| Front | cab, door, compartment (star), lights, front wheel | Compartment door / rear / far-front omitted |
| Back | patient compartment + open rear door | Cab/door/lights/wheels omitted |

Dock buttons now follow the active view’s hotspots (same filter as scene hits).

## NEEDS_REVIEW (omitted — not placed approximately)

- **airport-fire-truck Outside:** `pan-wheel-far-front`, `pan-wheel-far-middle`
- **airport-fire-truck Inside:** `pan-bumper-turret`, far wheels
- **police-car Front:** `ford-door-rear`, `ford-wheel-rear`
- **police-car Back:** all registry parts (`ford-cab`, doors, light bar, push bumper, wheels) — plate is open cargo equipment
- **tractor Outside/Trailer:** `jd-wheel-far-front`
- **dump-truck Outside/Inside:** `vol-wheel-far-front`
- **mars-rover Outside:** `pers-wheel-far-middle`, `pers-wheel-far-rear`
- **mars-rover Inside:** `pers-wheel-rear` (hub obscured)
- **ambulance Outside:** `amb-wheel-far-front`
- **ambulance Front:** `amb-compartment-door`, `amb-wheel-rear`, `amb-wheel-far-front` (edge of plate)
- **ambulance Back:** `amb-cab`, `amb-door`, `amb-lights`, wheels

## Preserved

- 9 CLOSED composites, alt equipment plates, EN cards, Replay, browser TTS
- Compact multi-view UI; no fake Open/Raise animation
- Garage, live game, source art, GitHub Pages untouched

## Screenshots

Under `preview/vehicle-explore/shots/`: `*-outside-{1280x800,1024x768,768x1024}.png`, `*-card-1280x800.png`, alt view + card shots.  
Calibration helpers: `shots/hotspot-grids/`, `shots/hotspot-verify/`.

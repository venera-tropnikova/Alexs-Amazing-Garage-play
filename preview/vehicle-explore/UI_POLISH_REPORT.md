# Explore kids-game UI report (preview)

Date: 2026-11-04  
Rollback: `preview/vehicle-explore/rollback/ui-reject-redo_2026-11-04_1459.zip`  
Changed: `explore-shell.js`, `explore-shell.css` only  
**APPROVED not set.** Auto `CHECK.json` ≠ visual acceptance.

## Redesign (not cosmetic CSS only)

- Sealed game board + large vehicle title
- Large mode buttons with icons; **Look Inside** larger; soft invite pulse **2–3 times** on first show only
- Selected mode keeps clear color (sun / mint / ocean)
- Tiny visual markers + yellow tip on exact target + thin stem; tap pad ≥ 44px; brief pin pop on select
- One large **Parts** control → vertical game list (not a long chip row)
- Dark compact **lesson panel** (yellow title, EN text, Hear it, ×) in bottom chrome — does not cover the plate
- Escape closes lesson / Parts; keyboard-focusable controls; `prefers-reduced-motion` disables pulses

## Unchanged

Images, fleet hotspot coordinates, equipment/registry EN copy, TTS wiring, Garage / live game / Pages / source art.

## Checks

| Item | Result |
|------|--------|
| 9 vehicles × views | technical OK (`CHECK.json`) |
| 1280×800, 1024×768, 768×1024 | OK |
| Mouse / touch targets / keyboard | buttons + Escape |
| Fake Open/Raise | none |
| visualPass | false |

## Screenshots to review

- `shots/*-outside-1280x800.png`
- `shots/*-look-inside-*-card-1280x800.png` / `*-look-inside-active-1280x800.png`
- `shots/*-parts-open-1280x800.png`
- portrait: `shots/*-768x1024.png`

import json
from pathlib import Path

regs = {
  "fire": "content/parts.registry.json",
  "panther": "content/panther.registry.json",
  "police": "content/ford-police.registry.json",
  "cat": "content/caterpillar-320.registry.json",
  "ltm": "content/liebherr-ltm-1090-4-2.registry.json",
  "jd": "content/john-deere-8r-410.registry.json",
  "vol": "content/volvo-a40g.registry.json",
  "pers": "content/perseverance.registry.json",
  "amb": "content/ford-f450.registry.json",
}
for k, p in regs.items():
  data = json.loads(Path(p).read_text(encoding="utf-8"))
  parts = data.get("parts", data)
  print(f"=== {k} ===")
  if isinstance(parts, list):
    for part in parts:
      if isinstance(part, dict):
        name = part.get("name") or part.get("en") or part.get("title")
        print(f"  {part.get('id')}: {name}")
  elif isinstance(parts, dict):
    for pid, part in parts.items():
      if isinstance(part, dict):
        name = part.get("name") or part.get("en") or part.get("title")
        print(f"  {pid}: {name}")
      else:
        print(f"  {pid}: {part}")

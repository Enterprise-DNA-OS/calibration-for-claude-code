---
description: "Record actual production use, including historical use requiring investigation."
---

# record-use

Record actual production use, including historical use requiring investigation.

Run `node scripts/calibration.mjs record-use <instrument> --batch=<batch> --date=<YYYY-MM-DD> --quantity=<positive-integer> --evidence="<production record>" --actor="<operator>"`. Use `--json` when inspecting the full result. Resolve names from the register first. Replace every angle-bracket value with a verified fact. Never run placeholders.

Report the records, owner, due date and evidence gaps. A finding is not a certification. For a write, read the record first and use the operator’s declared name. Nothing sends or publishes.

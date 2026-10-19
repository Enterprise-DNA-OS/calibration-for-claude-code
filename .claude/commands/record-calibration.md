---
description: "Record a calibration already performed by a competent person. Failure opens an investigation."
---

# record-calibration

Record a calibration already performed by a competent person. Failure opens an investigation.

Run `node scripts/calibration.mjs record-calibration <instrument> --date=<YYYY-MM-DD> --found=pass --left=pass --standard=<standard> --procedure="<revision>" --certificate="<reference>" --uncertainty="<budget reference>" --due=<YYYY-MM-DD> --actor="<technician>"`. Use `--json` when inspecting the full result. Resolve names from the register first. Replace every angle-bracket value with a verified fact. Never run placeholders.

Report the records, owner, due date and evidence gaps. A finding is not a certification. For a write, read the record first and use the operator’s declared name. Nothing sends or publishes.

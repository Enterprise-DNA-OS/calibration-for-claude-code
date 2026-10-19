---
description: "Record the impact assessment and disposition already approved by a person."
---

# close-investigation

Record the impact assessment and disposition already approved by a person.

Run `node scripts/calibration.mjs close-investigation <investigation-id> --impact="<scope and findings>" --disposition="<action taken>" --evidence="<review reference>" --actor="<reviewer>"`. Use `--json` when inspecting the full result. Resolve names from the register first. Replace every angle-bracket value with a verified fact; never run placeholders.

Report the records, owner, due date and evidence gaps. A finding is not a certification. For a write, read the record first and use the operator’s declared name. Nothing sends or publishes.

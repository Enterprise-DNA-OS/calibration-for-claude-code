---
description: "Read docs/replace-gagelist.md, map the export, preview, then reconcile it."
---

# import

Read docs/replace-gagelist.md, map the export, preview, then reconcile it.

Run `node scripts/calibration.mjs import gagelist <export.csv> --site=<site> --map=examples/column-map.json --actor="<operator>" --dry-run`. Use `--json` when inspecting the full result. Resolve names from the register first. Replace every angle-bracket value with a verified fact. Never run placeholders.

Report the records, owner, due date and evidence gaps. A finding is not a certification. For a write, read the record first and use the operator’s declared name. Nothing sends or publishes.

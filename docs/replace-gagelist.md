# Replace the GageList records desk

1. In GageList, open Reports & Data, choose Export Data, then export all gage records. Export each location account separately. The [vendor export guide](https://gagelist.com/knowledge-base/data-export/) documents this route.
2. Save the gage worksheet as UTF-8 CSV if it downloads as a spreadsheet. Keep the untouched original. Localised labels and custom fields vary; the [vendor import guide](https://gagelist.com/knowledge-base/data-import/) explicitly notes variable headings. Match your headings once in a copy of examples/column-map.json.
3. Create the destination site, migrate an empty database and run the import with --dry-run. Fix every rejected date, duplicate or missing control number before importing. Dates must be YYYY-MM-DD. Convert only known day intervals to Interval Days; never treat a number of months as days.
4. Run the same command without --dry-run. Compare the tool count, control numbers, serials and recall dates with the original export. Blank dates stay unknown. Every tool starts quarantined.
5. Retain calibration certificates, measurement points, historical calibration records, attachments, signatures, studies, notification rules and custody history separately. The gage-register importer does not migrate those. Have a competent person reconcile the current certificate, record its calibration evidence, review it and release the tool before checkout. A full history migration is separate work.

```bash
npm run migrate
node scripts/calibration.mjs add-site --code=AKL --name="Auckland" --actor="Operator"
node scripts/calibration.mjs import gagelist examples/gagelist.csv --site=AKL --map=examples/column-map.json --actor="Operator" --dry-run
node scripts/calibration.mjs import gagelist examples/gagelist.csv --site=AKL --map=examples/column-map.json --actor="Operator"
```

| Destination | Default labels accepted | Treatment |
|---|---|---|
| Control number | Control Number, Gage ID, Gage Number | Required, unique within the site |
| Description | Description, Gage Description, Name | Required |
| Serial | Serial Number, Serial | Blank retained as unknown |
| Owner | Owner, Responsible Person, Assigned To | Blank becomes Unassigned |
| Interval days | Interval Days | Positive whole days only, optional |
| Next due date | Next Calibration Date, Next Due Date, Calibration Due Date | Optional, ISO date only |

The bundled example is synthetic, not a verified untouched vendor export. These are supported aliases; use an explicit map when your labels differ. All source columns are retained with the imported record, including unmapped fields. They are evidence to review, not automatically active custom fields.

Identical imports skip existing rows. A different record with the same site/control number fails the entire import. No partial import survives a failure, and no existing tool is silently overwritten. Tools at different sites can have the same control number; use the full identifier when selecting one.

One import command brings the prepared gage register over. Certificate review, history mapping, access controls and acceptance are separate work. Keep GageList available until the owner has reconciled the records and approved the replacement’s scope. Enterprise DNA handles those steps as part of a custom installation.

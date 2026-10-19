# Calibration CLI

Run `npm run migrate` before using an empty database. Run `npm run seed` only for fictional demo data. Flags use `--key=value`; quote values with spaces. Every result supports `--json`. Writes require `--actor`; `--dry-run` rolls back a write transaction.

## sites

Compare each site’s available, quarantined and overdue instruments.

```bash
node scripts/calibration.mjs sites
```

## instruments

Read the complete instrument register and eligibility.

```bash
node scripts/calibration.mjs instruments
```

## instrument

Read one instrument before discussing it.

```bash
node scripts/calibration.mjs instrument <unique-code-or-id>
```

## history

Read calibration, custody, production-use and note history.

```bash
node scripts/calibration.mjs history <unique-code-or-id>
```

## recall

Prepare the 30-day calibration recall list, including missing dates.

```bash
node scripts/calibration.mjs recall
```

## attention

Find recalls, late returns, quarantine and open investigations.

```bash
node scripts/calibration.mjs attention
```

## standards

Review reference validity and certificate references.

```bash
node scripts/calibration.mjs standards
```

## calibrations

Read recorded calibration outcomes and review status.

```bash
node scripts/calibration.mjs calibrations
```

## evidence

Find missing certificates, uncertainty references and evidence reviews.

```bash
node scripts/calibration.mjs evidence
```

## custody

Review open checkouts, late returns and return condition.

```bash
node scripts/calibration.mjs custody
```

## investigations

Review open out-of-tolerance investigations and their owners.

```bash
node scripts/calibration.mjs investigations
```

## impact

List known batches since the last verified pass, including use after failure.

```bash
node scripts/calibration.mjs impact
```

## usage

Review the production batches measured with each tool.

```bash
node scripts/calibration.mjs usage
```

## compliance

Run the documented record checks. Explain findings using docs/compliance.md.

```bash
node scripts/calibration.mjs compliance
```

## insights

Answer ten combined questions using current records.

```bash
node scripts/calibration.mjs insights
```

## add-site

Add an operating site.

```bash
node scripts/calibration.mjs add-site --code=WLG --name="Wellington" --actor="<operator>"
```

## add

Add a quarantined instrument with its owner and site.

```bash
node scripts/calibration.mjs add --site=WLG --code=GA-100 --name="Workshop gauge" --owner="<owner>" --interval=180 --actor="<operator>"
```

## add-standard

Record the external reference-standard certificate details.

```bash
node scripts/calibration.mjs add-standard --code=REF-1 --name="Reference standard" --from=2026-01-01 --until=2027-01-01 --certificate="<evidence reference>" --uncertainty="<budget reference>" --actor="<operator>"
```

## record-calibration

Record a calibration already performed by a competent person. Failure opens an investigation.

```bash
node scripts/calibration.mjs record-calibration <instrument> --date=<YYYY-MM-DD> --found=pass --left=pass --standard=<standard> --procedure="<revision>" --certificate="<reference>" --uncertainty="<budget reference>" --due=<YYYY-MM-DD> --actor="<technician>"
```

## verify

Record an independent person’s evidence review. Never infer it from a pass label.

```bash
node scripts/calibration.mjs verify <calibration-id> --evidence="<review reference>" --actor="<reviewer>"
```

## release

Record the owner’s release decision after a verified pass and closed impact reviews.

```bash
node scripts/calibration.mjs release <instrument> --reason="<release basis>" --actor="<authorised operator>"
```

## quarantine

Prevent further checkout while a tool is reviewed.

```bash
node scripts/calibration.mjs quarantine <instrument> --reason="<reason>" --actor="<operator>"
```

## retire

Retain the history while taking a returned tool out of service.

```bash
node scripts/calibration.mjs retire <instrument> --reason="<reason>" --actor="<operator>"
```

## close-investigation

Record the impact assessment and disposition already approved by a person.

```bash
node scripts/calibration.mjs close-investigation <investigation-id> --impact="<scope and findings>" --disposition="<action taken>" --evidence="<review reference>" --actor="<reviewer>"
```

## checkout

Record custody only when the tool is eligible through the planned return date.

```bash
node scripts/calibration.mjs checkout <instrument> --holder="<holder>" --due=<YYYY-MM-DD> --actor="<operator>"
```

## return

Record a return. A damaged return quarantines the instrument.

```bash
node scripts/calibration.mjs return <instrument> --condition=good --actor="<operator>"
```

## record-use

Record actual production use, including historical use requiring investigation.

```bash
node scripts/calibration.mjs record-use <instrument> --batch=<batch> --date=<YYYY-MM-DD> --quantity=<positive-integer> --evidence="<production record>" --actor="<operator>"
```

## log

Append a note without rewriting the original record.

```bash
node scripts/calibration.mjs log <instrument> --note="<observed fact>" --actor="<operator>"
```

## import

Read docs/replace-gagelist.md, map the export, preview, then reconcile it.

```bash
node scripts/calibration.mjs import gagelist <export.csv> --site=<site> --map=examples/column-map.json --actor="<operator>" --dry-run
```

## export

Write a private archive of all records and the change log to a new file.

```bash
node scripts/calibration.mjs export --out=<new-private-file.json>
```

## draft-recall

Create a local recall draft. Review it; never send it.

```bash
node scripts/calibration.mjs draft-recall
```

## draft-investigation

Create a local impact-review draft from known production use.

```bash
node scripts/calibration.mjs draft-investigation
```

## weekly-review

Read attention, recall and evidence, then write the Monday review draft.

```bash
node scripts/calibration.mjs weekly-review
```

## Details

Names and codes match case-insensitively. Exact matches win; a partial name or ID must be unique. An ambiguous match prints candidates and exits 1. Use a UUID when two sites use the same control number.

record-calibration accepts found/left values pass, fail or unknown. It records declared outcomes, not calculated tolerance decisions. The next due date must follow the calibration date. Additional options are --owner and --review-due for the resulting investigation. It cannot overwrite a prior calibration or insert a calibration before the latest one; historical certificate migration requires a reviewed extension.

verify requires certificate, procedure revision, uncertainty evidence, a reference valid on the calibration date, known results and a next due date. The reviewer’s declared name must differ from the technician’s. Review does not release the tool. A reviewed failed result remains a failure.

return accepts good or damaged. retire requires no open checkout. record-use records actual history even if the instrument is now quarantined, so late evidence is not lost. It never authorises use. The impact report includes every known use since the prior verified pass, including use after the failure. It does not prove that unrecorded batches were unaffected.

export without --out prints the complete JSON archive. With --out it creates a new file and refuses to overwrite an existing file. Archive restoration is not a CLI command; keep a database backup as well. The archive includes potentially sensitive notes and owner labels.

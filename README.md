# Calibration for Claude Code

Know which tool is overdue, who still has it and which production batches need review after a failed calibration. Your gage register, certificate evidence, recall dates and custody history live in a database you own. MIT licensed. Built by Enterprise DNA.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, try the demo and import a prepared gage export. | Your quality rules, fields, reports and connections. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=gagelist&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=gagelist&utm_medium=readme) |

GageList MAX lists US$399 per month billed annually, US$4,788 a year per location account, with unlimited users. Multi-site accounts add up; this comparison targets that bill. [Vendor pricing](https://gagelist.com/pricing/), checked 19 October 2026. No verified customer invoice is claimed. This base is a calibration records desk; [scope](docs/why-no-front-end.md) explains the boundary.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/calibration-for-claude-code.git
cd calibration-for-claude-code
npm install
npm test
npm run demo
```

Use Node 22. Tests and demo use temporary fictional databases, ignore DATABASE_URL and remove their temporary files afterward. For persistent fictional data, run npm run migrate and npm run seed. For real work, migrate without seeding. Leave DATABASE_URL unset for local PGlite, or set it to a private Postgres database. Remote TLS certificates are verified. Keep the database, backups, evidence and generated reports private.

Open the folder in Claude Code, Codex, OpenCode or Cursor and ask for /recall. Every agent uses the same commands. The code does not call a paid model service; your chosen agent has its own account requirements.

```bash
node scripts/calibration.mjs recall
node scripts/calibration.mjs impact --json
node scripts/calibration.mjs compliance
npm run view
npm run docs
```

Three local dashboards show recalls, evidence gaps and production impact. Three document types produce recall worksheets, calibration evidence summaries and impact-review worksheets. Change your name, colours and logo in brand.json. These documents are not calibration certificates.

## The weekly rituals

- /recall: plan tools due for calibration and identify missing dates.
- /custody: find tools still out and overdue returns.
- /evidence: find missing certificate, procedure and uncertainty references.
- /impact: review known production use after the previous verified pass.
- /weekly-review: prepare the Monday brief from attention, recalls and evidence.
- /compliance: run the limited record checks described in docs/compliance.md.

There are 37 workflow commands. [CLI reference](docs/cli.md) explains every operation. Human output and --json use the same records. Exact names match without case sensitivity. Partial names and IDs work only when unique; ambiguity lists candidates and fails.

## Bring your GageList register

Export all gage records through GageList’s Reports & Data menu. Save the gage worksheet as CSV if needed and map its localised headings once. Then import the prepared register in one command, with a dry run first:

```bash
node scripts/calibration.mjs import gagelist examples/gagelist.csv --site=AKL --map=examples/column-map.json --actor="Demo operator" --dry-run
```

AKL exists after seeding; create your own site for real imports. The [switching guide](docs/replace-gagelist.md) covers mapping, unknown dates and reconciliation. Imports are atomic, identical repeats are skipped and conflicting records are rejected. All source columns are retained. Imported tools start quarantined. Calibration history, signatures, studies, attachments and custody history require separate migration and review.

## Evidence before release

A calibration result is recorded from work a competent person performed. A failure opens an investigation and quarantines the tool. A separate reviewer checks the evidence. A release requires the latest reviewed passing result, a current due date and closed impact reviews. Checkout must finish within the tool’s recorded calibration validity. Damaged returns quarantine the tool.

The program checks records, not physical equipment or certificate contents. It does not calculate uncertainty, establish traceability, provide accreditation or authorise regulated product release. The owner chooses a suitable interval; no universal period is invented. Recorded names are audit labels, not authenticated identities. Shared use requires access and approval controls around the base.

## Ten questions answered from your records

/insights runs all ten today. These combine records for your own review; they are not claims that GageList cannot produce a custom report.

1. Which overdue tools are still checked out?
2. Which production batches used a tool since its last verified pass?
3. Which reference standards were outside validity when used?
4. Which owners have both overdue recalls and unresolved failures?
5. Which sites have the most unavailable instruments?
6. Which calibration records lack uncertainty or certificate evidence?
7. Which instruments have unknown next recall dates?
8. Which batches were recorded after the failed calibration?
9. Which instruments failed more than once?
10. Which upcoming recalls also have incomplete calibration evidence?

## Your first hour: ten things to ask for

1. Show the overdue gages.
2. Find tools with no next calibration date.
3. Tell me who still holds the digital caliper.
4. Show the batches linked to the failed torque wrench.
5. Find calibrations using an expired reference.
6. Draft the next recall list.
7. Show the evidence missing from the pressure gauge.
8. Put our name on the impact-review worksheet.
9. Add our department field through /customise.
10. Add a site-specific recall report through /new-view.

## Verification

npm test checks migrations, repeatable seed data, reads and mutations, recall and release rules, failed-calibration investigations, custody, import repeats and rollback, unknown values, evidence checks, restricted-role access, drafts, archives and escaped HTML output. The GitHub Actions matrix runs on Windows and Linux. Local checks use Linux and PGlite; no live Postgres database is needed.

Read [operating rules](CLAUDE.md), [compliance scope](docs/compliance.md), [selection evidence](docs/research.md) and [screen-free scope](docs/why-no-front-end.md).

# Calibration for Claude Code

Run a manufacturer’s calibration records desk. Use one private database per business and one trusted operator. All agent runtimes follow these instructions and the same .claude/commands files.

## Rules

- Read the CLI result before answering. List ambiguous matches and ask; never choose the first.
- Record work performed by competent people. Never invent measurements, certificates, uncertainty budgets or approvals. This software neither calibrates nor certifies an instrument.
- Every write names --actor. That is a declared label, not authenticated identity or a digital signature. Shared use requires external access controls and verified approvals.
- New and imported tools start quarantined. Calibration recording quarantines a tool; an as-found or as-left failure opens an investigation. Release requires a reviewed pass and closed impact reviews.
- Never silently treat unknown dates or results as current or passing. Use YYYY-MM-DD; all dates are UTC calendar dates. Interval days are descriptive; the competent reviewer chooses the next due date.
- Never send, pay, publish or delete. Drafts remain local. Retire records to retain their history. Never use this base for regulated product release or accredited certificate issuance.
- Back up before schema changes. Use additive migrations, run npm test, and inspect changed reports. Keep real data, evidence and credentials out of Git.
- The database owner can bypass application controls. Protect that credential. Row security and revoked public privileges restrict unrelated database roles; this is not a tenant portal.

## Routing

- `add`: `.claude/commands/add.md`.
- `add-site`: `.claude/commands/add-site.md`.
- `add-standard`: `.claude/commands/add-standard.md`.
- `attention`: `.claude/commands/attention.md`.
- `calibrations`: `.claude/commands/calibrations.md`.
- `checkout`: `.claude/commands/checkout.md`.
- `close-investigation`: `.claude/commands/close-investigation.md`.
- `compliance`: `.claude/commands/compliance.md`.
- `custody`: `.claude/commands/custody.md`.
- `customise`: `.claude/commands/customise.md`.
- `documents`: `.claude/commands/documents.md`.
- `draft-investigation`: `.claude/commands/draft-investigation.md`.
- `draft-recall`: `.claude/commands/draft-recall.md`.
- `evidence`: `.claude/commands/evidence.md`.
- `export`: `.claude/commands/export.md`.
- `history`: `.claude/commands/history.md`.
- `impact`: `.claude/commands/impact.md`.
- `import`: `.claude/commands/import.md`.
- `insights`: `.claude/commands/insights.md`.
- `instrument`: `.claude/commands/instrument.md`.
- `instruments`: `.claude/commands/instruments.md`.
- `investigations`: `.claude/commands/investigations.md`.
- `log`: `.claude/commands/log.md`.
- `new-view`: `.claude/commands/new-view.md`.
- `quarantine`: `.claude/commands/quarantine.md`.
- `recall`: `.claude/commands/recall.md`.
- `record-calibration`: `.claude/commands/record-calibration.md`.
- `record-use`: `.claude/commands/record-use.md`.
- `release`: `.claude/commands/release.md`.
- `retire`: `.claude/commands/retire.md`.
- `return`: `.claude/commands/return.md`.
- `sites`: `.claude/commands/sites.md`.
- `standards`: `.claude/commands/standards.md`.
- `usage`: `.claude/commands/usage.md`.
- `verify`: `.claude/commands/verify.md`.
- `view`: `.claude/commands/view.md`.
- `weekly-review`: `.claude/commands/weekly-review.md`.

## Files

scripts/calibration.mjs is the one CLI. scripts/lib/domain.mjs owns its rules. supabase/migrations contains portable Postgres migrations. DATABASE_URL chooses private Postgres; leaving it unset uses PGlite. brand.json controls local reports. docs/compliance.md defines the limited checks and their sources. There is no browser API.

Installed and operated through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=gagelist&utm_medium=readme

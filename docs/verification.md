# Verification

19 October 2026, Node 22 on Linux, embedded PGlite.

- npm install: complete, dependency audit reported no vulnerabilities.
- npm test: PASS, 86 checks. Covers migration repeatability, seed repeatability, all business operations, recall and evidence rules, failed-calibration impact, custody, imports and rollback, unknown values, independent review labels, restricted database roles, append-only logs, read-only transactions, drafts, exports and HTML escaping.
- npm run demo: PASS, three actual runs saved in docs/demo-output.md and used on the comparison page.
- npm run view: three branded read-only reports generated.
- npm run docs: nine documents across three types generated from fictional records.
- Recall report and impact worksheet opened in Chromium and visually inspected.
- Brand lint and prose scans: no author placeholders, em dashes or banned voice patterns.

GitHub Actions is configured to run the same test and demo on Ubuntu and Windows with Node 22. Run 39189554535 was blocked before executing any steps: GitHub reported a failed account payment or exhausted spending limit. Linux passed locally; Windows has not been executed. No billing setting was changed. A live Postgres server was not used in local verification. Migration SQL uses standard Postgres functions and invoker views supported by PGlite; no extension or external service is required.

Only fictional records are committed. The public comparison says that certificate references are not certification and that the gage importer does not migrate complete calibration history.

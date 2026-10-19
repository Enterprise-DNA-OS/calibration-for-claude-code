# Calibration evidence controls

Checked 19 October 2026. This is a records desk for ordinary manufacturing quality reviews. It does not perform calibration, evaluate measurement uncertainty, validate a measurement method, issue accredited certificates or determine statutory compliance. It is not a substitute for an accredited laboratory or a qualified quality manager. Regulated manufacturing release is outside this base.

| Check | Implemented behaviour | Basis |
|---|---|---|
| Recorded recall date | Missing and overdue dates appear in recall and compliance. Checkout must end within the recorded validity. | Local control. NIST does not prescribe a universal recalibration interval. |
| Calibration evidence | A review requires references to the certificate, procedure revision and uncertainty budget. | NIST traceability guidance requires documented measurement chains and uncertainty; file references alone do not establish that chain. |
| Reference validity | A calibration cannot be verified with a reference outside its recorded start/end dates. | Local evidence check supporting the laboratory’s traceability process. |
| Failed result | An as-found or as-left failure quarantines the tool and opens an impact review. | Local quality policy, not a quoted statutory deadline. |
| Impact assessment | The review lists known production use since the previous verified pass, or all known use when none exists. Closing requires findings, disposition and evidence. | Local quality policy. Unknown production history remains an unresolved scope question. |
| Independent evidence review | The reviewer label differs from the technician label. | Local separation-of-duties policy; not identity verification or an electronic signature. |

Sources: [NIST recommended calibration interval](https://www.nist.gov/calibrations/recommended-calibration-interval), [NIST metrological traceability policy and FAQ](https://www.nist.gov/metrology/metrological-traceability).

A certificate reference is only a pointer. The operator must read and retain the external evidence, confirm the method, range, units, uncertainty, decision rule and competent laboratory, then record the review. The software does not open files or validate their contents. A record can pass these checks while the physical instrument remains unsuitable.

Set retention, recall intervals, investigation due dates and release authority in your own documented quality procedure. No universal retention term or recall interval is invented here. A current standard expiring later does not retroactively invalidate a calibration performed during its valid period.

Database controls revoke public access, enable row security and use invoker views. The owner account intentionally has full access. An append-only change log helps review application changes but is not tamper-proof against a database owner. Remote database TLS verifies certificates. Keep backups and test restores. Shared users need authenticated roles and scoped approval workflows before use.

-- Codes follow the same case-insensitive rule as CLI matching and imports.
create unique index instruments_site_code_ci on instruments(site_id,lower(code));
create unique index sites_code_ci on sites(lower(code));
create unique index standards_code_ci on reference_standards(lower(code));

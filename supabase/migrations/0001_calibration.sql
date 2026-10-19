create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create table sites (
 id uuid primary key default gen_random_uuid(), code text not null unique check (btrim(code)<>''), name text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table instruments (
 id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id),
 code text not null check (btrim(code)<>''), name text not null check(btrim(name)<>''), serial text,
 owner text not null check(btrim(owner)<>''), interval_days integer check(interval_days>0), next_due date,
 status text not null default 'quarantine' check(status in ('active','quarantine','retired')),
 source text, source_data jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(site_id,code)
);
create table reference_standards (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 valid_from date not null, valid_until date not null check(valid_until>=valid_from), certificate_ref text not null,
 uncertainty_note text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table calibrations (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references instruments(id),
 performed_on date not null, as_found text not null check(as_found in ('pass','fail','unknown')),
 as_left text not null check(as_left in ('pass','fail','unknown')),
 standard_id uuid references reference_standards(id), procedure_ref text, certificate_ref text, uncertainty_note text,
 next_due date check(next_due>performed_on), technician text not null,
 reviewer text, reviewed_on date, review_evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(instrument_id,performed_on), check((reviewer is null)=(reviewed_on is null)),
 check(reviewed_on is null or reviewed_on>=performed_on)
);
create table investigations (
 id uuid primary key default gen_random_uuid(), calibration_id uuid not null unique references calibrations(id),
 owner text not null, due_on date not null, status text not null default 'open' check(status in ('open','closed')),
 impact_review text, disposition text, evidence_ref text, closed_by text, closed_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'closed' or (nullif(btrim(impact_review),'') is not null and nullif(btrim(disposition),'') is not null and nullif(btrim(evidence_ref),'') is not null and closed_by is not null and closed_on is not null))
);
create table custody (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references instruments(id), holder text not null,
 checked_out date not null, due_back date not null check(due_back>=checked_out), returned_on date check(returned_on>=checked_out),
 return_condition text check(return_condition in ('good','damaged')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((returned_on is null)=(return_condition is null))
);
create unique index custody_one_open on custody(instrument_id) where returned_on is null;
create table usage_records (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references instruments(id),
 batch text not null, used_on date not null, quantity integer not null check(quantity>0), evidence_ref text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(instrument_id,batch,used_on)
);
create table notes (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references instruments(id), actor text not null, body text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_log (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, action text not null,
 actor text not null, detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function no_rewrite() returns trigger language plpgsql as $$ begin raise exception 'Append-only record'; end $$;
create trigger audit_immutable before update or delete on audit_log for each row execute function no_rewrite();
create index instruments_due_idx on instruments(next_due) where status<>'retired';
create index calibrations_instrument_idx on calibrations(instrument_id,performed_on desc);
create index calibrations_standard_idx on calibrations(standard_id);
create index investigations_due_idx on investigations(due_on) where status='open';
create index usage_instrument_idx on usage_records(instrument_id,used_on);
create index notes_instrument_idx on notes(instrument_id);
create index audit_record_idx on audit_log(record_id,created_at);
do $$ declare n text; begin
 foreach n in array array['sites','instruments','reference_standards','calibrations','investigations','custody','usage_records','notes'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',n);
 end loop;
 foreach n in array array['sites','instruments','reference_standards','calibrations','investigations','custody','usage_records','notes','audit_log'] loop
 execute format('alter table %I enable row level security',n);
 execute format('revoke all on %I from public',n);
 end loop;
end $$;
create view v_register with (security_invoker=true) as
 select i.*,s.code as site,c.id as calibration_id,c.performed_on,c.as_found,c.as_left,c.reviewer,c.certificate_ref,c.standard_id,
 case when i.status='retired' then 'retired' when i.status='quarantine' then 'quarantine'
 when i.next_due is null then 'missing due date' when i.next_due<current_date then 'overdue'
 when c.reviewer is null or c.as_left<>'pass' then 'unverified calibration'
 when exists(select 1 from investigations x join calibrations cx on cx.id=x.calibration_id where cx.instrument_id=i.id and x.status='open') then 'open investigation'
 else 'available' end as eligibility
 from instruments i join sites s on s.id=i.site_id
 left join lateral (select * from calibrations where instrument_id=i.id order by performed_on desc limit 1)c on true;
create view v_recall with (security_invoker=true) as
 select id,site,code,name,owner,status,next_due,next_due-current_date as days_to_due,eligibility from v_register
 where status<>'retired' and (next_due is null or next_due<=current_date+30);
create view v_evidence with (security_invoker=true) as
 select c.id,i.code,s.code as site,c.performed_on,c.as_found,c.as_left,c.technician,c.reviewer,
 concat_ws('; ',case when nullif(btrim(c.certificate_ref),'') is null then 'missing certificate reference' end,
 case when nullif(btrim(c.procedure_ref),'') is null then 'missing procedure revision' end,
 case when nullif(btrim(c.uncertainty_note),'') is null then 'missing uncertainty evidence' end,
 case when c.standard_id is null then 'missing reference standard' end,
 case when rs.id is not null and (c.performed_on<rs.valid_from or c.performed_on>rs.valid_until) then 'reference outside validity at calibration' end,
 case when c.next_due is null then 'missing next due date' end,
 case when c.as_found='unknown' or c.as_left='unknown' then 'unknown result' end,
 case when c.reviewer is null then 'awaiting evidence review' end) as gaps
 from calibrations c join instruments i on i.id=c.instrument_id join sites s on s.id=i.site_id left join reference_standards rs on rs.id=c.standard_id;
create view v_impact with (security_invoker=true) as
 select x.id as investigation_id,i.code,i.name,x.owner,x.status,x.due_on,c.performed_on as failure_on,
 p.last_pass,u.batch,u.used_on,u.quantity,u.evidence_ref,
 case when p.last_pass is null then 'no prior verified pass; inspect all known history' else 'since prior verified pass' end as scope
 from investigations x join calibrations c on c.id=x.calibration_id join instruments i on i.id=c.instrument_id
 left join lateral (select max(performed_on) as last_pass from calibrations where instrument_id=i.id and performed_on<c.performed_on and as_left='pass' and reviewer is not null)p on true
 left join usage_records u on u.instrument_id=i.id and (p.last_pass is null or u.used_on>=p.last_pass);
create view v_attention with (security_invoker=true) as
 select site,code,name,'recall'::text as reason,coalesce(next_due::text,'unknown') as due,owner from v_recall
 union all select s.code,i.code,i.name,'overdue return',l.due_back::text,l.holder from custody l join instruments i on i.id=l.instrument_id join sites s on s.id=i.site_id where l.returned_on is null and l.due_back<current_date
 union all select s.code,i.code,i.name,'open out-of-tolerance review',x.due_on::text,x.owner from investigations x join calibrations c on c.id=x.calibration_id join instruments i on i.id=c.instrument_id join sites s on s.id=i.site_id where x.status='open'
 union all select site,code,name,'quarantined',coalesce(next_due::text,'unknown'),owner from v_register where status='quarantine';
create view v_sites with (security_invoker=true) as
 select s.code as site,s.name,count(i.id)::int as instruments,count(i.id) filter(where i.eligibility='available')::int as available,
 count(i.id) filter(where i.status='quarantine')::int as quarantined,count(i.id) filter(where i.next_due<current_date and i.status<>'retired')::int as overdue
 from sites s left join v_register i on i.site_id=s.id group by s.code,s.name;
revoke all on v_register,v_recall,v_evidence,v_impact,v_attention,v_sites from public;

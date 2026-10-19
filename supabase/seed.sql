insert into sites(id,code,name) values
 ('10000000-0000-0000-0000-000000000001','AKL','Harbour Components'),
 ('10000000-0000-0000-0000-000000000002','CHC','Southern Assembly') on conflict do nothing;
insert into reference_standards(id,code,name,valid_from,valid_until,certificate_ref,uncertainty_note) values
 ('20000000-0000-0000-0000-000000000001','STD-01','Gauge block set',current_date-400,current_date+120,'demo://certificate/blocks','Expanded uncertainty in external certificate; demo only'),
 ('20000000-0000-0000-0000-000000000003','STD-03','Torque reference',current_date-400,current_date+120,'demo://certificate/torque','Expanded uncertainty in external torque certificate; demo only'),
 ('20000000-0000-0000-0000-000000000002','STD-02','Pressure reference',current_date-400,current_date-20,'demo://certificate/pressure','External laboratory uncertainty budget; demo only') on conflict do nothing;
insert into instruments(id,site_id,code,name,serial,owner,interval_days,next_due,status) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','CAL-01','Digital caliper','D001','Mara',180,current_date+60,'active'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','CAL-02','Digital caliper spare','D002','Mara',180,current_date-10,'active'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','TOR-01','Torque wrench','T003','Ari',90,current_date+12,'quarantine'),
 ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','PRE-01','Pressure gauge','P004','Ari',null,null,'quarantine'),
 ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','MIC-01','Micrometer','M005','Lea',180,current_date+15,'active') on conflict do nothing;
insert into calibrations(id,instrument_id,performed_on,as_found,as_left,standard_id,procedure_ref,certificate_ref,uncertainty_note,next_due,technician,reviewer,reviewed_on,review_evidence) values
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',current_date-120,'pass','pass','20000000-0000-0000-0000-000000000001','DIM rev 2','demo://cert/cal01','See signed laboratory uncertainty budget',current_date+60,'Dev','Mara',current_date-119,'demo://review/1'),
 ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',current_date-190,'pass','pass','20000000-0000-0000-0000-000000000001','DIM rev 2','demo://cert/cal02','See signed laboratory uncertainty budget',current_date-10,'Dev','Mara',current_date-189,'demo://review/2'),
 ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003',current_date-100,'pass','pass','20000000-0000-0000-0000-000000000003','TOR rev 1','demo://cert/tor-old','See signed laboratory torque uncertainty budget',current_date-10,'Dev','Ari',current_date-99,'demo://review/3'),
 ('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000003',current_date-5,'fail','pass','20000000-0000-0000-0000-000000000003','TOR rev 1','demo://cert/tor-new','See signed laboratory torque uncertainty budget',current_date+12,'Dev',null,null,null),
 ('40000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000004',current_date-2,'unknown','unknown','20000000-0000-0000-0000-000000000002',null,null,null,null,'Dev',null,null,null),
 ('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000005',current_date-165,'pass','pass','20000000-0000-0000-0000-000000000001','DIM rev 2','demo://cert/mic01','See signed laboratory uncertainty budget',current_date+15,'Dev','Lea',current_date-164,'demo://review/6') on conflict do nothing;
insert into investigations(id,calibration_id,owner,due_on) values ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000004','Ari',current_date-1) on conflict do nothing;
insert into custody(id,instrument_id,holder,checked_out,due_back) values ('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Bench team',current_date-10,current_date-2) on conflict do nothing;
insert into usage_records(id,instrument_id,batch,used_on,quantity,evidence_ref) values
 ('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000003','LOT-204',current_date-60,45,'demo://batch/204'),
 ('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','LOT-209',current_date-8,12,'demo://batch/209'),
 ('70000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','LOT-210',current_date-3,3,'demo://batch/210') on conflict do nothing;

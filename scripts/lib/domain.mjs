import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parseCsv,pick} from './csv.mjs';
import {REPO_ROOT} from './db.mjs';
export const today=()=>new Date().toISOString().slice(0,10);
export function text(v,label){if(typeof v!=='string'||!v.trim())throw Error(`${label} is required`);return v.trim();}
export function date(v,label){text(v,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`${label}: use a valid YYYY-MM-DD date`);return v;}
function past(v,label){date(v,label);if(v>today())throw Error(`${label} cannot be in the future`);return v;}
function integer(v,label){if(!/^\d+$/.test(String(v))||Number(v)<1||!Number.isSafeInteger(Number(v)))throw Error(`${label} must be a positive integer`);return Number(v);}
function choice(v,values,label){if(!values.includes(v))throw Error(`${label} must be ${values.join('|')}`);return v;}
const names={sites:['code','name'],instruments:['code','name'],reference_standards:['code','name'],calibrations:[],investigations:[],custody:[]};
export async function resolve(db,entity,term){
 text(term,entity);if(!names[entity])throw Error('Unknown entity');
 const fields=names[entity];const exact=['id::text',...fields].map(k=>`lower(${k})=lower($1)`).join(' or ');
 let rows=await db.query(`select * from ${entity} where ${exact} order by id`,[term]);
 if(rows.length!==1){const cond=['id::text',...fields].map(k=>`position(lower($1) in lower(${k}))>0`).join(' or ');rows=await db.query(`select * from ${entity} where ${cond} order by id`,[term]);}
 if(rows.length!==1){const listing=rows.length?rows:await db.query(`select * from ${entity} order by id limit 20`);throw Error(`${entity}: ${rows.length?'ambiguous':'not found'} ${JSON.stringify(term)}\n${listing.map(r=>`${r.id} ${r.code||''} ${r.name||''}`).join('\n')}`);}
 return rows[0];
}
async function audit(db,entity,id,action,actor,detail){await db.query('insert into audit_log(entity,record_id,action,actor,detail) values($1,$2,$3,$4,$5)',[entity,id,action,actor,JSON.stringify(detail)]);}
async function insert(db,entity,fields){const keys=Object.keys(fields);return (await db.query(`insert into ${entity}(${keys.join(',')}) values(${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`,Object.values(fields)))[0];}
async function transaction(db,fn,dry=false){await db.exec('begin');try{const result=await fn();await db.exec(dry?'rollback':'commit');return result;}catch(e){await db.exec('rollback');throw e;}}
export const reads={
 'sites':'select * from v_sites order by site',
 'instruments':'select id,site,code,name,owner,next_due,status,eligibility from v_register order by site,code',
 'recall':'select site,code,name,owner,next_due,days_to_due,eligibility from v_recall order by next_due nulls first,code',
 'attention':'select * from v_attention order by site,code,reason',
 'standards':'select id,code,name,valid_from,valid_until,certificate_ref,uncertainty_note from reference_standards order by code',
 'calibrations':'select c.id,i.code,c.performed_on,c.as_found,c.as_left,c.next_due,c.technician,c.reviewer from calibrations c join instruments i on i.id=c.instrument_id order by c.performed_on desc,i.code',
 'evidence':'select * from v_evidence where gaps<>\'\' order by site,code,performed_on',
 'custody':'select l.id,i.code,l.holder,l.checked_out,l.due_back,l.returned_on,l.return_condition from custody l join instruments i on i.id=l.instrument_id order by l.checked_out,i.code',
 'investigations':'select x.id,i.code,x.owner,x.due_on,x.status,x.impact_review,x.disposition,x.evidence_ref from investigations x join calibrations c on c.id=x.calibration_id join instruments i on i.id=c.instrument_id order by x.due_on',
 'impact':'select code,owner,status,due_on,failure_on,last_pass,batch,used_on,quantity,scope from v_impact order by code,used_on',
 'usage':'select u.id,i.code,u.batch,u.used_on,u.quantity,u.evidence_ref from usage_records u join instruments i on i.id=u.instrument_id order by u.used_on,i.code',
 'compliance':`select code,'evidence' as rule,gaps as finding from v_evidence where gaps<>'' union all select code,'recall',eligibility from v_register where status<>'retired' and eligibility<>'available' union all select code,'impact review','Open investigation: '||owner from v_impact where status='open' group by code,owner order by code,rule`,
};
export const insights=[
 ['Which overdue tools are still checked out?',`select r.site,r.code,l.holder,r.next_due,l.due_back from v_register r join custody l on l.instrument_id=r.id where l.returned_on is null and r.next_due<current_date`],
 ['Which production batches used a tool since its last verified pass?',`select code,batch,used_on,quantity,scope from v_impact where status='open' order by used_on`],
 ['Which reference standards were outside validity when used?',`select code,performed_on,gaps from v_evidence where gaps like '%reference outside%'`],
 ['Which owners have both overdue recalls and unresolved failures?',`select distinct r.owner from v_recall r join v_impact x on x.owner=r.owner where x.status='open' and r.next_due<current_date`],
 ['Which sites have the most unavailable instruments?',`select site,instruments,available,instruments-available as unavailable from v_sites order by unavailable desc,site`],
 ['Which calibration records lack uncertainty or certificate evidence?',`select code,performed_on,gaps from v_evidence where gaps like '%uncertainty%' or gaps like '%certificate%'`],
 ['Which instruments have unknown next recall dates?',`select site,code,name,owner from v_register where next_due is null and status<>'retired'`],
 ['Which batches were recorded after the failed calibration?',`select code,batch,used_on,failure_on,quantity from v_impact where used_on>failure_on`],
 ['Which instruments failed more than once?',`select i.code,count(*)::int as failures from calibrations c join instruments i on i.id=c.instrument_id where c.as_found='fail' group by i.code having count(*)>1`],
 ['Which upcoming recalls also have incomplete calibration evidence?',`select r.site,r.code,r.next_due,e.gaps from v_recall r join v_evidence e on e.id=(select id from calibrations where instrument_id=r.id order by performed_on desc limit 1) where e.gaps<>''`]
];
export async function run(db,cmd,args=[],f={}){
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='insights'){const out=[];for(const [question,sql]of insights)out.push({question,rows:await db.query(sql)});return out;}
 if(cmd==='instrument'||cmd==='history'){
  const i=await resolve(db,'instruments',args[0]);if(cmd==='instrument')return db.query('select * from v_register where id=$1',[i.id]);
  return {instrument:i,calibrations:await db.query('select * from calibrations where instrument_id=$1 order by performed_on',[i.id]),custody:await db.query('select * from custody where instrument_id=$1 order by checked_out',[i.id]),usage:await db.query('select * from usage_records where instrument_id=$1 order by used_on',[i.id]),notes:await db.query('select * from notes where instrument_id=$1 order by created_at',[i.id]),audit:await db.query('select * from audit_log where record_id=$1 order by created_at',[i.id])};
 }
 if(cmd==='export'){
  const data={format:'calibration-archive-v1',exported_at:new Date().toISOString()};
  for(const entity of ['sites','instruments','reference_standards','calibrations','investigations','custody','usage_records','notes','audit_log'])data[entity]=await db.query(`select * from ${entity} order by id`);
  if(f.out){writeFileSync(path.resolve(f.out),JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return {file:path.resolve(f.out)};}return data;
 }
 if(cmd==='draft-recall'||cmd==='draft-investigation'||cmd==='weekly-review'){
  const queries=cmd==='draft-recall'?['recall']:cmd==='draft-investigation'?['investigations','impact']:['attention','recall','evidence'];
  let body=`# ${cmd}\n\nPrepared ${today()}. Draft for operator review. Nothing sent.\n`;
  for(const q of queries)body+=`\n## ${q}\n\n\`\`\`json\n${JSON.stringify(await run(db,q),null,2)}\n\`\`\`\n`;
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`${cmd}-${Date.now()}-${Math.random().toString(16).slice(2,8)}.md`);writeFileSync(file,body,{flag:'wx',mode:0o600});return {file};
 }
 const actor=text(f.actor,'--actor');
 return transaction(db,async()=>{
  await db.exec('lock table instruments,reference_standards,calibrations,investigations,custody,usage_records in share row exclusive mode');
  let result,entity,action=cmd;
  if(cmd==='add-site'){entity='sites';result=await insert(db,entity,{code:text(f.code,'--code'),name:text(f.name,'--name')});}
  else if(cmd==='add'){
   const s=await resolve(db,'sites',text(f.site,'--site'));entity='instruments';
   result=await insert(db,entity,{site_id:s.id,code:text(f.code,'--code'),name:text(f.name,'--name'),serial:f.serial||null,owner:text(f.owner,'--owner'),interval_days:f.interval?integer(f.interval,'--interval'):null,next_due:f.due?date(f.due,'--due'):null});
  }else if(cmd==='add-standard'){
   entity='reference_standards';result=await insert(db,entity,{code:text(f.code,'--code'),name:text(f.name,'--name'),valid_from:date(f.from,'--from'),valid_until:date(f.until,'--until'),certificate_ref:text(f.certificate,'--certificate'),uncertainty_note:text(f.uncertainty,'--uncertainty')});
  }else if(cmd==='record-calibration'){
   const i=await resolve(db,'instruments',args[0]);if(i.status==='retired')throw Error('Retired instrument');
   const performed=past(f.date,'--date');const latest=(await db.query('select max(performed_on)::text as day from calibrations where instrument_id=$1',[i.id]))[0].day;
   if(latest&&performed<=latest)throw Error('New calibration must follow the latest recorded calibration');
   const standard=f.standard?await resolve(db,'reference_standards',f.standard):null;
   entity='calibrations';result=await insert(db,entity,{instrument_id:i.id,performed_on:performed,as_found:choice(f.found,['pass','fail','unknown'],'--found'),as_left:choice(f.left,['pass','fail','unknown'],'--left'),standard_id:standard?.id||null,procedure_ref:f.procedure||null,certificate_ref:f.certificate||null,uncertainty_note:f.uncertainty||null,next_due:f.due?date(f.due,'--due'):null,technician:actor});
   await db.query("update instruments set status='quarantine',next_due=$2 where id=$1",[i.id,result.next_due]);
   if(result.as_found==='fail'||result.as_left==='fail'){
    const x=await insert(db,'investigations',{calibration_id:result.id,owner:text(f.owner||i.owner,'--owner'),due_on:date(f['review-due']||today(),'--review-due')});
    await audit(db,'investigations',x.id,'opened-after-failure',actor,x);
   }
   await audit(db,'instruments',i.id,'quarantine-after-calibration',actor,{calibration_id:result.id});
  }else if(cmd==='verify'){
   const c=await resolve(db,'calibrations',args[0]);if(c.reviewer)throw Error('Calibration already reviewed');if(c.technician.toLowerCase()===actor.toLowerCase())throw Error('Independent reviewer required');
   const gaps=(await db.query('select gaps from v_evidence where id=$1',[c.id]))[0].gaps.split('; ').filter(g=>g!=='awaiting evidence review');if(gaps.length)throw Error(gaps.join('; '));
   entity='calibrations';result=(await db.query('update calibrations set reviewer=$2,reviewed_on=current_date,review_evidence=$3 where id=$1 returning *',[c.id,actor,text(f.evidence,'--evidence')]))[0];
  }else if(cmd==='release'||cmd==='quarantine'||cmd==='retire'){
   const i=await resolve(db,'instruments',args[0]);entity='instruments';if(i.status==='retired')throw Error('Instrument is retired');
   text(f.reason,'--reason');
   if(cmd==='release'){
    const c=(await db.query('select * from calibrations where instrument_id=$1 order by performed_on desc limit 1',[i.id]))[0];
    if(!c||!c.reviewer||c.as_left!=='pass'||!c.next_due||c.next_due<today())throw Error('Latest calibration needs a verified pass and current due date');
    if((await db.query("select x.id from investigations x join calibrations c on c.id=x.calibration_id where c.instrument_id=$1 and x.status='open'",[i.id])).length)throw Error('Close the impact investigation before release');
   }
   if(cmd==='retire'&&(await db.query('select id from custody where instrument_id=$1 and returned_on is null',[i.id])).length)throw Error('Return the instrument before retirement');
   result=(await db.query('update instruments set status=$2 where id=$1 returning *',[i.id,cmd==='release'?'active':cmd==='retire'?'retired':'quarantine']))[0];
  }else if(cmd==='close-investigation'){
   const x=await resolve(db,'investigations',args[0]);if(x.status==='closed')throw Error('Investigation already closed');entity='investigations';
   result=(await db.query("update investigations set status='closed',impact_review=$2,disposition=$3,evidence_ref=$4,closed_by=$5,closed_on=current_date where id=$1 returning *",[x.id,text(f.impact,'--impact'),text(f.disposition,'--disposition'),text(f.evidence,'--evidence'),actor]))[0];
  }else if(cmd==='checkout'){
   const i=await resolve(db,'instruments',args[0]);
   // Row lock serialises checkout against another checkout on Postgres; PGlite has one operator.
   await db.query('select id from instruments where id=$1 for update',[i.id]);
   const r=(await db.query('select * from v_register where id=$1',[i.id]))[0];if(r.eligibility!=='available')throw Error(`Cannot check out: ${r.eligibility}`);
   const due=date(f.due,'--due');if(due<today()||due>r.next_due)throw Error('Return date must be today or later and within calibration validity');
   entity='custody';result=await insert(db,entity,{instrument_id:i.id,holder:text(f.holder,'--holder'),checked_out:today(),due_back:due});
  }else if(cmd==='return'){
   const i=await resolve(db,'instruments',args[0]);entity='custody';const condition=choice(f.condition,['good','damaged'],'--condition');
   result=(await db.query('update custody set returned_on=current_date,return_condition=$2 where instrument_id=$1 and returned_on is null returning *',[i.id,condition]))[0];if(!result)throw Error('No open checkout');
   if(condition==='damaged'){await db.query("update instruments set status='quarantine' where id=$1",[i.id]);await audit(db,'instruments',i.id,'damaged-return',actor,{custody_id:result.id});}
  }else if(cmd==='record-use'){
   const i=await resolve(db,'instruments',args[0]);entity='usage_records';result=await insert(db,entity,{instrument_id:i.id,batch:text(f.batch,'--batch'),used_on:past(f.date,'--date'),quantity:integer(f.quantity,'--quantity'),evidence_ref:text(f.evidence,'--evidence')});
  }else if(cmd==='log'){
   const i=await resolve(db,'instruments',args[0]);entity='notes';result=await insert(db,entity,{instrument_id:i.id,actor,body:text(f.note,'--note')});
  }else if(cmd==='import'){
   if(args[0]!=='gagelist')throw Error('Use import gagelist <CSV file> --site=<site>');
   const s=await resolve(db,'sites',text(f.site,'--site'));const rows=parseCsv(readFileSync(text(args[1],'CSV file'),'utf8'));if(!rows.length)throw Error('CSV has no records');
   const map=f.map?JSON.parse(readFileSync(f.map,'utf8')):{};for(const k of Object.keys(map))if(!['code','name','serial','owner','interval','due'].includes(k)||typeof map[k]!=='string')throw Error(`Unknown column mapping: ${k}`);
   const aliases={code:['Control Number','Gage ID','Gage Number'],name:['Description','Gage Description','Name'],serial:['Serial Number','Serial'],owner:['Owner','Responsible Person','Assigned To'],interval:['Interval Days'],due:['Next Calibration Date','Next Due Date','Calibration Due Date']};
   for(const k of ['code','name'])if(!Object.keys(rows[0]).some(h=>(map[k]?[map[k]]:aliases[k]).some(a=>a.toLowerCase()===h.toLowerCase())))throw Error(`Missing ${k} column; configure --map`);
   for(const [k,col]of Object.entries(map))if(!Object.keys(rows[0]).some(h=>h.toLowerCase()===col.toLowerCase()))throw Error(`Mapped column missing: ${k} -> ${col}`);
   const seen=new Set();let added=0,skipped=0;
   for(const row of rows){
    const get=k=>pick(row,...(map[k]?[map[k]]:aliases[k])).trim();const code=text(get('code'),'Control Number');if(seen.has(code.toLowerCase()))throw Error(`Duplicate control number: ${code}`);seen.add(code.toLowerCase());
    const canonical={code,name:text(get('name'),'Description'),serial:get('serial')||null,owner:get('owner')||'Unassigned',interval_days:get('interval')?integer(get('interval'),'Interval Days'):null,next_due:get('due')?date(get('due'),'Next Calibration Date'):null};
    const sourceData={mapped:canonical,original:row};const old=(await db.query('select * from instruments where site_id=$1 and lower(code)=lower($2)',[s.id,code]))[0];
    if(old){
     if(old.source==='gagelist'&&Object.keys(canonical).every(k=>old.source_data?.mapped?.[k]===canonical[k])){skipped++;continue;}
     throw Error(`Import conflict for ${code}; existing record retained`);
    }
    const i=await insert(db,'instruments',{...canonical,site_id:s.id,source:'gagelist',source_data:JSON.stringify(sourceData)});await audit(db,'instruments',i.id,'import-gagelist',actor,{code,source_hash:createHash('sha256').update(JSON.stringify(row)).digest('hex')});added++;
   }
   return {added,skipped,dry_run:Boolean(f['dry-run']),status:'Imported instruments remain quarantined pending certificate review'};
  }else throw Error(`Unknown command: ${cmd}`);
  await audit(db,entity,result.id,action,actor,{record:result,...(f.reason?{reason:f.reason}:{})});return result;
 },Boolean(f['dry-run']));
}

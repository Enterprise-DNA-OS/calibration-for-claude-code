#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {run,reads} from './lib/domain.mjs';
import {table} from './lib/format.mjs';
const args=[],flags={};
for(const a of process.argv.slice(2)){if(a.startsWith('--')){const i=a.indexOf('=');const key=a.slice(2,i<0?undefined:i);if(Object.hasOwn(flags,key))throw Error(`Duplicate --${key}`);flags[key]=i<0?true:a.slice(i+1);}else args.push(a);}
const command=args.shift();
const allowed=['json','dry-run','actor','code','name','site','serial','owner','interval','due','from','until','certificate','uncertainty','date','standard','procedure','found','left','review-due','evidence','reason','impact','disposition','holder','condition','batch','quantity','note','map','out','help'];
function human(value){
 if(Array.isArray(value)){if(!value.length)return '(none)';if(value[0]?.question)return value.map(x=>`${x.question}\n${human(x.rows)}`).join('\n\n');return table(value,Object.keys(value[0]).map(key=>({key,label:key,format:v=>v===null?'unknown':typeof v==='object'?JSON.stringify(v):String(v)})));}
 return JSON.stringify(value,null,2);
}
if(!command||flags.help){console.log('Calibration desk: '+[...Object.keys(reads),'instrument','history','insights','add-site','add','add-standard','record-calibration','verify','release','quarantine','retire','close-investigation','checkout','return','record-use','log','import gagelist','export','draft-recall','draft-investigation','weekly-review'].join(', ')+'\nOptions use --key=value. See docs/cli.md.');}
else{let db;try{for(const key of Object.keys(flags))if(!allowed.includes(key))throw Error(`Unknown option --${key}`);db=await getDb();const result=await run(db,command,args,flags);console.log(flags.json?JSON.stringify(result):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}}

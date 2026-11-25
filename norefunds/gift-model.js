import {buildReceipt,EDITIONS} from './calculator-model.js';
export const DESIGN_VERSION='v7';
export const GIFT_ASSUMPTIONS='Playful invented estimates: 20,000 breaths, 100,000 heartbeats, 15,000 blinks, 7 yawns, 6 bed turns and 3 daydreams per day; good sleep on 70% of nights. Creepy events and other themed counts are fiction. The target age is a scenario, not a prognosis. Optional parent-visit figures use an illustrative age 85, or a 20-year scenario when no parent age is supplied. Nothing is stored or uploaded when you calculate or download.';
const estimateRound=x=>{const f=Math.floor(x);return x-f===.5?(f%2===0?f:f+1):Math.round(x);};
export function localDate(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
export function buildGiftReceipt(input){
 // Gift artwork is English, as on the approved exports. UI translations remain separate.
 const model=buildReceipt({...input,language:'en',income:undefined});
 const days=estimateRound(model.Y*365.25),n=x=>'~'+estimateRound(x).toLocaleString('en-US'),m=x=>'~'+x.toFixed(1)+'M';
 const pair=(lab,val)=>({t:'li',lab,val:String(val)}),section=lab=>({t:'sect',lab}),rule=()=>({t:'rule'});
 const night=[pair('GOOD NIGHTS (SYSTEM RESET)',n(days*.7)),pair('TURNS IN BED (NO REHEARSAL)',n(days*6)),pair('PILLOW FLIPS (COOL SIDE)',n(days*2)),pair('DAYDREAMS (NO REFERRAL)',n(days*3))];
 const replacement={medical:[section('BUILT-IN FEATURES / FICTION'),pair('HEARTBEATS (BUILT-IN DRUMS)','~'+(days*100000/1e9).toFixed(1)+'B'),pair('BREATHS (AUTO-RENEWAL)',m(days*.02)),pair('BLINKS (TINY INTERMISSIONS)',m(days*.015)),pair('YAWNS (SILENT APPLAUSE)',n(days*7)),rule(),section('THE QUIET NIGHT SHIFT'),...night,rule()],
 goth:[section('AFTER DARK / FICTION'),pair('SHADOWS THAT MOVED?',n(model.Y*13)),pair('LOOKS OVER YOUR SHOULDER',n(model.Y*24)),pair('PORTRAITS MAKING EYE CONTACT',n(model.Y*9)),rule(),section('THE UNEXPLAINED'),pair('LIGHTS ON','JUST IN CASE'),pair('UPSTAIRS','PROBABLY NOTHING'),pair('MIRROR','YOU. PROBABLY.'),rule()]};
 const moments={standard:[['BREATHS (NO SUBSCRIPTION)',m(days*.02)],["GOOD NIGHTS' SLEEP",n(days*.7)],['ROLLS IN BED (NOT BREAD)',n(days*6)],["DAYDREAMS (BOSS CAN'T SEE)",n(days*3)]],
 medical:[['SIGHS OF RELIEF',n(days)],['STRETCHES (START-UP ROUTINE)',n(days*2)],['GOOSEBUMPS (GOOD MUSIC)',n(days/2)],['GRINS (NO LICENCE NEEDED)',n(days*3)]],
 goth:[['BREATHS IN EMPTY ROOMS',m(days*.02)],['3AM CEILING INSPECTIONS',n(days*.13)],['DREAMS WITH AN EXTRA GUEST',n(days*.09)],['FLOORBOARDS (NO ONE HOME)',n(days*.17)]],
 sunny:[['BREATHS (FRESH AIR EXTRA)',m(days*.02)],['GOOD NIGHTS (DREAM BIG)',n(days*.7)],['BED TURNS (COOL SIDE QUEST)',n(days*6)],["DAYDREAMS (DIRECTOR'S CUT)",n(days*3)]]};
 const lines=[];let skip=false,bonus=false;
 for(const source of model.lines){
  const item={...source};
  if(item.t==='sect'&&((model.edition==='medical'&&item.lab==='PARTS & LABOUR (FICTIONAL WARRANTY)')||(model.edition==='goth'&&item.lab==='THE DARK LEDGER (FICTIONAL EST.)'))){lines.push(...replacement[model.edition]);skip=true;continue;}
  if(skip){if((item.t==='sect'&&item.lab==='PEOPLE')||(item.t==='li'&&item.lab==='SUBTOTAL'))skip=false;else continue;}
  if(!bonus&&((item.t==='sect'&&item.lab==='PEOPLE')||(item.t==='li'&&item.lab==='SUBTOTAL'))){lines.push(rule(),section('STILL TO COME / PLAYFUL EST.'),...moments[model.edition].map(([l,v])=>pair(l,v)),rule());bonus=true;}
  if(item.cls?.includes('note'))continue;
  if(item.t==='barcode'||item.t==='bnum')continue;
  if(item.t==='sect')item.lab=({'TIME LEFT (NON-TRANSFERABLE)':'TIME LEFT / NO TRANSFERS','CONSUMPTION, REMAINING (EST.)':'CONSUMPTION / EST.','JOY INVENTORY (QUESTIONABLE EST.)':'JOY INVENTORY / FICTION'})[item.lab]||item.lab;
  if(item.lab==='SUBTOTAL'){item.lab='TOTAL';item.val="ALL YOU'LL EVER HAVE";}
  if(item.lab==='CHANGE DUE')item.val='NONE';
  if(item.lab==='FIRST TIMES STILL AHEAD'){item.lab='ADVENTURES';item.val='PRIVATE EDITION';}
  if(item.lab==="TIMES YOU'LL FALL IN LOVE"){item.lab='LOVE';item.val='1+ (ASK SPOUSE)';}
  if(item.t==='stamp'){item.val=item.lab;item.lab='NO REFUNDS';}
  if(item.t==='thanks'){item.lab='THANKS FOR LIVING,';item.val='COME AGAIN!';}
  lines.push(item);
  if(item.lab==="TIMES YOU'LL SEE YOUR PARENTS"&&Number.isFinite(model.pAge))lines.push(pair('',`PARENTS ${model.pAge} / VISITS ${model.visits}/YR`));
 }
 const clean=lines.filter((r,i)=>r.t!=='rule'||(i&&lines[i-1].t!=='rule'));
 const title=EDITIONS[model.edition],sample=clean.filter(x=>x.t==='li'&&x.lab&&!x.cls?.includes('barline')).slice(0,3);
 return {...model,lines:clean,title,language:input.language||'en',name:Array.from(String(input.name||'').replace(/\s+/g,' ').trim()).slice(0,28).join(''),date:/^\d{4}-\d{2}-\d{2}$/.test(input.date||'')?input.date:localDate(),dateKind:input.dateKind==='birthday'?'birthday':'printed',income:undefined,designVersion:DESIGN_VERSION,finePrint:GIFT_ASSUMPTIONS,printDisclaimer:'PLAYFUL ESTIMATES / NOT A PREDICTION',shareOv:'My '+title+' Life Receipt\n'+sample.map(x=>x.lab+': '+x.val).join('\n')+'\nOne life. No returns.'};
}

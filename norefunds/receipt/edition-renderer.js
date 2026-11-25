import {buildGiftReceipt} from '../gift-model.js';
import {GLYPHS,HERO,ICONS} from './pixel-assets.js';
const PAPER='#F8F5EA',INK='#171713';
const plain=v=>String(v??'').replace(/&amp;/g,'&').replace(/<[^>]*>/g,'').replace(/\u00a0/g,' ').replace(/[—–]/g,'-').replace(/·/g,'/').toUpperCase();
function wrap(s,n){const out=[];let line='';for(const word of plain(s).split(/\s+/)){if(!word)continue;for(let w=word;w;){const part=w.slice(0,n);w=w.slice(n);if(line&&(line.length+part.length+1>n)){out.push(line);line='';}line+=(line?' ':'')+part;if(w){out.push(line);line='';}}}if(line)out.push(line);return out;}
const ICON_RULES=[['HEARTBEAT','heart'],['BREATH','lungs'],['BLINK','eye'],['YAWN','face'],['GRIN','face'],['LAUGH','face'],['SIGH','wave'],['GOOSEBUMP','wave'],['STRETCH','person'],['DREAM','cloud'],['PILLOW','pillow'],['NIGHT','bed'],['BED','bed'],['NAP','bed'],['WEEKEND','calendar'],['SUMMER','sun'],['MOON','moon'],['COFFEE','mug'],['MEAL','meal'],['PHONE','phone'],['CAR','car'],['HAIRCUT','scissors'],['BOOK','book'],['EMPLOYER','case'],['WORK','case'],['PARENT','people'],['PEOPLE','people'],['HUG','heart'],['LOVE','heart'],['DOG','foot'],['SWIM','wave'],['SNOW','star'],['BIRTHDAY','candle'],['LIGHT','lamp'],['UPSTAIRS','ghost'],['MIRROR','mirror'],['PORTRAIT','eye'],['SHOULDER','eye'],['SHADOW','ghost'],['FLOOR','foot'],['3AM','clock'],['ADVENTURE','star'],['TOTAL','receipt'],['PAYMENT','clock'],['CHANGE','star'],['OFF','sun']];
function motif(label){return ICONS[ICON_RULES.find(([word])=>label.includes(word))?.[1]||'star'];}
function sectionIcon(label,ed){if(label.includes('STILL TO COME'))return ICONS.moon;if(label.includes('PEOPLE'))return ICONS.heart;if(/TIME|LIFE USED/.test(label))return ICONS.clock;if(label.includes('CONSUMPTION'))return ICONS.mug;return ed==='goth'?HERO.goth:ed==='sunny'?ICONS.star:ed==='medical'?ICONS.wave:ICONS.mug;}
export function renderEdition(canvas,input){
 const model=buildGiftReceipt(input),ctx=canvas.getContext('2d',{alpha:false});
 ctx.setTransform(canvas.width/288,0,0,canvas.height/1152,0,0);ctx.fillStyle=PAPER;ctx.fillRect(0,0,288,1152);
 const bounds=[],textRuns=[],pairs=[],icons=[];
 function text(value,x,y,size=10.1,{align='left',inverse=false,max=252}={}){
  const s=plain(value),pixel=Array.from(s).every(ch=>GLYPHS[ch]);let width;
  if(pixel){width=(s.length*6-1)*size/7;if(width>max)throw new Error('Text exceeds its layout column: '+s);}
  else{ctx.font=size+'px monospace';width=ctx.measureText(s).width;while(width>max&&size>9.5){size-=.25;ctx.font=size+'px monospace';width=ctx.measureText(s).width;}width=Math.min(width,max);}
  const left=align==='center'?x-width/2:align==='right'?x-width:x;
  if(left<10||left+width>278||y+size>1145)throw new Error('Text outside print: '+s);
  ctx.fillStyle=inverse?PAPER:INK;
  if(pixel){const p=size/7;for(let j=0;j<s.length;j++)GLYPHS[s[j]].split('/').forEach((row,r)=>Array.from(row).forEach((v,col)=>{if(v==='1')ctx.fillRect(left+j*6*p+col*p,y+r*p,p*.94,p*.94);}));}
  else{ctx.textBaseline='top';ctx.textAlign='left';ctx.fillText(s,left,y,max);}
  textRuns.push({value:s,left,top:y,right:left+width,bottom:y+size,size,pixel});
 }
 function icon(grid,x,y,size,inverse=false){ctx.fillStyle=inverse?PAPER:INK;const p=size/Math.max(grid.length,grid[0].length);grid.forEach((row,r)=>Array.from(row).forEach((v,col)=>{if(v==='1')ctx.fillRect(x+col*p,y+r*p,p,p);}));icons.push({left:x,top:y,right:x+size,bottom:y+size,size});}
 function rule(y){ctx.fillStyle=INK;for(let x=18;x<270;x+=6)ctx.fillRect(x,y,3,1);}
 text('LIFE RECEIPT',144,20,23,{align:'center'});text(model.title,144,54,9.5,{align:'center'});
 icon(HERO[model.edition],144-HERO[model.edition][0].length*1.25,78,Math.max(HERO[model.edition].length,HERO[model.edition][0].length)*2.5);
 const flanks={standard:['mug','book'],medical:['heart','lungs'],goth:['ghost','candle'],sunny:['heart','star']}[model.edition];
 icon(ICONS[flanks[0]],24,98,45);icon(ICONS[flanks[1]],219,98,45);text('ISSUED TO',144,112,9.5,{align:'center'});
 const name=model.name||'YOU',namePixel=Array.from(plain(name)).every(ch=>GLYPHS[ch]);
 if(namePixel&&(plain(name).length*6-1)*34/7<=142)text(name,144,131,34,{align:'center',max:142});
 else{const pieces=wrap(name,22);pieces.slice(0,2).forEach((p,i)=>text(p,144,144+i*16,13,{align:'center'}));}
 text(`AGE ${model.age} / PLAN ${model.exp} YRS`,144,179,10,{align:'center'});
 text((model.dateKind==='birthday'?'BIRTHDAY ':'PRINTED ')+model.date,144,199,9.5,{align:'center'});rule(218);
 const rows=[];
 function add(s,kind='line'){for(const part of wrap(s,29))rows.push({kind,text:part});}
 for(const item of model.lines){
  if(item.t==='stamp'||item.t==='thanks')continue;
  if(item.t==='rule'){rows.push({kind:'rule'});continue;}
  if(item.cls?.includes('barline')){add(`LIFE USED: ${Math.round(model.age/model.exp*100)}%`,'section');continue;}
  if(item.t==='sect'){add(item.lab,'section');continue;}
  if(!item.lab){add(item.val);continue;}
  const lab=plain(item.lab),value=plain(item.val),size=10.1,valueWidth=(value.length*6-1)*size/7;
  const count=Math.min(25,Math.floor((235-valueWidth-14)/(6*size/7)));
  if(count<1)throw new Error('Value too long for gift receipt: '+value);
  rows.push({kind:'pair',labels:wrap(lab,count),value,size});
 }
 const clean=rows.filter((r,i)=>r.kind!=='rule'||(i&&rows[i-1].kind!=='rule'));
 let padding=4.5;const height=r=>r.kind==='pair'?r.labels.length*13.8+padding:({line:13.8,section:20,rule:9})[r.kind];
 if(clean.reduce((n,r)=>n+height(r),0)>780)padding=3;
 const factor=780/clean.reduce((n,r)=>n+height(r),0);if(factor<1)throw new Error('Too much copy for readable v7 print: '+JSON.stringify({age:model.age,edition:model.edition,visits:model.visits,parentAge:model.pAge,name:model.name,factor}));let y=231;
 for(const row of clean){const h=height(row)*factor;
  bounds.push({type:row.kind,top:y/1152*1800,bottom:(y+h)/1152*1800});
  if(row.kind==='rule')rule(y+3);
  else if(row.kind==='section'){
   ctx.fillStyle=INK;ctx.fillRect(16,y-3,256,15.5);icon(sectionIcon(row.text,model.edition),19,y+.5,9,true);text(row.text,33,y,9.5,{inverse:true});
   if(row.text.startsWith('LIFE USED:')){const used=Math.round(model.age/model.exp*20);ctx.strokeStyle=PAPER;ctx.lineWidth=.65;ctx.fillStyle=PAPER;for(let i=0;i<20;i++){if(i<used)ctx.fillRect(169+i*4.7,y+1.5,3.1,8);ctx.strokeRect(169+i*4.7,y+1.5,3.1,8);}}
  }else if(row.kind==='pair'){
   const valueLeft=270-(row.value.length*6-1)*row.size/7;icon(motif(row.labels.join(' ')),18,y,11);
   row.labels.forEach((l,i)=>{const end=35+(l.length*6-1)*row.size/7;if(end+10>valueLeft)throw new Error('Overlapping columns');text(l,35,y+i*13.8,row.size);});
   text(row.value,270,y,row.size,{align:'right'});pairs.push({label:row.labels.join(' '),value:row.value,labelY:y,valueY:y,right:270});
  }else text(row.text,18,y);
  y+=h;
 }
 rule(1020);text('NO REFUNDS',144,1031,14,{align:'center'});
 const stamp=model.lines.find(x=>x.t==='stamp');wrap(stamp?.val||'',30).forEach((l,i)=>text(l,144,1051+i*13,9.5,{align:'center'}));
 const lower={standard:['mug','clock'],medical:['heart','wave'],goth:['moon','ghost'],sunny:['heart','sun']}[model.edition];icon(ICONS[lower[0]],20,1078,36);icon(ICONS[lower[1]],232,1078,36);
 text('THANKS FOR LIVING,',144,1082,10.5,{align:'center'});text('COME AGAIN!',144,1098,10.5,{align:'center'});text('KONSIL.CH/NOREFUNDS / V7',144,1120,9.5,{align:'center'});
 return {model,bounds,scale:factor,textRuns,pairs,icons,version:'v7'};
}

import test from 'node:test';import assert from 'node:assert/strict';
import {buildGiftReceipt} from '../gift-model.js';
const line=(r,label)=>r.lines.find(x=>x.lab===label)?.val;
test('gift version matches approved v7 example and omits income',()=>{
 for(const edition of ['standard','medical','goth','sunny']){
  const r=buildGiftReceipt({edition,age:50,plan:92,name:'Alex',income:200000,visits:4,parentAge:86,date:'2026-11-25'});
  assert.equal(r.designVersion,'v7');assert.equal(line(r,'TOTAL'),"ALL YOU'LL EVER HAVE");assert.equal(line(r,"TIMES YOU'LL SEE YOUR PARENTS"),'PRICELESS');
  assert.equal(r.lines.find(x=>x.lab?.startsWith('BREATHS')).val,'~306.8M');assert.equal(line(r,'CHANGE DUE'),'NONE');
  assert.ok(!JSON.stringify(r.lines).match(/CHF|MONEY, STILL|INCOME|EARNINGS|200,000|SUBTOTAL|COLONOSCOP/));
  assert.equal(r.name,'Alex');assert.equal(r.date,'2026-11-25');
 }
});
test('all gift scenarios keep closing and themed content with or without optional parents',()=>{
 for(const edition of ['standard','medical','goth','sunny'])for(const age of [1,34,50,80,119])for(const plan of [81,92,100])for(const family of [{},{visits:4,parentAge:86},{visits:366,parentAge:18},{visits:2}]){
  const r=buildGiftReceipt({edition,age,plan,...family});assert.ok(line(r,'TOTAL'));assert.ok(r.lines.some(x=>x.lab==='STILL TO COME / PLAYFUL EST.'));
  assert.ok(!JSON.stringify(r.lines).match(/NaN|Infinity/));assert.ok(r.lines.find(x=>x.t==='thanks'));assert.ok(r.lines.find(x=>x.t==='stamp'));
  assert.equal(r.age,age);if(age===119)assert.equal(r.exp,129);
 }
});
test('English gift artwork preserves entered name/date without deriving age',()=>{
 const r=buildGiftReceipt({age:50,plan:92,edition:'goth',language:'zh',name:'张伟',date:'1976-06-15',dateKind:'birthday'});
 assert.equal(r.name,'张伟');assert.equal(r.age,50);assert.equal(r.dateKind,'birthday');assert.equal(line(r,'UPSTAIRS'),'PROBABLY NOTHING');
 assert.equal(line(r,'MIRROR'),'YOU. PROBABLY.');assert.ok(!JSON.stringify(r.lines).includes('FUNERALS'));
});

test('readable print fits extreme ages and optional family values with aligned columns',async()=>{
 const {renderEdition}=await import('../receipt/edition-renderer.js');
 const ctx={setTransform(){},fillRect(){},strokeRect(){},fillText(){},measureText(s){return {width:s.length*8};}};
 const canvas={width:1800,height:7200,getContext:()=>ctx};
 for(const edition of ['standard','medical','goth','sunny'])for(const age of [1,34,50,119])for(const plan of [81,92,100])for(const family of [{},{visits:2,parentAge:87},{visits:366,parentAge:18},{visits:2}]){
  const r=renderEdition(canvas,{edition,age,plan,...family,name:'Alexandria Maximiliane Muster'});
  assert.ok(r.textRuns.every(x=>x.left>=10&&x.right<=278&&x.size>=9.5));assert.ok(r.pairs.every(x=>x.labelY===x.valueY&&x.right===270));
  assert.equal(r.icons.filter(x=>x.size===45).length,2);assert.equal(r.icons.filter(x=>x.size===36).length,2);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReceipt,EDITIONS,I18N} from '../calculator-model.js';
const value=(model,label)=>model.lines.find(line=>line.lab===label)?.val;
test('Memento Mori matches the requested calculated example',()=>{
 const receipt=buildReceipt({age:50,plan:92,edition:'goth',visits:2,parentAge:87,income:450000,currency:'CHF'});
 assert.equal(value(receipt,'FUNERALS TO ATTEND'),'~38');
 assert.equal(value(receipt,'GRAVEYARD VISITS'),'~67');
 assert.equal(value(receipt,"LAST SONG YOU'LL HEAR"),'ALREADY WRITTEN');
 assert.equal(value(receipt,"TIMES YOU'LL SEE YOUR PARENTS"),'PRICELESS');
 assert.equal(receipt.weeks,2192);
});
test('edition-specific results use the selected age and warranty',()=>{
 const medical=buildReceipt({age:34,plan:81,edition:'medical'});
 assert.equal(value(medical,'HIPS, ORIGINAL PARTS'),'36 YRS');
 assert.equal(value(medical,'COLONOSCOPIES AHEAD'),'3 (ENJOY)');
 const sunny=buildReceipt({age:50,plan:92,edition:'sunny'});
 assert.equal(value(sunny,'DOGS YOU\'LL PET'),'5,460');
 const standard=buildReceipt({age:50,plan:92});
 assert.equal(value(standard,'COFFEES'),'22,995');
});
test('all editions retain valid totals, language behavior and age-extension logic',()=>{
 for(const edition of Object.keys(EDITIONS))for(const language of Object.keys(I18N))for(const age of [1,50,119]){
  const r=buildReceipt({age,plan:81,edition,language});
  assert.ok(r.weeks>0);assert.ok(r.lines.some(x=>x.t==='stamp'));assert.ok(r.lines.some(x=>x.t==='barcode'));
  if(age===119){assert.equal(r.Y,10);assert.equal(r.extended,true);}
 }
 assert.throws(()=>buildReceipt({age:120}),RangeError);
 assert.throws(()=>buildReceipt({age:34,edition:'injected'}),RangeError);
 assert.throws(()=>buildReceipt({age:34,plan:999}),RangeError);
});

test('one weekly counter and the corrected cashier farewell',()=>{
 const model=buildReceipt({age:50,plan:92,edition:'goth'});
 assert.equal(model.lines.some(x=>x.lab==='WEEKS'||x.lab==='MONDAYS'),false);
 assert.equal(model.lines.filter(x=>x.lab==='WEEKENDS').length,1);
 assert.equal(I18N.en.thanks,'THANKS FOR LIVING, COME AGAIN!');
});

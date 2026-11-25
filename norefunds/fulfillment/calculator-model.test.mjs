import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReceipt,EDITIONS,I18N} from '../calculator-model.js';
const value=(model,label)=>model.lines.find(line=>line.lab===label)?.val;
const hero=model=>model.lines.find(line=>line.t==='hero');

test('four editions have different hooks and unique comic closures',()=>{
 const all=Object.keys(EDITIONS).map(edition=>buildReceipt({age:50,plan:92,edition}));
 assert.deepEqual(all.map(r=>hero(r).val),['~2,192','~1.5B','~520','~15,330']);
 assert.equal(new Set(all.map(r=>hero(r).lab)).size,4);
 for(const kind of ['stamp','bnum','thanks']){
  assert.equal(new Set(all.map(r=>r.lines.find(x=>x.t===kind).lab)).size,4);
 }
 assert.equal(new Set(all.map(r=>r.style.panel)).size,4);
});
test('each edition uses real scenario calculations or explicitly fictional assumptions',()=>{
 const goth=buildReceipt({age:50,plan:92,edition:'goth',visits:2,parentAge:87,income:450000,currency:'CHF'});
 assert.equal(value(goth,'FUNERALS TO ATTEND'),'~38');
 assert.equal(value(goth,'PARENT VISITS (SCENARIO)'),'NOT ESTIMATED');
 assert.match(goth.finePrint,/entirely fictional/);
 const medical=buildReceipt({age:34,plan:81,edition:'medical'});
 assert.equal(value(medical,'KNEES'),'FREE SOUND EFFECTS');
 assert.equal(value(medical,'DENTAL CHECK-UP SLOTS'),'~94');
 assert.match(medical.finePrint,/not medical guidance/);
 const sunny=buildReceipt({age:50,plan:92,edition:'sunny'});
 assert.equal(value(sunny,'DOGS TO PET'),'~5,460');
 const standard=buildReceipt({age:50,plan:92});
 assert.equal(value(standard,'COFFEES (LEGAL FUEL)'),'~22,995');
 assert.ok(!standard.lines.some(x=>x.lab==='MONDAYS'||x.lab==='WEEKS'));
});
test('840 edition, locale, age, plan and optional-input cases have one hero and no duplicate labels',()=>{
 let cases=0;
 for(const edition of Object.keys(EDITIONS))for(const language of Object.keys(I18N))for(const age of [1,34,50,65,80,92,119])for(const plan of [81,92,100])for(const optional of [false,true]){
  const r=buildReceipt({age,plan,edition,language,...(optional?{income:123456,visits:12,parentAge:70}:{})});
  assert.ok(r.weeks>0);
  for(const type of ['hero','stamp','barcode','bnum','thanks'])assert.equal(r.lines.filter(x=>x.t===type).length,1);
  const labels=r.lines.filter(x=>x.lab).map(x=>x.lab.toLocaleLowerCase().trim());
  assert.equal(new Set(labels).size,labels.length);
  assert.ok(r.lines.every(x=>!x.val||!/NaN|Infinity/.test(x.val)));
  assert.ok(r.shareOv.includes(hero(r).val));
  assert.equal(r.contentLanguage,edition==='standard'?language:'en');
  if(age===119){assert.equal(r.Y,10);assert.equal(r.extended,true);}
  cases++;
 }
 assert.equal(cases,840);
 assert.throws(()=>buildReceipt({age:120}),RangeError);
 assert.throws(()=>buildReceipt({age:34,edition:'injected'}),RangeError);
 assert.throws(()=>buildReceipt({age:34,plan:999}),RangeError);
});

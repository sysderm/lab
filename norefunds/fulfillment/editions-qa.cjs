const {chromium,webkit,devices}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),output=path.join(__dirname,'.qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
for(const [engine,mobile] of [[chromium,false],[webkit,false],[webkit,true]]){
 const b=await engine.launch();try{
 const context=await b.newContext({...mobile?devices['iPhone 13']:{viewport:{width:1280,height:1000}},reducedMotion:'reduce'});
 await context.route('https://fonts.googleapis.com/**',r=>r.abort());
 await context.route('https://konsil.ch/**',r=>{
  const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/config'))return r.fulfill({json:{enabled:false}});
  const file=root+(p.endsWith('/')?p+'index.html':p);
  return r.fulfill({contentType:p.endsWith('.js')?'text/javascript':'text/html',body:fs.readFileSync(file)});
 });
 const p=await context.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
 const label=engine.name()+(mobile?'-mobile':'');let cases=0;
 for(const edition of ['standard','medical','goth','sunny']){
  await p.goto('https://konsil.ch/norefunds/receipt/?edition='+edition);
  await p.locator('#age').fill('50');await p.locator('#plan').selectOption('92');assert.equal(await p.locator('#income').isVisible(),false);await p.locator('#visits').fill('2');await p.locator('#parent-age').fill('87');
  assert.equal(await p.locator('#photo').isVisible(),false);assert.equal(await p.locator('#name').getAttribute('required'),null);
  assert.equal(await p.locator('#order-area').isVisible(),false);
  if(edition==='goth')assert.equal(await p.evaluate(()=>window.receiptPrint.model.lines.find(x=>x.lab==='UPSTAIRS').val),'PROBABLY NOTHING');
  for(const language of ['en'])for(const age of ['1','50','119']){
   await p.locator('#language').selectOption(language);await p.locator('#age').fill(age);
   assert.equal(await p.evaluate(()=>window.receiptPrint.bounds.every(x=>x.top>=0&&x.bottom<1750)),true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);cases++;
  }
  await p.locator('#age').fill('50');await p.locator('#language').selectOption('en');
  for(const name of ['Alex','Alexandria Maximiliane Muster','张伟']){
   await p.locator('#name').fill(name);
   assert.equal(await p.evaluate(()=>window.receiptPrint.textRuns.every(x=>x.left>=10&&x.right<=278)),true);
  }
  await p.locator('#name').fill('Alex');
  await p.locator('#date-kind').selectOption('birthday');await p.locator('#print-date').fill('1976-06-15');
  assert.equal(await p.evaluate(()=>window.receiptPrint.textRuns.some(x=>x.value==='ALEX'&&x.size>=30)),true);
  assert.equal(await p.evaluate(()=>window.receiptPrint.textRuns.some(x=>x.value==='BIRTHDAY 1976-06-15')),true);
  assert.equal(await p.evaluate(()=>window.receiptPrint.icons.filter(x=>x.size===45).length),2);
  assert.equal(await p.evaluate(()=>window.receiptPrint.icons.filter(x=>x.size===36).length),2);
  assert.equal(await p.evaluate(()=>window.receiptPrint.pairs.every(x=>x.labelY===x.valueY&&x.right===270)),true);
  assert.equal(await p.evaluate(()=>window.receiptPrint.textRuns.some(x=>x.value.includes('CHF')||x.value.includes('INCOME'))),false);
  assert.equal(await p.locator('#print-date').inputValue(),'1976-06-15');assert.equal(await p.evaluate(()=>window.receiptPrint.model.age),50);
  const png=await p.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);const data=Buffer.from(png,'base64');
  assert.equal(data.readUInt32BE(16),1800);assert.equal(data.readUInt32BE(20),7200);
  if(engine===chromium)fs.writeFileSync(path.join(output,edition+'-edition.png'),data);
  await p.locator('canvas').screenshot({path:path.join(output,label+'-'+edition+'.png')});
  assert.equal(await p.locator('#download').isVisible(),false);
 }
 assert.equal(requests.every(url=>url.startsWith('https://konsil.ch/')||url.startsWith('blob:')),true);
 // The original paid A3 poster is a separate route and is not replaced by this work.
 // Same-tab calculator to print handoff stays in memory, never in query params/storage.
 await p.goto('https://konsil.ch/norefunds/?lang=de');await p.locator('#age').fill('50');await p.locator('[name=plan][value="92"]').check();await p.locator('#edition').selectOption('goth');assert.equal(await p.locator('#income').isVisible(),false);await p.locator('#visits').fill('2');await p.locator('#page').fill('87');await p.locator('#i-print').click();
 await p.locator('#recipient').fill('Alex');await p.locator('#date-kind').selectOption('birthday');await p.locator('#print-date').fill('1976-06-15');await p.locator('#i-print').click();
 const screen=await p.evaluate(()=>window.giftPreview.model.lines.filter(x=>x.lab).map(x=>[x.lab,x.val].filter(Boolean)));
 await p.screenshot({path:path.join(output,label+'-gift-page.png'),fullPage:true});
 const [popup]=await Promise.all([p.waitForEvent('popup'),p.locator('#edition-print').click()]);
 await popup.waitForFunction(()=>window.receiptPrint?.model.age===50&&window.receiptPrint.model.plan===92);
 assert.equal(await popup.locator('#design').inputValue(),'goth');assert.equal(await popup.locator('#language').inputValue(),'en');assert.equal(await popup.locator('#name').inputValue(),'Alex');assert.equal(await popup.locator('#print-date').inputValue(),'1976-06-15');assert.equal(await popup.locator('#parent-age').inputValue(),'87');
 assert.equal(new URL(popup.url()).search,'?edition=dark');assert.equal(await popup.evaluate(()=>sessionStorage.length),0);
 const printed=await popup.evaluate(()=>window.receiptPrint.model.lines.filter(x=>x.lab).map(x=>[x.lab,x.val].filter(Boolean)));
 assert.deepEqual(printed,screen,'Same model rows in calculator and print');
 await popup.close();assert.deepEqual(errors,[]);
 console.log(label+': '+cases+' v7 gift layouts, Unicode/long names, aligned values, large icons, private handoff and no public download PASS');
 }finally{await b.close();}
}
})().catch(e=>{console.error(e);process.exit(1)});

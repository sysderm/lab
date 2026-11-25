const {chromium,webkit,devices}=require('playwright');
const fs=require('fs');const assert=require('node:assert/strict');
const path=require('node:path');const root=path.resolve(__dirname,'../..');
const output=process.env.QA_OUTPUT || path.join(__dirname,'.qa');fs.mkdirSync(output,{recursive:true});
(async()=>{for(const [engine,mobile] of [[chromium,false],[webkit,false],[webkit,true]]){
 const browser=await engine.launch();const context=await browser.newContext(mobile?devices['iPhone 13']:{viewport:{width:1280,height:950}});
 const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('https://konsil.ch/**',r=>{const path=new URL(r.request().url()).pathname;if(path.endsWith('/config'))return r.fulfill({json:{enabled:false}});return r.fulfill({contentType:path.endsWith('.js')?'text/javascript':'text/html',body:fs.readFileSync(root+path+(path.endsWith('/')?'index.html':''))});});
 await page.goto('https://konsil.ch/norefunds/receipt/');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('not enabled'));
 assert.equal(await page.locator('#order-area').isVisible(),false);assert.equal(requests.filter(url=>url.endsWith('/config')).length,1);
 let count=0;
 for(const lang of ['en','de'])for(const age of ['1','120'])for(const years of ['5','10','20','30']){
 await page.locator('#name').fill('Alexandria Maximiliane Muster');await page.locator('#age').fill(age);await page.locator('#language').selectOption(lang);await page.locator('#years').selectOption(years);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);count++;
 }
 const label=engine.name()+(mobile?'-mobile':'');
 await page.screenshot({path:output+'/'+label+'.png',fullPage:true});
 const png=await page.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);fs.writeFileSync(output+'/'+label+'-receipt.png',Buffer.from(png,'base64'));
 assert.equal(Buffer.from(png,'base64').readUInt32BE(16),1800);assert.equal(Buffer.from(png,'base64').readUInt32BE(20),7200);
 const portrait=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=800;const x=c.getContext('2d');x.fillStyle='#478';x.fillRect(0,0,600,800);x.fillStyle='#edc';x.beginPath();x.arc(300,280,150,0,Math.PI*2);x.fill();x.fillRect(120,450,360,350);return c.toDataURL().split(',')[1];});
 await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(portrait,'base64')});await page.waitForFunction(()=>document.querySelector('canvas').getAttribute('aria-busy')==='false');
 await page.screenshot({path:output+'/'+label+'-portrait.png',fullPage:true});
 assert.equal(await page.locator('#download').isVisible(),false);
 const low=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;return c.toDataURL().split(',')[1]});
 await page.locator('#photo').setInputFiles({name:'low.png',mimeType:'image/png',buffer:Buffer.from(low,'base64')});await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('400'));
 assert.deepEqual(errors,[]);assert.equal(requests.every(url=>url.startsWith('https://konsil.ch/')||url.startsWith('blob:')),true);
 // Exercise consent, retry, cancellation and redirect with isolated mock services.
 await page.unroute('https://konsil.ch/**');
 let attempts=0,mode='fail',uploaded=null;
 await page.addInitScript(()=>{const original=window.fetch;window.fetch=async function(url,options){if(options?.body instanceof Blob)window.testUploaded=Array.from(new Uint8Array(await options.body.arrayBuffer()));return original.call(this,url,options);};});
 await context.route('https://konsil.ch/**',async r=>{
  const pathname=new URL(r.request().url()).pathname;
  if(pathname.endsWith('/config'))return r.fulfill({json:{enabled:true,siteKey:'test-only'}});
  if(r.request().method()==='POST'){
   attempts++;uploaded=r.request().postDataBuffer();
   assert.equal(r.request().headers()['x-turnstile-token'],'test-token');
   if(mode==='fail')return r.fulfill({status:503,json:{error:'retry'}});
   return r.fulfill({json:{checkoutUrl:'https://www.zazzle.com/api/create/at-238446053942729400?pd=256629092171840156'}});
  }
  return r.fulfill({contentType:pathname.endsWith('.js')?'text/javascript':'text/html',body:fs.readFileSync(root+pathname+(pathname.endsWith('/')?'index.html':''))});
 });
 await context.route('https://challenges.cloudflare.com/**',r=>r.fulfill({contentType:'application/javascript',body:'window.turnstile={render:(selector,options)=>{window.testChallenge=options;return 1},remove:()=>{}}'}));
 await context.route('https://www.zazzle.com/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Mock Zazzle destination</h1>'}));
 await page.goto('https://konsil.ch/norefunds/receipt/');await page.locator('#order-area').waitFor({state:'visible'});
 assert.equal(await page.locator('#order').isDisabled(),true);
 assert.equal(attempts,0);
 await page.locator('#name').fill('Fiktiv Testperson');await page.locator('#age').fill('34');await page.locator('#consent').check();
 await page.locator('#order').click();await page.waitForFunction(()=>!!window.testChallenge);
 await page.evaluate(()=>window.testChallenge.callback('test-token'));
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Please try again'));
 assert.equal(attempts,1);if(!uploaded)uploaded=Buffer.from(await page.evaluate(()=>window.testUploaded));assert.equal(uploaded.readUInt32BE(16),1800);assert.equal(uploaded.readUInt32BE(20),7200);
 await page.evaluate(()=>{window.testChallenge=null});
 await page.locator('#order').click();await page.waitForFunction(()=>!!window.testChallenge);
 await page.locator('#consent').uncheck();await page.evaluate(()=>window.testChallenge.callback('test-token'));
 assert.equal(attempts,1);assert.equal(await page.locator('#order').isDisabled(),true);
 mode='success';await page.evaluate(()=>{window.testChallenge=null});await page.locator('#consent').check();await page.locator('#order').click();await page.waitForFunction(()=>!!window.testChallenge);
 await page.evaluate(()=>window.testChallenge.callback('test-token'));await page.waitForURL('https://www.zazzle.com/**');assert.equal(attempts,2);
 assert.deepEqual(errors,[]);
 console.log(label+': '+count+' combinations, portrait, no public download, low-resolution rejection, no external requests before consent; mocked consent/retry/cancel/redirect: PASS');await browser.close();
}})().catch(e=>{console.error(e);process.exit(1)});

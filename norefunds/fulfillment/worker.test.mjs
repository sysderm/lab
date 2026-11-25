import test from "node:test";
import assert from "node:assert/strict";
import worker, {validPng,zazzleLink} from "./worker.mjs";

const origin="https://konsil.ch", base="/norefunds/api/receipt";
const image=origin+base+"/"+("a".repeat(64))+".png";
function fixture(){
  // Structural PNG fixture, not a real compressed raster.
  const b=new Uint8Array(58),d=new DataView(b.buffer);
  b.set([137,80,78,71,13,10,26,10]);
  d.setUint32(8,13);d.setUint32(12,0x49484452);
  d.setUint32(16,1800);d.setUint32(20,7200);
  b[24]=8;b[25]=6;
  d.setUint32(33,1);d.setUint32(37,0x49444154);
  d.setUint32(46,0);d.setUint32(50,0x49454e44);
  for (const [at,n] of [[8,13],[33,1],[46,0]]) {
    let crc=0xffffffff;
    for(const byte of b.subarray(at+4,at+8+n)){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^(0xedb88320 & -(crc&1));}
    d.setUint32(at+8+n,(crc^0xffffffff)>>>0);
  }
  return b;
}
test("exact template link and single URL encoding",()=>{
  const url=new URL(zazzleLink(image));
  assert.equal(url.origin,"https://www.zazzle.com");
  assert.equal(url.pathname,"/api/create/at-238446053942729400");
  assert.equal(url.searchParams.get("pd"),"256629092171840156");
  assert.equal(url.searchParams.get("ed"),"false");
  assert.equal(url.searchParams.get("ax"),"Linkover");
  assert.equal(url.searchParams.get("tc"),"NoRefunds");
  assert.equal(url.searchParams.get("t_receipt_iid"),image);
  assert.equal(url.searchParams.has("rf"),false);
});
test("reject unexpected artwork hosts and path/query injection",()=>{
  for(const s of ["https://elsewhere.test/receipt.png",image+"?foo=bar",image+"#x",origin+"/norefunds/og.png",image.replace("https:","http:")]){
    assert.throws(()=>zazzleLink(s));
  }
});
test("structural dimensions and bounds",()=>{
  const b=fixture();
  assert.equal(validPng(b),true);
  const wrong=b.slice();new DataView(wrong.buffer).setUint32(16,1799);
  assert.equal(validPng(wrong),false);
  assert.equal(validPng(b.slice(0,-1)),false);
  assert.equal(validPng(new Uint8Array(100)),false);
  const oversized=new Uint8Array(16*1024*1024+1);
  assert.equal(validPng(oversized),false);
});
test("disabled and incompletely configured worker fails closed",async()=>{
  const r=await worker.fetch(new Request(origin+base+"/config"),{CHECKOUT_ENABLED:"true"});
  assert.deepEqual(await r.json(),{enabled:false});
  const p=await worker.fetch(new Request(origin+base,{method:"POST"}),{});
  assert.equal(p.status,503);
});
test("expired image is not returned, even if physical deletion is pending",async()=>{
  const r=await worker.fetch(new Request(image),{RECEIPTS:{get:async()=>({customMetadata:{expires:"0"},body:"private data"})}});
  assert.equal(r.status,404);
  assert.equal(r.headers.get("Cache-Control"),"private, no-store");
});
test("reject wrong origin and blocked IP before reading artwork",async()=>{
  const env={CHECKOUT_ENABLED:"true",RECEIPTS:{},UPLOAD_LIMIT:{limit:async()=>({success:false})},TURNSTILE_SITE_KEY:"test",TURNSTILE_SECRET:"test"};
  const headers={"Content-Type":"image/png","CF-Connecting-IP":"192.0.2.1"};
  const a=await worker.fetch(new Request(origin+base,{method:"POST",headers:{...headers,Origin:"https://elsewhere.test"}}),env);
  assert.equal(a.status,403);
  const b=await worker.fetch(new Request(origin+base,{method:"POST",headers:{...headers,Origin:origin}}),env);
  assert.equal(b.status,429);
});

test("CRC detects damaged image data",()=>{
  const bytes=fixture(); bytes[41]^=1;
  assert.equal(validPng(bytes),false);
});
function configured(){return {CHECKOUT_ENABLED:"true",RECEIPTS:{put:async()=>{}},UPLOAD_LIMIT:{limit:async()=>({success:true})},TURNSTILE_SITE_KEY:"test",TURNSTILE_SECRET:"secret"};}
function upload(bytes=fixture(),extra={}){return new Request(origin+base,{method:"POST",headers:{Origin:origin,"Content-Type":"image/png","CF-Connecting-IP":"192.0.2.1","X-Turnstile-Token":"fictional-token",...extra},body:bytes});}
test("verified upload, private retrieval, HEAD and expiry metadata",async t=>{
  t.mock.method(globalThis,"fetch",async()=>Response.json({success:true,hostname:"konsil.ch",action:"receipt_checkout"}));
  const env=configured();let saved;
  env.RECEIPTS.put=async(key,bytes,options)=>{saved={key,bytes,options};};
  const response=await worker.fetch(upload(),env);
  assert.equal(response.status,200);
  const result=await response.json(),link=new URL(result.checkoutUrl),imageUrl=link.searchParams.get("t_receipt_iid");
  assert.match(saved.key,/^[a-f0-9]{64}$/);
  assert.equal(new URL(imageUrl).pathname,base+"/"+saved.key+".png");
  assert.equal(saved.options.httpMetadata.cacheControl,"private, no-store");
  assert.equal(saved.options.customMetadata.expires,String(Date.parse(result.expiresAt)));
  assert.ok(Date.parse(result.expiresAt)>Date.now()+86300000);
  const object={body:saved.bytes,size:saved.bytes.length,customMetadata:saved.options.customMetadata};
  env.RECEIPTS.get=async()=>object;env.RECEIPTS.head=async()=>object;
  const get=await worker.fetch(new Request(imageUrl),env);
  assert.equal(get.status,200);assert.equal(get.headers.get("Referrer-Policy"),"no-referrer");
  assert.deepEqual(new Uint8Array(await get.arrayBuffer()),saved.bytes);
  const head=await worker.fetch(new Request(imageUrl,{method:"HEAD"}),env);
  assert.equal(head.status,200);assert.equal(await head.text(),"");
});
test("Turnstile rejects missing token, wrong hostname/action, denial and outage",async t=>{
  const env=configured();let writes=0;env.RECEIPTS.put=async()=>writes++;
  for(const result of [{success:false},{success:true,hostname:"elsewhere.test",action:"receipt_checkout"},{success:true,hostname:"konsil.ch",action:"wrong"}]){
    t.mock.method(globalThis,"fetch",async()=>Response.json(result));
    assert.equal((await worker.fetch(upload(),env)).status,403);
    t.mock.restoreAll();
  }
  assert.equal((await worker.fetch(upload(fixture(),{"X-Turnstile-Token":""}),env)).status,403);
  t.mock.method(globalThis,"fetch",async()=>{throw new Error("private upstream details");});
  const failed=await worker.fetch(upload(),env);assert.equal(failed.status,503);
  assert.equal((await failed.text()).includes("private upstream"),false);assert.equal(writes,0);
});
test("invalid bodies and storage failures do not return a checkout link",async t=>{
  t.mock.method(globalThis,"fetch",async()=>Response.json({success:true,hostname:"konsil.ch",action:"receipt_checkout"}));
  const env=configured();let writes=0;env.RECEIPTS.put=async()=>writes++;
  for(const bytes of [new Uint8Array(0),new Uint8Array(100),new Uint8Array(16*1024*1024+1)])assert.equal((await worker.fetch(upload(bytes),env)).status,400);
  assert.equal(writes,0);
  assert.equal((await worker.fetch(upload(fixture(),{"Content-Type":"text/plain"}),env)).status,415);
  env.RECEIPTS.put=async()=>{throw new Error("storage secret");};
  const failed=await worker.fetch(upload(),env);assert.equal(failed.status,503);
  assert.equal((await failed.text()).includes("storage secret"),false);
});

test("proxy requires configured shared secret and trusts only proxy client IP",async t=>{
  const url="https://receipt.example.workers.dev"+base;
  const secret="a".repeat(64), env={...configured(),PROXY_MODE:"true",PROXY_SHARED_SECRET:secret};
  assert.equal((await worker.fetch(new Request(url+"/config"),env)).status,404);
  assert.equal((await worker.fetch(new Request(url+"/config",{headers:{"X-Receipt-Proxy-Secret":secret}}),{...env,PROXY_SHARED_SECRET:""})).status,503);
  const config=await worker.fetch(new Request(url+"/config",{headers:{"X-Receipt-Proxy-Secret":secret}}),env);
  assert.equal(config.status,200);
  t.mock.method(globalThis,"fetch",async()=>Response.json({success:true,hostname:"konsil.ch",action:"receipt_checkout"}));
  let ip;env.UPLOAD_LIMIT.limit=async({key})=>{ip=key;return {success:true};};
  const headers={Origin:origin,"Content-Type":"image/png","X-Turnstile-Token":"test-token","X-Receipt-Proxy-Secret":secret,"X-Receipt-Client-IP":"192.0.2.99","CF-Connecting-IP":"192.0.2.1"};
  const response=await worker.fetch(new Request(url,{method:"POST",headers,body:fixture()}),env);
  assert.equal(response.status,200);assert.equal(ip,"192.0.2.99");
  assert.equal(new URL((await response.json()).checkoutUrl).searchParams.get("t_receipt_iid").startsWith(origin+base),true);
  delete headers['X-Receipt-Client-IP'];
  assert.equal((await worker.fetch(new Request(url,{method:"POST",headers,body:fixture()}),env)).status,503);
});

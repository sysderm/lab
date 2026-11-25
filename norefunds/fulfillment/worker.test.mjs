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

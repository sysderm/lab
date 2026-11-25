// Private, expiring print-artwork bridge for konsil.ch. No customer account or payment data.
// Do not deploy with CHECKOUT_ENABLED=true until the release checklist is satisfied.
const ORIGIN = "https://konsil.ch";
const BASE = "/norefunds/api/receipt";
const MAX_BYTES = 16 * 1024 * 1024;
const TTL_MS = 24 * 60 * 60 * 1000;
const WIDTH = 1800, HEIGHT = 7200;
const TEMPLATE = "256629092171840156";
const AMBASSADOR = "238446053942729400";
const HEADERS = {"Cache-Control":"private, no-store", "X-Content-Type-Options":"nosniff", "Referrer-Policy":"no-referrer"};

export function zazzleLink(imageUrl) {
  const image = new URL(imageUrl);
  if (image.origin !== ORIGIN || !new RegExp("^" + BASE + "/[0-9a-f]{64}\\.png$").test(image.pathname) || image.search || image.hash)
    throw new Error("Unexpected print image URL");
  const url = new URL("https://www.zazzle.com/api/create/at-" + AMBASSADOR);
  for (const [key,value] of Object.entries({
    pd:TEMPLATE, ed:"false", ax:"Linkover", tc:"NoRefunds", t_receipt_iid:image.href
  })) url.searchParams.set(key,value);
  return url.href;
}
const CRC_TABLE = Uint32Array.from({length:256}, (_, value) => {
  let crc=value;
  for(let bit=0;bit<8;bit++) crc=(crc>>>1)^(0xedb88320 & -(crc&1));
  return crc>>>0;
});
function crc32(bytes) {
  let crc=0xffffffff;
  for(const byte of bytes) crc=(crc>>>8)^CRC_TABLE[(crc^byte)&255];
  return (crc^0xffffffff)>>>0;
}
export function validPng(bytes) {
  if (bytes.length < 45 || bytes.length > MAX_BYTES) return false;
  if (![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return false;
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (d.getUint32(8)!==13 || d.getUint32(12)!==0x49484452 ||
      d.getUint32(16)!==WIDTH || d.getUint32(20)!==HEIGHT ||
      bytes[24]!==8 || ![2,6].includes(bytes[25]) ||
      bytes[26]!==0 || bytes[27]!==0 || bytes[28]!==0) return false;
  // Structural check: bounded chunks, valid final IEND. This is not a full PNG decoder.
  let offset=8, seenData=false, dataEnded=false;
  while (offset+12<=bytes.length) {
    const n=d.getUint32(offset), type=d.getUint32(offset+4);
    if (n>bytes.length-offset-12) return false;
    if (crc32(bytes.subarray(offset+4,offset+8+n))!==d.getUint32(offset+8+n)) return false;
    if (offset!==8 && type===0x49484452) return false;
    // Browser canvas emits RGB/RGBA PNG. Reject unknown critical chunks.
    if (![0x49484452,0x504c5445,0x49444154,0x49454e44].includes(type) && !(bytes[offset+4]&32)) return false;
    if (type===0x49444154) {if(dataEnded) return false; seenData=true;}
    else if(seenData) dataEnded=true;
    if (type===0x49454e44) return seenData && n===0 && offset+12===bytes.length;
    offset+=n+12;
  }
  return false;
}
async function boundedRead(request) {
  const declared=request.headers.get("Content-Length");
  if (declared!==null && (!/^\d+$/.test(declared) || Number(declared)>MAX_BYTES)) return null;
  if (!request.body) return null;
  const reader=request.body.getReader(); const parts=[]; let length=0;
  try {
    for (;;) {
      const {done,value}=await reader.read();
      if(done) break;
      length+=value.byteLength;
      if(length>MAX_BYTES){await reader.cancel();return null;}
      parts.push(value);
    }
  } finally {reader.releaseLock();}
  const result=new Uint8Array(length);let at=0;
  for(const part of parts){result.set(part,at);at+=part.byteLength;}
  return result;
}
function json(data,status=200) {
  return new Response(JSON.stringify(data),{status,headers:{...HEADERS,"Content-Type":"application/json; charset=utf-8"}});
}
function enabled(env) {
  return env.CHECKOUT_ENABLED==="true" && !!env.RECEIPTS && !!env.UPLOAD_LIMIT &&
    !!env.TURNSTILE_SITE_KEY && !!env.TURNSTILE_SECRET;
}
async function verified(token,env) {
  if(!token || token.length>2048) return false;
  const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token})
  });
  if(!response.ok) return false;
  const result=await response.json();
  return result.success===true && result.hostname==="konsil.ch" && result.action==="receipt_checkout";
}
async function handle(request,env) {
  const url=new URL(request.url);
  // In proxy mode the public workers.dev endpoint must never bypass nginx.
  const proxyMode=env.PROXY_MODE==="true";
  if(proxyMode) {
    if(!env.PROXY_SHARED_SECRET || env.PROXY_SHARED_SECRET.length<64) return json({error:"Unavailable"},503);
    if(request.headers.get("X-Receipt-Proxy-Secret")!==env.PROXY_SHARED_SECRET) return json({error:"Not found"},404);
  } else if(url.origin!==ORIGIN) return json({error:"Not found"},404);
  const path=url.pathname;
  if(path===BASE+"/config" && request.method==="GET") {
    return json(enabled(env)?{enabled:true,siteKey:env.TURNSTILE_SITE_KEY}:{enabled:false});
  }
  const imageMatch=path.match(/^\/norefunds\/api\/receipt\/([0-9a-f]{64})\.png$/);
  if(imageMatch && (request.method==="GET" || request.method==="HEAD")) {
    if(!env.RECEIPTS) return json({error:"Not found"},404);
    const object=request.method==="HEAD"?await env.RECEIPTS.head(imageMatch[1]):await env.RECEIPTS.get(imageMatch[1]);
    const expiry=Number(object?.customMetadata?.expires);
    if(!object || !Number.isFinite(expiry) || expiry<=Date.now()) return json({error:"Image expired or unavailable"},404);
    return new Response(request.method==="HEAD"?null:object.body,{headers:{
      ...HEADERS,"Content-Type":"image/png","Content-Length":String(object.size),
      "Content-Disposition":"inline; filename=\"receipt.png\""
    }});
  }
  if(path!==BASE || request.method!=="POST") return json({error:"Not found"},404);
  if(!enabled(env)) return json({error:"Checkout not enabled"},503);
  if(request.headers.get("Origin")!==ORIGIN) return json({error:"Forbidden"},403);
  if(request.headers.get("Content-Type")!=="image/png") return json({error:"PNG required"},415);
  const ip=request.headers.get(proxyMode?"X-Receipt-Client-IP":"CF-Connecting-IP");
  if(!ip) return json({error:"Unavailable"},503);
  const rate=await env.UPLOAD_LIMIT.limit({key:ip});
  if(!rate.success) return json({error:"Please try again later"},429);
  if(!await verified(request.headers.get("X-Turnstile-Token"),env)) return json({error:"Verification failed; retry"},403);
  const bytes=await boundedRead(request);
  if(!bytes || !validPng(bytes)) return json({error:"Invalid print file; expected 1800 x 7200 PNG, max 16 MB"},400);
  const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,"0")).join("");
  const expires=Date.now()+TTL_MS;
  await env.RECEIPTS.put(key,bytes,{httpMetadata:{contentType:"image/png",cacheControl:"private, no-store"},customMetadata:{expires:String(expires)}});
  return json({checkoutUrl:zazzleLink(ORIGIN+BASE+"/"+key+".png"),expiresAt:new Date(expires).toISOString()});
}
export default {async fetch(request,env) {
  try{return await handle(request,env);}
  catch{return json({error:"Checkout unavailable; please try again"},503);}
}};

import {buildReceipt,I18N} from '../calculator-model.js';
const plain=value=>String(value??'').replace(/&amp;/g,'&').replace(/<br\s*\/?>/gi,' · ').replace(/<[^>]*>/g,'');

export function renderEdition(canvas,input){
 const model=buildReceipt(input),ctx=canvas.getContext('2d',{alpha:false});
 const {paper,ink,accent,muted,panel,panelInk}=model.style;
 ctx.setTransform(canvas.width/450,0,0,canvas.height/1800,0,0);
 ctx.fillStyle=paper;ctx.fillRect(0,0,450,1800);
 function text(value,x,y,size=14,{align='left',max=380,color=ink,bold=false,face='mono'}={}){
  const s=plain(value);
  ctx.textBaseline='top';ctx.textAlign=align;ctx.fillStyle=color;
  const font=face==='display'?'"Arial Black", Arial, sans-serif':'"Courier New", monospace';
  ctx.font=(bold?'bold ':'')+size+'px '+font;
  while(ctx.measureText(s).width>max&&size>9){size-=.5;ctx.font=(bold?'bold ':'')+size+'px '+font;}
  ctx.fillText(s,x,y,max);
 }
 function rule(y){ctx.save();ctx.beginPath();ctx.setLineDash([4,4]);ctx.strokeStyle=muted;ctx.lineWidth=.8;ctx.moveTo(30,y);ctx.lineTo(420,y);ctx.stroke();ctx.restore();}
 const locale=I18N[model.contentLanguage]?.locale||'en-US';
 const ageLabel={en:'AGE',de:'ALTER',fr:'ÂGE',es:'EDAD',zh:'年龄'}[model.contentLanguage]||'AGE';
 const nameLabel={en:'ISSUED TO',de:'AUSGESTELLT FÜR',fr:'POUR',es:'PARA',zh:'开给'}[model.contentLanguage]||'ISSUED TO';
 text('NO REFUNDS.',225,32,57,{align:'center',bold:true,face:'display',max:390});
 text(model.title,225,106,22,{align:'center',bold:true,max:390});
 text(I18N[model.contentLanguage].meta1,225,140,13,{align:'center',color:muted});
 text(input.date||new Date().toISOString().slice(0,10),225,159,12,{align:'center',color:muted});
 rule(185);
 text(ageLabel+' '+new Intl.NumberFormat(locale).format(model.age),225,198,17,{align:'center',bold:true});
 const name=String(input.name||'').trim().slice(0,28);
 if(name)text(nameLabel+' '+name.toLocaleUpperCase(locale),225,225,17,{align:'center',bold:true,max:390});
 const top=name?257:232;
 const units=model.lines.map(item=>item.t==='hero'?145:item.t==='rule'?15:item.t==='sect'?28:item.t==='stamp'?84:item.t==='barcode'?57:item.t==='bnum'?25:item.t==='thanks'?51:33);
 const scale=(1724-top)/units.reduce((a,b)=>a+b,0);
 let y=top;const bounds=[];
 for(let index=0;index<model.lines.length;index++){
  const item=model.lines[index],height=units[index]*scale;
  bounds.push({type:item.t,top:y,bottom:y+height});
  if(item.t==='hero'){
   ctx.fillStyle=panel;ctx.fillRect(30,y+5*scale,390,height-10*scale);
   text(item.val,225,y+17*scale,Math.min(87,61*scale),{align:'center',bold:true,face:'display',color:panelInk,max:354});
   text(item.lab,225,y+97*scale,Math.min(22,15.5*scale),{align:'center',bold:true,color:panelInk,max:352});
  }else if(item.t==='rule')rule(y+6*scale);
  else if(item.t==='sect')text(item.lab,30,y+5*scale,13.5*scale,{color:accent,bold:true,max:390});
  else if(item.t==='stamp'){
   ctx.save();ctx.translate(225,y+42*scale);ctx.rotate(-.055);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(-178,-27*scale,356,54*scale);
   text(item.lab,0,-11*scale,21*scale,{align:'center',bold:true,color:accent,max:338});ctx.restore();
  }else if(item.t==='barcode'){
   // Decorative, non-scannable. Do not encode the purchaser's information.
   let seed=1234,cursor=61;ctx.fillStyle=ink;
   for(let bar=0;bar<44;bar++){seed=(seed*9301+49297)%233280;const w=1+seed%4;ctx.fillRect(cursor,y+3*scale,w,46*scale);cursor+=w+1+seed%3;}
  }else if(item.t==='bnum')text(item.lab,225,y+4*scale,11*scale,{align:'center',color:muted,max:385});
  else if(item.t==='thanks'){
   text(item.lab,225,y+5*scale,14.5*scale,{align:'center',bold:true,max:390});
   text('konsil.ch/norefunds',225,y+29*scale,10.5*scale,{align:'center',color:muted});
  }else{
   const color=item.cls?.includes('warn')?accent:ink;
   const size=item.cls?.includes('small')?13.5:15.5;
   text(item.lab,30,y+5*scale,size*scale,{max:226,color});
   text(item.val,420,y+5*scale,(item.cls?.includes('small')?13.5:17)*scale,{align:'right',max:155,color,bold:true});
  }
  y+=height;
 }
 rule(1749);text(model.disclaimer,225,1766,10.5,{align:'center',color:muted,max:395});
 return {model,bounds,scale};
}

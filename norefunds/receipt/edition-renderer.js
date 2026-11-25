import {buildReceipt,EDITIONS,I18N} from '../calculator-model.js';
const paper='#FAF8F0',ink='#2E2D29',red='#C0392B',muted='#5C5A52';
const plain=value=>String(value??'').replace(/&amp;/g,'&').replace(/<br\s*\/?>/gi,' · ').replace(/<[^>]*>/g,'');
export function renderEdition(canvas,input){
 const model=buildReceipt(input),ctx=canvas.getContext('2d',{alpha:false});
 ctx.setTransform(canvas.width/450,0,0,canvas.height/1800,0,0);
 ctx.fillStyle=paper;ctx.fillRect(0,0,450,1800);
 function text(value,x,y,size=14,{align='left',max=380,color=ink,bold=false}={}){
  const s=plain(value);ctx.textBaseline='top';ctx.textAlign=align;ctx.fillStyle=color;
  ctx.font=(bold?'bold ':'')+size+'px "Courier New", monospace';
  while(ctx.measureText(s).width>max&&size>9){size-=.5;ctx.font=(bold?'bold ':'')+size+'px "Courier New", monospace';}
  ctx.fillText(s,x,y,max);
 }
 function rule(y){ctx.save();ctx.beginPath();ctx.setLineDash([4,4]);ctx.strokeStyle='#8B887C';ctx.lineWidth=.8;ctx.moveTo(30,y);ctx.lineTo(420,y);ctx.stroke();ctx.restore();}
 text('NO REFUNDS',225,38,51,{align:'center',bold:true});
 text(EDITIONS[model.edition],225,100,17,{align:'center',bold:true});
 text('REGISTER 03 · CASHIER: TIME',225,132,11,{align:'center',color:muted});
 text((input.date||new Date().toISOString().slice(0,10))+' · ALL SALES FINAL',225,151,11,{align:'center',color:muted});
 rule(178);
 text('AGE '+model.age+' · WARRANTY '+model.exp+' YRS',225,193,13,{align:'center',bold:true});
 const name=String(input.name||'').trim().slice(0,28);
 if(name)text('ISSUED TO '+name.toLocaleUpperCase(),225,216,13,{align:'center'});
 const top=name?248:229;
 const units=model.lines.map(item=>item.t==='rule'?15:item.t==='sect'?30:item.t==='stamp'?96:item.t==='barcode'?65:item.t==='bnum'?28:item.t==='thanks'?68:item.cls?.includes('note')?32:27);
 const scale=Math.min(1.65,(1725-top)/units.reduce((a,b)=>a+b,0));
 let y=top;const bounds=[];
 for(let index=0;index<model.lines.length;index++){
  const item=model.lines[index],height=units[index]*scale;
  bounds.push({type:item.t,top:y,bottom:y+height});
  if(item.t==='rule')rule(y+6*scale);
  else if(item.t==='sect')text(item.lab,30,y+8*scale,12*scale,{color:muted});
  else if(item.t==='stamp'){
   ctx.save();ctx.translate(225,y+42*scale);ctx.rotate(-.09);ctx.strokeStyle=red;ctx.lineWidth=1.5;ctx.strokeRect(-153,-28*scale,306,57*scale);
   text('NO REFUNDS',0,-18*scale,27*scale,{align:'center',bold:true,color:red,max:290});text('ALL SALES FINAL',0,13*scale,9*scale,{align:'center',color:red});ctx.restore();
  }else if(item.t==='barcode'){
   let seed=item.weeks||1234,cursor=73;ctx.fillStyle=ink;
   for(let bar=0;bar<44;bar++){seed=(seed*9301+49297)%233280;const w=1+seed%4;ctx.fillRect(cursor,y+5*scale,w,48*scale);cursor+=w+1+seed%3;}
  }else if(item.t==='bnum')text(item.lab,225,y+4*scale,10*scale,{align:'center',color:muted});
  else if(item.t==='thanks'){
   text(plain(I18N[model.language].thanks),225,y+6*scale,11*scale,{align:'center'});
   text('★ konsil.ch/norefunds ★',225,y+37*scale,10*scale,{align:'center',color:muted});
  }else if(item.cls?.includes('note')){
   // Notes are not allowed to extend beyond the paper, even in translated editions.
   const words=plain(item.val).split(' '),lines=[''];
   for(const word of words){const last=lines.length-1;if((lines[last]+' '+word).length>65)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word;}
   lines.slice(0,2).forEach((line,i)=>text(line,420,y+(2+i*12)*scale,10*scale,{align:'right',color:muted}));
  }else{
   const color=item.cls?.includes('warn')?red:ink;
   text(item.lab,30,y+4*scale,13*scale,{max:235,color});
   text(item.val,420,y+4*scale,14*scale,{align:'right',max:143,color,bold:true});
  }
  y+=height;
 }
 rule(1749);text('Estimates, not prophecy. One life. No refunds.',225,1765,10,{align:'center',color:muted});
 return {model,bounds,scale};
}

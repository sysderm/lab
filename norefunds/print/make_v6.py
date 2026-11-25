"""Vector thermal receipt PDFs. Input is a private JSON list of {input, model, title}."""
import argparse, json, re, html, math
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from pypdf import PdfReader
from make_v2 import GLYPHS, ICONS, NAMES, plain, wrap
from pixel_icons import ICONS as DETAIL_ICONS, for_label
SECTION_ICONS={
 'clock':['0111110','1100011','1001001','1001101','1000001','1100011','0111110'],
 'heart':['0110110','1111111','1111111','0111110','0011100','0001000','0000000'],
 'coin':['0011100','0101010','1011101','1001001','1011101','0101010','0011100'],
 'mug':['1111100','1000100','1000111','1000101','1000111','0111000','1111100'],
 'candle':['0001000','0011100','0001000','0011100','0011100','0011100','0111110'],
 'bolt':['0001100','0011000','0111110','0001100','0011000','0110000','0100000'],
 'pill':['0011100','0100010','1000101','1001001','1010001','0100010','0011100'],
 'star':['0001000','0001000','1111111','0111110','0011100','0100010','1000001'],
}
def section_icon(label,edition):
 if 'STILL TO COME' in label:return ['0011110','0111000','1110000','1110001','1110011','0111110','0011100']
 if 'MONEY' in label:return SECTION_ICONS['coin']
 if 'PEOPLE' in label:return SECTION_ICONS['heart']
 if 'TIME' in label or 'LIFE USED' in label:return SECTION_ICONS['clock']
 if 'CONSUMPTION' in label:return SECTION_ICONS['mug']
 if 'FINAL' in label:return SECTION_ICONS['candle']
 if 'DETERIORATION' in label:return SECTION_ICONS['pill']
 return {'goth':ICONS['goth'],'sunny':SECTION_ICONS['star'],'medical':SECTION_ICONS['bolt']}.get(edition,SECTION_ICONS['mug'])
def main():
 ap=argparse.ArgumentParser();ap.add_argument('models');ap.add_argument('output');args=ap.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
 for entry in json.loads(Path(args.models).read_text()):
  data=entry['input'];model=entry['model'];ed=data['edition'];name=plain(data['name']);target=out/f'{name.lower()}-{NAMES[ed]}-4x16-v6.pdf'
  c=canvas.Canvas(str(target),pagesize=(288,1152),pageCompression=1);c.setTitle(f'LIFE RECEIPT / {ed} / {name} / V6');c.setAuthor('LIFE RECEIPT');c.setFillColor(HexColor('#F8F5EA'));c.rect(0,0,288,1152,fill=1,stroke=0)
  def text(s,y,size=10,x=18,align='left',inverse=False):
   s=plain(s);p=size/7;w=(len(s)*6-1)*p
   if align=='center':x-=w/2
   if align=='right':x-=w
   assert x>=11 and x+w<=277,(s,x,w)
   c.setFillColor(HexColor('#F8F5EA' if inverse else '#171713'))
   for j,ch in enumerate(s):
    assert ch in GLYPHS,(ch,s)
    for r,row in enumerate(GLYPHS[ch].split('/')):
     for col,v in enumerate(row):
      if v=='1':c.rect(x+j*6*p+col*p,1152-y-(r+1)*p,p*.94,p*.94,fill=1,stroke=0)
   # Searchable invisible companion text; visible artwork stays vector dot lettering.
   t=c.beginText(x,1152-y-size);t.setFont('Courier',size);t.setTextRenderMode(3);t.textOut(s);c.drawText(t)
  def rule(y):
   c.setFillColor(HexColor('#171713'))
   for x in range(18,270,6):c.rect(x,1152-y,3,1,fill=1,stroke=0)
  def draw_icon(grid,x,y,size,inverse=False):
   cell=size/max(len(grid),len(grid[0]));c.setFillColor(HexColor('#F8F5EA' if inverse else '#171713'))
   for r,row in enumerate(grid):
    for col,v in enumerate(row):
     if v=='1':c.rect(x+col*cell,1152-y-(r+1)*cell,cell,cell,fill=1,stroke=0)
  text('LIFE RECEIPT' ,20,23,x=144,align='center');text(entry['title'],54,9.5,x=144,align='center')
  icon=ICONS[ed];p=2.5;left=144-len(icon[0])*p/2
  for r,row in enumerate(icon):
   for col,v in enumerate(row):
    if v=='1':c.rect(left+col*p,1152-78-(r+1)*p,p,p,fill=1,stroke=0)
  flank={'standard':('mug','book'),'medical':('heart','lungs'),'goth':('ghost','candle'),'sunny':('heart','star')}[ed]
  draw_icon(DETAIL_ICONS[flank[0]],94,85,16);draw_icon(DETAIL_ICONS[flank[1]],178,85,16)
  text('ISSUED TO',112,9.5,x=144,align='center');text(name,131,34,x=144,align='center')
  text(f"AGE {model['age']} / PLAN {model['exp']} YRS",179,10,x=144,align='center')
  text(('BIRTHDAY ' if data.get('dateKind')=='birthday' else 'PRINTED ')+data['date'],199,9.5,x=144,align='center');rule(218)
  rows=[]
  def add(s,kind='line',align='left'):
   for part in wrap(s,27 if kind=='value' else 29):rows.append({'text':part,'kind':kind,'align':align})
  def pair(lab,val):
   # Numbers and their labels start at exactly the same y coordinate.
   # The label wraps within its own column, never below its numeric value.
   numeric=bool(re.fullmatch(r'(?:CHF )?[~]?[0-9][0-9,.]*[KMB]?(?: YRS| \(NO SELFIES\))?',val))
   if numeric or (val and len(val)<=12):
    size=10.1;pitch=6*size/7;valuewidth=(len(val)*6-1)*size/7
    chars=min(25,int((235-valuewidth-14)/pitch))
    assert chars>=10,(lab,val,chars)
    rows.append({'kind':'pair','labels':wrap(lab,chars),'value':val,'size':size})
   elif len(lab)+len(val)+2<=27:
    rows.append({'kind':'pair','labels':[lab],'value':val,'size':10.1})
   else:
    raise ValueError('Shorten the narrative pair rather than making a staircase: '+lab+' / '+val)
  # Deliberately playful editorial assumptions, not physiological predictions.
  days=round((model['exp']-model['age'])*365.25)
  moments={
   'standard':[
    ('BREATHS (NO SUBSCRIPTION)',f"~{days*20000/1000000:.1f}M"),
    ("GOOD NIGHTS' SLEEP",f"~{round(days*.7):,}"),
    ('ROLLS IN BED (NOT BREAD)',f"~{days*6:,}"),
    ("DAYDREAMS (BOSS CAN'T SEE)",f"~{days*3:,}"),
   ],
   'medical':[
    ('SIGHS OF RELIEF',f"~{days:,}"),
    ('STRETCHES (START-UP ROUTINE)',f"~{days*2:,}"),
    ('GOOSEBUMPS (GOOD MUSIC)',f"~{round(days/2):,}"),
    ('GRINS (NO LICENCE NEEDED)',f"~{days*3:,}"),
   ],
   'goth':[
    ('BREATHS IN EMPTY ROOMS',f"~{days*20000/1000000:.1f}M"),
    ('3AM CEILING INSPECTIONS',f"~{round(days*.13):,}"),
    ('DREAMS WITH AN EXTRA GUEST',f"~{round(days*.09):,}"),
    ('FLOORBOARDS (NO ONE HOME)',f"~{round(days*.17):,}"),
   ],
   'sunny':[
    ('BREATHS (FRESH AIR EXTRA)',f"~{days*20000/1000000:.1f}M"),
    ('GOOD NIGHTS (DREAM BIG)',f"~{round(days*.7):,}"),
    ('BED TURNS (COOL SIDE QUEST)',f"~{days*6:,}"),
    ("DAYDREAMS (DIRECTOR'S CUT)",f"~{days*3:,}"),
   ],
  }
  if ed=='medical':
   replacement=[
    {'t':'sect','lab':'BUILT-IN FEATURES / FICTION'},
    {'t':'li','lab':'HEARTBEATS (BUILT-IN DRUMS)','val':f"~{days*100000/1000000000:.1f}B"},
    {'t':'li','lab':'BREATHS (AUTO-RENEWAL)','val':f"~{days*20000/1000000:.1f}M"},
    {'t':'li','lab':'BLINKS (TINY INTERMISSIONS)','val':f"~{days*15000/1000000:.1f}M"},
    {'t':'li','lab':'YAWNS (SILENT APPLAUSE)','val':f"~{days*7:,}"},
    {'t':'rule'},
    {'t':'sect','lab':'THE QUIET NIGHT SHIFT'},
    {'t':'li','lab':'GOOD NIGHTS (SYSTEM RESET)','val':f"~{round(days*.7):,}"},
    {'t':'li','lab':'TURNS IN BED (NO REHEARSAL)','val':f"~{days*6:,}"},
    {'t':'li','lab':'PILLOW FLIPS (COOL SIDE)','val':f"~{days*2:,}"},
    {'t':'li','lab':'DAYDREAMS (NO REFERRAL)','val':f"~{days*3:,}"},
    {'t':'rule'},
   ]
   lines=[];skip=False
   for item in model['lines']:
    if item['t']=='sect' and item.get('lab')=='PARTS & LABOUR (FICTIONAL WARRANTY)':lines.extend(replacement);skip=True
    if skip and item['t']=='sect' and item.get('lab')=='MONEY, STILL INBOUND':skip=False
    if not skip:lines.append(item)
   model={**model,'lines':lines}
  elif ed=='goth':
   replacement=[
    {'t':'sect','lab':'AFTER DARK / FICTION'},
    {'t':'li','lab':'SHADOWS THAT MOVED?','val':f"~{round((model['exp']-model['age'])*13):,}"},
    {'t':'li','lab':'LOOKS OVER YOUR SHOULDER','val':f"~{round((model['exp']-model['age'])*24):,}"},
    {'t':'li','lab':'PORTRAITS MAKING EYE CONTACT','val':f"~{round((model['exp']-model['age'])*9):,}"},
    {'t':'rule'},
    {'t':'sect','lab':'THE UNEXPLAINED'},
    {'t':'li','lab':'LIGHTS ON','val':'JUST IN CASE'},
    {'t':'li','lab':'UPSTAIRS','val':'PROBABLY NOTHING'},
    {'t':'li','lab':'MIRROR','val':'YOU. PROBABLY.'},
    {'t':'rule'},
   ]
   lines=[];skip=False
   for item in model['lines']:
    if item['t']=='sect' and item.get('lab')=='THE DARK LEDGER (FICTIONAL EST.)':lines.extend(replacement);skip=True
    if skip and item['t']=='sect' and item.get('lab')=='MONEY, STILL INBOUND':skip=False
    if not skip:lines.append(item)
   model={**model,'lines':lines}
  skipping_money=False
  for item in model['lines']:
   k=item['t'];lab=plain(item.get('lab'));val=plain(item.get('val'))
   if k=='sect' and lab=='MONEY, STILL INBOUND':
    add('STILL TO COME / PLAYFUL EST.','section')
    for moment_label,moment_value in moments[ed]:pair(moment_label,moment_value)
    skipping_money=True
    continue
   if skipping_money:
    if k=='sect':
     rows.append({'kind':'rule'});skipping_money=False
    else:continue
   if k in ('barcode','bnum','stamp','thanks'):continue
   if k=='rule':rows.append({'kind':'rule'});continue
   if k=='sect':
    lab=lab.replace('TIME LEFT (NON-TRANSFERABLE)','TIME LEFT / NO TRANSFERS').replace('CONSUMPTION, REMAINING (EST.)','CONSUMPTION / EST.').replace('PARTS & LABOUR (FICTIONAL WARRANTY)','PARTS & LABOUR / FICTION').replace('SCHEDULED DETERIORATION (SATIRE)','DETERIORATION / SATIRE').replace('THE DARK LEDGER (FICTIONAL EST.)','THE DARK LEDGER / FICTION').replace('JOY INVENTORY (QUESTIONABLE EST.)','JOY INVENTORY / FICTION')
    for line in wrap(lab,27):add(line,'section')
   elif 'barline' in (item.get('cls') or ''):add(f"LIFE USED: {round(model['age']/model['exp']*100)}%",'section')
   elif not lab:
    if 'gross' in val.lower():add('GROSS / FLAT WAGE / TAXES EXTRA')
   else:
    if lab.startswith('FUTURE EARNINGS'):pair('ANNUAL INCOME',f"{data['currency']} {int(data['income']):,}")
    if lab=='SUBTOTAL':lab,val='TOTAL',"ALL YOU'LL EVER HAVE"
    elif lab=='CHANGE DUE':val='NONE'
    elif lab=='FIRST TIMES STILL AHEAD':lab,val='ADVENTURES','PRIVATE EDITION'
    elif lab=="TIMES YOU'LL FALL IN LOVE":lab,val='LOVE','1+ (ASK SPOUSE)'
    pair(lab,val)
    if lab=="TIMES YOU'LL SEE YOUR PARENTS":add(f"PARENTS {int(data['parentAge'])} / VISITS {int(data['visits'])}/YR")
  stamp=next(x for x in model['lines'] if x['t']=='stamp')
  rows=[r for i,r in enumerate(rows) if not(r['kind']=='rule' and (i==0 or rows[i-1]['kind']=='rule'))]
  def rowheight(row):
   return (len(row['labels'])*13.8+4.5) if row['kind']=='pair' else {'line':13.8,'value':15.8,'section':20,'rule':9}[row['kind']]
  natural=sum(map(rowheight,rows));factor=780/natural
  assert factor>=1,(ed,len(rows),factor)
  y=231;checks=[]
  for row in rows:
   k=row['kind'];h=rowheight(row)*factor
   if k=='rule':rule(y+3)
   elif k=='section':
    s=row['text'];c.setFillColor(HexColor('#171713'));c.rect(16,1152-y-12.5,256,15.5,fill=1,stroke=0)
    draw_icon(section_icon(s,ed),19,y+.5,9,inverse=True);text(s,y,9.5,x=33,inverse=True)
    if s.startswith('LIFE USED:'):
     used=round(model['age']/model['exp']*20);c.setStrokeColor(HexColor('#F8F5EA'));c.setFillColor(HexColor('#F8F5EA'));c.setLineWidth(.65)
     for cell in range(20):c.rect(169+cell*4.7,1152-y-9.5,3.1,8,fill=int(cell<used),stroke=1)
   elif k=='pair':
    size=row['size'];val=row['value'];rightstart=270-(len(val)*6-1)*size/7
    draw_icon(for_label(' '.join(row['labels'])),18,y,11)
    for i,label in enumerate(row['labels']):
     labelend=35+(len(label)*6-1)*size/7
     assert labelend+10<=rightstart,(label,val,labelend,rightstart)
     text(label,y+i*13.8,size,x=35)
    text(val,y,size,x=270,align='right');checks.append({'label':row['labels'],'value':val,'labelY':y,'valueY':y,'right':270})
   else:text(row['text'],y,10.1 if k=='line' else 11,x=270 if row['align']=='right' else 18,align=row['align'])
   y+=h
  assert all(r['labelY']==r['valueY'] and r['right']==270 for r in checks)
  assert y<=1012
  rule(1020)
  text('NO REFUNDS',1031,14,x=144,align='center')
  for i,line in enumerate(wrap(stamp['lab'],30)):text(line,1051+i*13,9.5,x=144,align='center')
  text('THANKS FOR LIVING,',1082,10.5,x=144,align='center');text('COME AGAIN!',1098,10.5,x=144,align='center')
  text('KONSIL.CH/NOREFUNDS / V6',1120,9.5,x=144,align='center')
  c.showPage();c.save();target.chmod(0o600)
  (out/(target.stem+'-alignment.json')).write_text(json.dumps(checks,indent=2))
  page=PdfReader(target).pages[0];assert tuple(map(float,(page.mediabox.width,page.mediabox.height)))==(288,1152);assert not page.images
  content=page.extract_text()
  assert name in content and 'PARENTS 86 / VISITS 4/YR' in content and 'V6' in content and 'LIFE RECEIPT' in content
  assert all(term not in content for term in ['MONEY, STILL INBOUND','ANNUAL INCOME','FUTURE EARNINGS','CHF','200,000','GROSS / FLAT WAGE'])
  assert all(moment_value in content for _,moment_value in moments[ed])
  assert 'PLAYFUL EST.' in content and 'NO REFUNDS' in content
  assert len(PdfReader(target).pages)==1
  assert 'TOTAL' in content and "ALL YOU'LL EVER HAVE" in content and 'NONE' in content and 'SUBTOTAL' not in content
  if ed=='medical':assert all(t not in content for t in ['COLONOSCOPIES','DETERIORATION','DENTIST VISITS','HEART ATTACK'])
  total=next(r for r in checks if r['label']==['TOTAL']);assert total['value']=="ALL YOU'LL EVER HAVE"
  if ed=='goth':
   for label in ['LIGHTS ON','UPSTAIRS','MIRROR']:assert any(r['label']==[label] for r in checks),label
  if ed=='goth':assert 'EXTRA GUEST' in ' '.join(content.split()) and 'FUNERALS' not in content
  print(target.name, f'{len(rows)} blocks; {len(checks)} same-baseline value pairs; bounds and 4x16 size verified')
if __name__=='__main__':main()

"""Vector thermal receipt PDFs. Input is a private JSON list of {input, model, title}."""
import argparse, json, re, html, math
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from pypdf import PdfReader
# Original 5x7 receipt alphabet; filled cells are vector squares, never enlarged pixels.
GLYPHS={
'A':'01110/10001/10001/11111/10001/10001/10001','B':'11110/10001/10001/11110/10001/10001/11110','C':'01111/10000/10000/10000/10000/10000/01111','D':'11110/10001/10001/10001/10001/10001/11110','E':'11111/10000/10000/11110/10000/10000/11111','F':'11111/10000/10000/11110/10000/10000/10000','G':'01111/10000/10000/10111/10001/10001/01111','H':'10001/10001/10001/11111/10001/10001/10001','I':'11111/00100/00100/00100/00100/00100/11111','J':'00111/00010/00010/00010/00010/10010/01100','K':'10001/10010/10100/11000/10100/10010/10001','L':'10000/10000/10000/10000/10000/10000/11111','M':'10001/11011/10101/10101/10001/10001/10001','N':'10001/11001/10101/10011/10001/10001/10001','O':'01110/10001/10001/10001/10001/10001/01110','P':'11110/10001/10001/11110/10000/10000/10000','Q':'01110/10001/10001/10001/10101/10010/01101','R':'11110/10001/10001/11110/10100/10010/10001','S':'01111/10000/10000/01110/00001/00001/11110','T':'11111/00100/00100/00100/00100/00100/00100','U':'10001/10001/10001/10001/10001/10001/01110','V':'10001/10001/10001/10001/10001/01010/00100','W':'10001/10001/10001/10101/10101/10101/01010','X':'10001/10001/01010/00100/01010/10001/10001','Y':'10001/10001/01010/00100/00100/00100/00100','Z':'11111/00001/00010/00100/01000/10000/11111',
'0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/10000/11110/00001/00001/11110','6':'01110/10000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00001/01110',
' ':'00000/00000/00000/00000/00000/00000/00000','-':'00000/00000/00000/11111/00000/00000/00000','.':'00000/00000/00000/00000/00000/00110/00110',',':'00000/00000/00000/00000/00110/00110/00100',':':'00000/00110/00110/00000/00110/00110/00000',"'":'00100/00100/00000/00000/00000/00000/00000','!':'00100/00100/00100/00100/00100/00000/00100','?':'01110/10001/00001/00010/00100/00000/00100','/':'00001/00010/00010/00100/01000/01000/10000','(':'00010/00100/01000/01000/01000/00100/00010',')':'01000/00100/00010/00010/00010/00100/01000','+':'00000/00100/00100/11111/00100/00100/00000','%':'11001/11010/00010/00100/01000/01011/10011','&':'01100/10010/10100/01000/10101/10010/01101','~':'00000/00000/01001/10110/00000/00000/00000','*':'00000/10101/01110/11111/01110/10101/00000','=':'00000/11111/00000/11111/00000/00000/00000'}
ICONS={
'goth':['0001111111000','0011111111100','0111111111110','0110011100110','0110011100110','0111111111110','0011101011100','0001111111000','0001010101000','0001111111000'],
'medical':['00011111000','00011111000','00011111000','11111111111','11111111111','11111111111','00011111000','00011111000','00011111000'],
'sunny':['0010001000100','0001001001000','1000111110001','0101111111010','0011101011100','1111111111111','0011011101100','0101100011010','1000111110001','0001001001000','0010001000100'],
'standard':['11111111111','10000000001','10111111101','10000000001','10101010101','10000000001','10101010101','10000000001','10111111101','10000000001','11111111111']}
NAMES={'standard':'lifetime','medical':'body-warranty','goth':'memento-mori','sunny':'sunshine'}
def plain(s):return html.unescape(re.sub('<[^>]*>','',str(s or ''))).upper().replace('\xa0',' ').replace('·','/').replace('—','-').replace('–','-')
def wrap(s,n):
 words=plain(s).split(); lines=['']
 for word in words:
  if len(lines[-1])+len(word)+bool(lines[-1])>n:lines.append(word)
  else:lines[-1]+=(' ' if lines[-1] else '')+word
 return [x for x in lines if x]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('models');ap.add_argument('output');args=ap.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
 for entry in json.loads(Path(args.models).read_text()):
  data=entry['input'];model=entry['model'];ed=data['edition'];name=plain(data['name']);target=out/f'{name.lower()}-{NAMES[ed]}-4x16-v2.pdf'
  c=canvas.Canvas(str(target),pagesize=(288,1152),pageCompression=1);c.setTitle(f'NO REFUNDS / {ed} / {name} / V2');c.setAuthor('NO REFUNDS');c.setFillColor(HexColor('#F8F5EA'));c.rect(0,0,288,1152,fill=1,stroke=0)
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
  text('NO REFUNDS',20,23,x=144,align='center');text(entry['title'],54,9.5,x=144,align='center')
  icon=ICONS[ed];p=2.5;left=144-len(icon[0])*p/2
  for r,row in enumerate(icon):
   for col,v in enumerate(row):
    if v=='1':c.rect(left+col*p,1152-78-(r+1)*p,p,p,fill=1,stroke=0)
  text('ISSUED TO',112,9.5,x=144,align='center');text(name,131,34,x=144,align='center')
  text(f"AGE {model['age']} / PLAN {model['exp']} YRS",179,10,x=144,align='center')
  text(('BIRTHDAY ' if data.get('dateKind')=='birthday' else 'PRINTED ')+data['date'],199,9.5,x=144,align='center');rule(218)
  rows=[]
  def add(s,kind='line',align='left'):
   for part in wrap(s,27 if kind=='value' else 29):rows.append((part,kind,align))
  for item in model['lines']:
   k=item['t'];lab=plain(item.get('lab'));val=plain(item.get('val'))
   if k in ('barcode','bnum','stamp','thanks'):continue
   if k=='rule':rows.append(('', 'rule','left'));continue
   if k=='sect':
    # The labels still distinguish calculated quantities from fictional humour.
    lab=lab.replace('CONSUMPTION, REMAINING (EST.)','CONSUMPTION / EST.').replace('PARTS & LABOUR (FICTIONAL WARRANTY)','PARTS & LABOUR / FICTION').replace('SCHEDULED DETERIORATION (SATIRE)','DETERIORATION / SATIRE').replace('THE DARK LEDGER (FICTIONAL EST.)','THE DARK LEDGER / FICTION').replace('JOY INVENTORY (QUESTIONABLE EST.)','JOY INVENTORY / FICTION')
    for line in wrap(lab,29):add(line,'section')
   elif 'barline' in (item.get('cls') or ''):add(f"LIFE USED: {round(model['age']/model['exp']*100)}%",'section')
   elif not lab:
    if 'gross' in val.lower():add('GROSS / FLAT WAGE / TAXES EXTRA')
    # A duplicated remaining-years note is intentionally omitted.
   else:
    if lab.startswith('FUTURE EARNINGS'):add('ANNUAL INCOME');add(f"{data['currency']} {int(data['income']):,}",'value','right')
    if len(lab)+len(val)+2<=29:add(lab+' '*(29-len(lab)-len(val))+val)
    else:
     for line in wrap(lab,29):add(line)
     for line in wrap(val,29):add(line,'value','right')
    if lab=="TIMES YOU'LL SEE YOUR PARENTS":
     add(f"PARENTS {int(data['parentAge'])} / VISITS {int(data['visits'])}/YR")
  # Distinct graphic closing, plus the requested exact common farewell.
  stamp=next(x for x in model['lines'] if x['t']=='stamp')
  rows=[r for i,r in enumerate(rows) if not(r[1]=='rule' and (i==0 or rows[i-1][1]=='rule'))]
  heights={'line':13.2,'value':15.6,'section':17.8,'rule':8}
  natural=sum(heights[k] for _,k,_ in rows);available=780
  factor=available/natural
  assert factor>=.95,(ed,len(rows),factor)
  y=231
  for s,k,a in rows:
   h=heights[k]*factor
   if k=='rule':rule(y+3)
   elif k=='section':
    c.setFillColor(HexColor('#171713'));c.rect(16,1152-y-12.5,256,15.5,fill=1,stroke=0);text(s,y,9.5,inverse=True)
   else:text(s,y,10.1 if k=='line' else 11,x=270 if a=='right' else 18,align=a)
   y+=h
  rule(1020)
  text(stamp['lab'],1031,12,x=144,align='center')
  for i,line in enumerate(wrap(stamp['val'],30)):text(line,1051+i*13,9.5,x=144,align='center')
  text('THANKS FOR LIVING,',1082,10.5,x=144,align='center');text('COME AGAIN!',1098,10.5,x=144,align='center')
  text('KONSIL.CH/NOREFUNDS / V2',1120,9.5,x=144,align='center')
  c.showPage();c.save();target.chmod(0o600)
  page=PdfReader(target).pages[0];assert tuple(map(float,(page.mediabox.width,page.mediabox.height)))==(288,1152);assert not page.images
  content=page.extract_text();assert name in content and '200,000' in content and 'PARENTS 86 / VISITS 4/YR' in content and 'V2' in content
  print(target.name, f'{len(rows)} text/rule rows; vector pixels; minimum glyph height 9.5pt; full page verified')
if __name__=='__main__':main()

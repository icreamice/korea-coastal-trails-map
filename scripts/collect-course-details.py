import concurrent.futures,json,pathlib,re,subprocess,time,html
from html.parser import HTMLParser
ROOT=pathlib.Path('/tmp/trail-course-details');ROOT.mkdir(exist_ok=True)
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,s):self.parts.append(s)
def clean(s):
 p=Text();p.feed(s);return re.sub(r'\s+',' ',' '.join(p.parts)).strip()
def parse(s):
 points=[]
 block=re.search(r'<ul class="point mb-0">(.*?)</ul>',s,re.S)
 if block:
  for li in re.findall(r'<li>(.*?)</li>',block[1],re.S):
   name=re.search(r'<span class="title">(.*?)</span>',li,re.S);km=re.search(r'<span class="km">(.*?)</span>',li,re.S)
   if name:points.append({'name':clean(name[1]),'nextDistance':clean(km[1]) if km else ''})
 facilities=[]
 block=re.search(r'<caption>편의시설 정보</caption>(.*?)</table>',s,re.S)
 if block:
  for row in re.findall(r'<tr>(.*?)</tr>',block[1],re.S):
   cells=re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>',row,re.S)
   if len(cells)>=2:facilities.append({'type':clean(cells[0]),'description':clean(cells[1])})
 stamp={'start':'','end':''}
 block=re.search(r'<span class="text-primary">스탬프 QR 위치</span>(.*?)<table',s,re.S)
 if block:
  for label,value in re.findall(r'<span>(시점|종점)</span>(.*?)</p>',block[1],re.S):stamp['start' if label=='시점' else 'end']=clean(value)
 return {'points':points,'facilities':facilities,'stamp':stamp}
cs=[]
for name in ['haeparang','namparang','seohaerang']:cs+=json.load(open('/tmp/'+name+'-courses.json'))['response']
def fetch(c):
 p=ROOT/(c['crs_idx']+'.html')
 if not p.exists():
  url='https://www.durunubi.kr/course-detail-view.do?crs_idx='+c['crs_idx']
  subprocess.run(['curl','-fsSL','--retry','2','--max-time','40',url,'-o',str(p)],check=True);time.sleep(.15)
 s=p.read_text();assert '주요지점 및 편의시설' in s,c['crs_Kor_Nm'];return c['crs_idx'],parse(s)
results={};failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 jobs={pool.submit(fetch,c):c for c in cs}
 for future in concurrent.futures.as_completed(jobs):
  try:k,v=future.result();results[k]=v
  except Exception as e:failures.append([jobs[future]['crs_idx'],str(e)])
  if (len(results)+len(failures))%50==0:print('Read',len(results),'courses;',len(failures),'failures',flush=True)
(ROOT/'details.json').write_text(json.dumps(results,ensure_ascii=False));print('DONE',len(results),'failures:',failures,flush=True)
if failures:raise SystemExit(1)

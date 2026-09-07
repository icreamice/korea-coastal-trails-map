import json,math,re,html,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
extra=json.load(open('/tmp/trail-course-details/details.json'));existing=json.load(open(ROOT/'app/courses.json'));old_regions={c['id']:c['region'] for c in existing}
def clean(s):return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
def distance(a,b):
 p1,p2=map(math.radians,[a[0],b[0]]);dp=p2-p1;dl=math.radians(b[1]-a[1]);h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 6371*2*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))
cs=[]
for trail,fn in [('HE','haeparang'),('NA','namparang'),('SEO','seohaerang')]:
 for c in json.load(open('/tmp/'+fn+'-courses.json'))['response']:
  number=re.search(r'길\s+([\d-]+)',c['crs_Kor_Nm'])[1];tracks=[];profile=[];km=0;prev=None
  for r in c['gpx']['road']:
   t=[];prev=None
   for p in r['track']:
    pos=[float(p['lat']),float(p['lon'])];t.append(pos)
    if prev:km+=distance(prev,pos)
    prev=pos
    ele=p.get('ele')
    if isinstance(ele,(int,float)) and math.isfinite(ele):profile.append([round(km,3),round(ele,1)])
   if len(t)>1:tracks.append(t)
  if len(profile)<2 or all(p[1]==0 for p in profile):profile=[]
  # Keep actual measured distances; never stretch the elevation profile to the advertised course length.
  if len(profile)>240:
   step=math.ceil(len(profile)/120);sample=[]
   for i in range(0,len(profile),step):
    batch=profile[i:i+step];sample.extend(sorted([min(batch,key=lambda p:p[1]),max(batch,key=lambda p:p[1])],key=lambda p:p[0]))
   profile=[profile[0]]+sample+[profile[-1]]
  id=c['crs_idx'];e=extra[id]
  cs.append(dict(id=id,trail=trail,number=number,order=c['orderNum'],name=c['crs_Kor_Nm'],region=old_regions.get(id,c['sigun']),location=c['sigun'],distance=c['crs_Dstnc'],minutes=int(c['crs_Totl_Rqrm_Hour']),difficulty=c['lev'],start=c.get('startAddress',''),end=c.get('endAddress',''),warning=clean(c.get('warning_notice','')),summary=[re.sub(r'^[-*]\s*','',line).strip() for line in clean(c.get('summary','')).splitlines() if line.strip()],tracks=tracks,elevation=profile,points=e['points'],facilities=e['facilities'],stamp=e['stamp']))
(ROOT/'app/courses.json').write_text(json.dumps(cs,ensure_ascii=False,separators=(',',':')))
print('Courses',len(cs),'with points',sum(bool(c['points']) for c in cs),'facilities',sum(bool(c['facilities']) for c in cs),'elevation',sum(bool(c['elevation']) for c in cs),'stamp',sum(bool(c['stamp']['start'] or c['stamp']['end']) for c in cs))
print('Example', {k:v for k,v in cs[0].items() if k not in ['tracks','elevation','summary']})

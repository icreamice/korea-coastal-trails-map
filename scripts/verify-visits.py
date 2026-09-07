import http.cookiejar,json,urllib.request,urllib.error,sqlite3,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
base='http://localhost:3000';cookies=http.cookiejar.CookieJar();client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies));client.open(base+'/signin-with-chatgpt?return_to=%2F').close()
ids=['T_CRS_MNG0000004239','T_CRS_MNG0000004939','T_CRS_MNG0000005378']
cs=json.load(open(root/'app/courses.json'));ids=[next(c['id'] for c in cs if c['trail']==t) for t in ['HE','NA','SEO']]+[next(c['id'] for c in cs if c['trail']=='SEO' and c['number']=='64-1')]
def req(method,payload=None,auth=True,origin=None):
 headers={'Content-Type':'application/json'}
 if origin:headers['Origin']=origin
 r=urllib.request.Request(base+'/api/visits',data=json.dumps(payload).encode() if payload is not None else None,headers=headers,method=method)
 try:
  response=(client if auth else urllib.request.build_opener()).open(r);return response.status,json.load(response)
 except urllib.error.HTTPError as e:
  raw=e.read().decode();return e.code,json.loads(raw) if raw.startswith('{') else {'error':raw}
assert req('GET',auth=False)[0]==401
assert req('PUT',{'courseId':ids[0],'visitedOn':'','note':''},auth=False)[0]==401
assert req('PUT',{'courseId':ids[0],'visitedOn':'','note':''},origin='https://other.example')[0]==403
before=req('GET')[1]['visits'];assert not any(v['courseId'] in ids for v in before),'Test records already exist; refusing to overwrite.'
try:
 for id in ids:
  status,b=req('PUT',{'courseId':id,'visitedOn':'2026-09-01','note':'검증용 기록'});assert status==200,(status,b)
 status,b=req('GET');assert len([v for v in b['visits'] if v['courseId'] in ids])==4
 status,b=req('PUT',{'courseId':ids[0],'visitedOn':'2026-09-02','note':'수정 검증'});assert status==200
 status,b=req('GET');entry=next(v for v in b['visits'] if v['courseId']==ids[0]);assert entry['visitedOn']=='2026-09-02' and entry['note']=='수정 검증'
 for date in ['2026-02-30','2099-01-01','bad']:
  assert req('PUT',{'courseId':ids[0],'visitedOn':date,'note':''})[0]==400
 assert req('PUT',{'courseId':'unknown','visitedOn':'','note':''})[0]==400
 assert req('PUT',{'courseId':ids[0],'visitedOn':'','note':'x'*1001})[0]==400
 # A fresh HTTP client with the same test account sees the persisted records.
 fresh=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies));got=json.load(fresh.open(base+'/api/visits'));assert len([v for v in got['visits'] if v['courseId'] in ids])==4
 print('PASS: authenticated create, update, read-back, fresh client, invalid inputs, and cross-origin rejection')
finally:
 for id in ids:
  status,b=req('DELETE',{'courseId':id});assert status==200,(status,b)
assert req('GET')[1]['visits']==before
# Exercise the exact prepared SQL with two account IDs; never write test identities into production.
s=(root/'lib/visits.ts').read_text();queries={k:re.search(k+r":'([^']+)'",s)[1] for k in ['list','save','remove']}
db=sqlite3.connect(':memory:');db.executescript((root/'drizzle/0000_faulty_stone_men.sql').read_text());db.execute(queries['save'],('a',ids[0],'2026-09-01','A','one'));db.execute(queries['save'],('b',ids[0],'2026-09-02','B','two'));db.execute(queries['save'],('a',ids[0],'2026-09-03','Updated A','three'));assert db.execute(queries['list'],('b',)).fetchone()[2]=='B';db.execute(queries['remove'],('a',ids[0]));assert db.execute(queries['list'],('a',)).fetchall()==[];assert len(db.execute(queries['list'],('b',)).fetchall())==1
print('PASS: account isolation, account-scoped deletion, test cleanup')

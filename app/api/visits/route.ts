import {getDatabase} from '../../../lib/db';
import {validateVisit,validateCourseId,visitSql,visitIdentity,validWriteRequest,type Visit} from '../../../lib/visits';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie'}});
export async function GET(request:Request){
 const user=visitIdentity(request);if(!user)return json({error:'계정 로그인이 필요합니다.'},401);
 try{const result=await getDatabase().prepare(visitSql.list).bind(user).all<Visit>();return json({visits:result.results});}
 catch{return json({error:'저장한 기록을 불러오지 못했습니다. 다시 시도해 주세요.'},503)}
}
async function body(request:Request){const raw=await request.text();if(raw.length>12000)throw new Error('기록 내용이 너무 깁니다.');try{return JSON.parse(raw)}catch{throw new Error('올바른 기록 형식이 아닙니다.')}}
export async function PUT(request:Request){
 const user=visitIdentity(request);if(!user)return json({error:'계정 로그인이 필요합니다.'},401);
 if(!validWriteRequest(request))return json({error:'허용되지 않은 저장 요청입니다.'},403);
 let value;try{value=validateVisit(await body(request))}catch(e){return json({error:e instanceof Error?e.message:'기록을 확인해 주세요.'},400)}
 const updatedAt=new Date().toISOString();
 try{await getDatabase().prepare(visitSql.save).bind(user,value.courseId,value.visitedOn,value.note,updatedAt).run();return json({visit:{...value,updatedAt}})}catch{return json({error:'저장하지 못했습니다. 입력 내용을 유지했으니 다시 시도해 주세요.'},503)}
}
export async function DELETE(request:Request){
 const user=visitIdentity(request);if(!user)return json({error:'계정 로그인이 필요합니다.'},401);
 if(!validWriteRequest(request))return json({error:'허용되지 않은 저장 요청입니다.'},403);
 let id;try{id=validateCourseId((await body(request))?.courseId)}catch{return json({error:'올바른 코스를 선택해 주세요.'},400)}
 try{await getDatabase().prepare(visitSql.remove).bind(user,id).run();return json({courseId:id,removed:true})}catch{return json({error:'기록을 삭제하지 못했습니다. 다시 시도해 주세요.'},503)}
}

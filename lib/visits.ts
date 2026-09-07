import courses from '../app/courses.json';
export type Visit={courseId:string;visitedOn:string;note:string;updatedAt:string};
const ids=new Set(courses.map(c=>c.id));
export function validateVisit(input:unknown){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('저장할 기록을 확인해 주세요.');
 const b=input as Record<string,unknown>;
 if(typeof b.courseId!=='string'||!ids.has(b.courseId))throw new Error('올바른 코스를 선택해 주세요.');
 if(typeof b.visitedOn!=='string'||typeof b.note!=='string'||b.note.length>1000)throw new Error('메모는 1,000자 이내로 입력해 주세요.');
 if(b.visitedOn){const d=new Date(b.visitedOn+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(b.visitedOn)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==b.visitedOn)throw new Error('올바른 방문일을 입력해 주세요.');if(b.visitedOn>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))throw new Error('방문일은 오늘까지 선택할 수 있습니다.');}
 return {courseId:b.courseId,visitedOn:b.visitedOn,note:b.note.trim()};
}
export function validateCourseId(id:unknown):string{if(typeof id!=='string'||!ids.has(id))throw new Error('올바른 코스를 선택해 주세요.');return id;}
export const visitSql={
 list:'SELECT course_id AS courseId, visited_on AS visitedOn, note, updated_at AS updatedAt FROM visits WHERE user_id = ? ORDER BY updated_at DESC',
 save:'INSERT INTO visits (user_id, course_id, visited_on, note, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, course_id) DO UPDATE SET visited_on = excluded.visited_on, note = excluded.note, updated_at = excluded.updated_at',
 remove:'DELETE FROM visits WHERE user_id = ? AND course_id = ?',
};
export function visitIdentity(request:Request):string|null{return request.headers.get('oai-authenticated-user-id')?.trim()||null;}
export function validWriteRequest(request:Request){
 if(request.headers.get('sec-fetch-site')==='cross-site')return false;
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return false;
 return request.headers.get('content-type')?.startsWith('application/json')===true;
}

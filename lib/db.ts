import {env} from 'cloudflare:workers';
export function getDatabase():D1Database{
 const db=(env as unknown as {DB?:D1Database}).DB;
 if(!db)throw new Error('기록 저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');
 return db;
}

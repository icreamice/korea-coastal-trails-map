export type Trail='HE'|'NA'|'SEO';
export type Course={id:string;trail:Trail;number:string;order:number;name:string;region:string;location:string;distance:number;minutes:number;difficulty:string;start:string;end:string;warning:string;summary:string[];tracks:number[][][];elevation:number[][];points:{name:string;nextDistance:string}[];facilities:{type:string;description:string}[];facilityGuidance?:string[];stamp:{start:string;end:string}};
export type Visit={courseId:string;visitedOn:string;note:string;updatedAt:string};
export const trails:{id:Trail;name:string;sub:string;url:string;color:string}[]=[{id:'HE',name:'해파랑길',sub:'부산 → 고성 · 동해안',url:'haeparang',color:'#087d91'},{id:'NA',name:'남파랑길',sub:'부산 → 해남 · 남해안',url:'namparang',color:'#276eb3'},{id:'SEO',name:'서해랑길',sub:'해남 → 강화 · 서해안',url:'seohaerang',color:'#9265ae'}];
export const duration=(n:number)=>`${Math.floor(n/60)}시간${n%60?` ${n%60}분`:''}`;

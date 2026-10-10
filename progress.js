// Completion belongs to this browser. It never unlocks unpublished pastoral teaching.
export function parseProgress(raw){
 try{const value=JSON.parse(raw);if(value?.version!==1||!Array.isArray(value.completed))return [];
 return [...new Set(value.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b);
 }catch{return []}
}
export function weekOpen(releaseAt,now=Date.now()){
 const stamp=Date.parse(releaseAt);return Number.isFinite(stamp)&&now>=stamp;
}
export function eligibleProgress(completed,lessons,now=Date.now()){
 return completed.filter(n=>weekOpen(lessons.find(l=>l.number===n)?.releaseAt,now));
}
export function toggleCompleted(completed,number,releaseAt,now=Date.now()){
 if(!Number.isInteger(number)||number<1||number>12||!weekOpen(releaseAt,now))return [...completed];
 return completed.includes(number)?completed.filter(n=>n!==number):[...completed,number].sort((a,b)=>a-b);
}
export function moduleCompleted(id,sessions,completed){
 const weeks=sessions.filter(s=>s.module===id);return weeks.length>0&&weeks.every(s=>completed.includes(s.number));
}
export function sessionArtOpen(number,releaseAt,completed,now=Date.now(),preview=false){
 return weekOpen(releaseAt,now);
}
export function storyOpen(id,sessions,completed,releaseAt,now=Date.now(),preview=false,policy='completion-or-calendar'){
 return preview||moduleCompleted(id,sessions,completed)||(policy==='completion-or-calendar'&&Number.isFinite(Date.parse(releaseAt))&&now>=Date.parse(releaseAt));
}

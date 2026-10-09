// A topic is a self-contained reading, never a doorway into the full module.
export function selectStoryTopic(reading, sectionId) {
 const section=reading?.sections?.find(s=>s.id===sectionId);
 if(!section)return null;
 const text=[section.title,...section.blocks.flatMap(b=>[b.reference||'',b.text])].join(' ');
 const wordCount=(text.match(/\b[\w]+(?:[’'-][\w]+)*\b/g)||[]).length;
 return {...section,wordCount,minutes:Math.ceil(wordCount/180)};
}

// Pointer effects only paint the border; touch scrolling retains browser control.
export function wireFrames(root) {
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 root.querySelectorAll('.journey-frame').forEach(frame=>{
  let pending=0,point=null;
  const update=e=>{
   point={x:e.clientX,y:e.clientY};
   if(pending)return;
   pending=requestAnimationFrame(()=>{
    pending=0;
    if(!frame.isConnected||!point)return;
    const r=frame.getBoundingClientRect();
    const x=(point.x-r.left)/r.width,y=(point.y-r.top)/r.height;
    frame.style.setProperty('--frame-angle',`${Math.atan2(y-.5,x-.5)*180/Math.PI+90}deg`);
   });
  };
  const reset=()=>{if(pending)cancelAnimationFrame(pending);pending=0;point=null;frame.style.removeProperty('--frame-angle');};
  frame.addEventListener('pointermove',update,{passive:true});
  frame.addEventListener('pointerdown',update,{passive:true});
  frame.addEventListener('pointerleave',reset,{passive:true});
  frame.addEventListener('pointercancel',reset,{passive:true});
  frame.addEventListener('touchmove',e=>{if(e.touches[0])update(e.touches[0]);},{passive:true});
  frame.addEventListener('touchend',reset,{passive:true});
 });
}

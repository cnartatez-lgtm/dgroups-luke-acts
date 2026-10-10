// The series has its own explicit, device-local animation preference.
export function motionEnabled() {
 return document.documentElement.dataset.motion !== 'off';
}

export function initMotion() {
 const root=document.documentElement,button=document.querySelector('#motion-toggle');
 const apply=value=>{
  root.dataset.motion=value==='off'?'off':'on';
  const on=motionEnabled();
  button.setAttribute('aria-pressed',String(on));
  button.setAttribute('aria-label',`Animations: ${on?'On':'Off'}`);
  button.title=on?'Turn animations off':'Turn animations on';
  button.innerHTML=`<span aria-hidden="true">${on?'Ⅱ':'▷'}</span> Animations: ${on?'On':'Off'}`;
  if(!on)document.querySelectorAll('.journey-frame,.section-banner,.series-hero-overlay').forEach(el=>{
   for(const name of ['--frame-angle','--scene-x','--scene-y'])el.style.removeProperty(name);
  });
 };
 apply(root.dataset.motion);
 button.addEventListener('click',()=>{
  const value=motionEnabled()?'off':'on';
  apply(value);
  try{localStorage.setItem('luke-acts-motion',value);}catch{/* The switch still works for this visit. */}
 });
 window.addEventListener('storage',e=>{if(e.key==='luke-acts-motion')apply(e.newValue);});
 const visibility=()=>{root.dataset.motionPaused=String(document.hidden);};
 visibility();document.addEventListener('visibilitychange',visibility);
}

// Move only the illustration; readable text and layout never follow the pointer.
// Dispose observers/listeners whenever the section is replaced.
export function wireSceneMotion(root) {
 const scenes=[...root.querySelectorAll('.section-banner,.series-hero-overlay')];
 const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
  for(const entry of entries)entry.target.classList.toggle('motion-visible',entry.isIntersecting);
 },{threshold:0.05});
 const cleanups=scenes.map(scene=>{
  let pending=0,point;
  const reset=()=>{
   if(pending)cancelAnimationFrame(pending);
   pending=0;point=null;
   scene.style.removeProperty('--scene-x');scene.style.removeProperty('--scene-y');
  };
  const move=e=>{
   if(!motionEnabled()||document.hidden)return;
   point={x:e.clientX,y:e.clientY};
   if(pending)return;
   pending=requestAnimationFrame(()=>{
    pending=0;
    if(!motionEnabled()||!scene.isConnected||!point)return;
    const r=scene.getBoundingClientRect();
    const x=Math.max(-.5,Math.min(.5,(point.x-r.left)/r.width-.5));
    const y=Math.max(-.5,Math.min(.5,(point.y-r.top)/r.height-.5));
    scene.style.setProperty('--scene-x',`${x*14}px`);
    scene.style.setProperty('--scene-y',`${y*10}px`);
   });
  };
  scene.addEventListener('pointermove',move,{passive:true});
  scene.addEventListener('pointerdown',move,{passive:true});
  scene.addEventListener('pointerleave',reset,{passive:true});
  scene.addEventListener('pointercancel',reset,{passive:true});
  scene.addEventListener('pointerup',reset,{passive:true});
  if(observer)observer.observe(scene);else scene.classList.add('motion-visible');
  return ()=>{
   reset();
   scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerdown',move);
   scene.removeEventListener('pointerleave',reset);scene.removeEventListener('pointercancel',reset);
   scene.removeEventListener('pointerup',reset);
  };
 });
 return ()=>{observer?.disconnect();cleanups.forEach(cleanup=>cleanup());};
}

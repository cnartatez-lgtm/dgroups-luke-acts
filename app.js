import {commentaryPreface,commentaryAuthority,commentaryIntroduction} from './commentary-intro.js?v=1a3fab2f0b59';
import {downloadGuides} from './download-guides.js?v=a62eed22c9e6';
import {initTutorials} from './home-tutorial.js?v=4110244381db';
import {initMotion,motionEnabled,wireSceneMotion} from './motion.js?v=6d63a91f8f2e';
import {englishTitleCase,selectStoryTopic,wireFrames} from './presentation.js?v=468c008fdb52';
import {pastoralIntroduction} from './pastoral.js?v=97b5548e6c86';
import {concepts,glossary,analyze,groupSessions} from './study.js?v=67ce7f787a2b';
import {glossaryForWeek} from './weekly-vocabulary.js?v=bcfd661af425';
import {groupDefinition,groupMeetingGuide} from './group-guide.js?v=b2aba6b8d1e0';
import {resources,methodGuide,categoryNotes} from './resources.js?v=b7478b074d63';
import {parseProgress,weekOpen,eligibleProgress,toggleCompleted,moduleCompleted,storyOpen} from './progress.js?v=55ac32a3ad57';
// Native keyboard and field behavior differs on iOS and Android. Layout follows the viewport.
const ua = navigator.userAgent;
if (/Android/i.test(ua) || navigator.userAgentData?.platform === 'Android') {
  document.documentElement.dataset.mobilePlatform = 'android';
  const viewport = document.querySelector('meta[name="viewport"]');
  viewport.content += ', interactive-widget=resizes-content';
} else if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
  document.documentElement.dataset.mobilePlatform = 'ios';
}
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const studyTitle = document.documentElement.lang === 'en' ? englishTitleCase : title => title;
const paragraphs=s=>String(s||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
// Format recurring labels and present related study ideas as optional; preserve lesson prose.
const commentaryParagraphs=s=>String(s||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${p.split('\n').map(line=>{
 const label=line.trim(),text=esc(line);
 if(/^Reflection Questions?:?$/i.test(label))return `<strong>${esc(studyTitle(label))}</strong>`;
 if(/^(?:Where these verses leads?|Optional Ideas to Explore):?$/i.test(label))return '<strong><em>Optional Ideas to Explore</em></strong>';
 return text.replace(/https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]+\b/g, url => `<a href="${url}">Spotify</a>`);
}).join('<br>')}</p>`).join('');
const storage={get(k,f){try{return localStorage.getItem('luke-acts-'+k)||f}catch{return f}},set(k,v){try{localStorage.setItem('luke-acts-'+k,v)}catch{}}};
let commentaryTextSize=Math.min(26,Math.max(14,Number(storage.get('commentary-size',16))||16));
function commentaryTextControls(){
 const dialog=$('#detail');dialog.classList.add('commentary-reader');
 const controls=document.createElement('div');controls.className='commentary-font-controls';
 controls.setAttribute('role','group');controls.setAttribute('aria-label','Commentary text size');
 controls.innerHTML='<span>Text Size</span><button type="button" class="icon-button" data-commentary-size="-2" aria-label="Smaller commentary text" aria-controls="dialog-body">A−</button><output aria-live="polite" aria-atomic="true"></output><button type="button" class="icon-button" data-commentary-size="2" aria-label="Larger commentary text" aria-controls="dialog-body">A+</button>';
 $('#close-dialog').before(controls);
 const update=()=>{dialog.style.setProperty('--commentary-size',commentaryTextSize+'px');controls.querySelector('output').textContent=commentaryTextSize+' px';controls.querySelector('[data-commentary-size="-2"]').disabled=commentaryTextSize<=14;controls.querySelector('[data-commentary-size="2"]').disabled=commentaryTextSize>=26;};
 controls.querySelectorAll('button').forEach(button=>button.onclick=()=>{commentaryTextSize=Math.min(26,Math.max(14,commentaryTextSize+Number(button.dataset.commentarySize)));storage.set('commentary-size',commentaryTextSize);update();});
 update();
}
const shapes={
  gate:'M2.5 21V5h4.4v2.5h10.2V5h4.4v16h-5.3v-5.7a4.2 4.2 0 0 0-8.4 0V21z M2.5 13H5m14 0h2.5M12 7.5v1.8',
  download:[
    // Stacked wooden chests with fitted lids and lashings.
    'M2.2 12.1h14.3l5 1.5v6.3l-5 1.6H2.2z M16.5 12.1v9.4 M2.2 14.8h14.3l5-1.2',
    'M5.4 15v6.3m7.6-6.3v6.3 M7.6 18.1q1-.6 2-.2t1.3.1',
    'M3.4 4.5h8.4l3.1 1.2v5.4l-3.1 1H3.4z M3.4 7h8.4l3.1-1.3 M11.8 4.5v7.6',
    'M19.6 2.3v6.6m-2.4-2.4 2.4 2.4L22 6.5'
  ].join(' '),
  magnifier:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM6.5 8a4 4 0 0 1 2-2M14.5 14.5l2 2M16 18l2-2 4 4-2 2ZM18.5 20.5l2-2',scroll:'M7 4h11a3 3 0 0 1 3 3v2h-5V7a2 2 0 0 1 2-2M7 4a3 3 0 0 0-3 3v10H2v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9M5 21a3 3 0 0 0 3-3v-1H4M8 9h5M8 12h6',lamp:'M5 14h13l3-3h-5M4 14c0 4 3 6 7 6s7-2 7-6M5 15H3a2 2 0 0 1 0-4h3M8 22h6M19 9c-3-2-1-4 0-6 2 2 3 4 0 6M14 5l-1-1M22 6h1',boat:'M3 16h18l-3 4H6ZM12 3v13M10 5 4 13h6ZM14 6v7h5ZM2 22c2-2 4 2 6 0s4 2 6 0 4 2 8 0',map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16',book:'M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3ZM12 6v15',words:'M4 6h16M4 12h11M4 18h7M18 10l3 3-3 3M21 13h-6',concepts:'M9 18h6M10 21h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3',comment:'M4 4h16v13H9l-5 4ZM8 8h8M8 12h5',link:'M10 14l4-4M8 16l-1 1a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0M16 8l1-1a4 4 0 0 1 5 5l-4 4a4 4 0 0 1-5 0',lock:'M5 10h14v11H5ZM8 10V7a4 4 0 0 1 8 0v3M12 14v3'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${shapes[n]||shapes.book}"/></svg>`;
const legacyViews={words:'tools',concepts:'story',commentaries:'studies'};
const navs=[['introduction','Introduction','Intro','gate'],['reading','Read the Text','Read','book'],['studies','Pastoral Commentaries','Pastoral','scroll'],['story','The Story So Far','Story','lamp'],['tools','Bible Study Tools','Tools','magnifier'],['resources','External Resources','Resources','boat'],['downloads','Downloads','Downloads','download']];
let curriculum,bible,passages,catalog,reflections,journey,weeklyStudy,approvedStories,storyPromise,referencePromise,modalVersion=0;
let completed=[],progressSaved=true,lastGateSignature='',releaseTimer;
const state={view:'introduction',week:Math.min(12,Math.max(1,Number(storage.get('week',1))||1)),rhythm:storage.get('rhythm','weekly'),showWord:storage.get('show-word','true')!=='false',category:'keywords',word:null,verse:null,context:true,tool:'words',size:Math.min(25,Math.max(16,Number(storage.get('size',20))||20)),module:'all',glossaryQuery:''};
if(!['weekly','fortnightly'].includes(state.rhythm))state.rhythm='weekly';
document.documentElement.classList.toggle('dark',storage.get('theme','light')==='dark');
function theme(){const dark=document.documentElement.classList.contains('dark');$('#theme').textContent=dark?'☀':'☾';$('#theme').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`)}
initMotion();
initTutorials(currentGroup, showToast);
let disposeSceneMotion=()=>{};
theme();$('#theme').onclick=()=>{document.documentElement.classList.toggle('dark');storage.set('theme',document.documentElement.classList.contains('dark')?'dark':'light');theme()};
document.documentElement.style.setProperty('--reading-size',state.size+'px');
const weekLabel=s=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',timeZone:'Europe/Paris'}).format(new Date(s.length===10?s+'T12:00:00Z':s))+' Week';
const moduleWeeks=id=>{const weeks=curriculum.sessions.filter(s=>s.module===id);return weeks.length===1?weekLabel(weeks[0].date):weekLabel(weeks[0].date)+' – '+weekLabel(weeks.at(-1).date);};
const session=()=>curriculum.sessions[state.week-1];
function currentGroup(){return groupSessions(curriculum.sessions,state.rhythm).find(g=>g.some(s=>s.number===state.week));}
const shortStudyDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short', timeZone: 'Europe/Paris'});
function weekOptionLabel([first, second]) {
 const dateLabel = study => shortStudyDate.format(new Date(study.date + 'T12:00:00Z'));
 if (!second) return `${dateLabel(first)} · ${first.passage}`;
 const sameMonth = first.date.slice(0, 7) === second.date.slice(0, 7);
 const start = sameMonth ? Number(first.date.slice(8, 10)) : dateLabel(first);
 return `${start} & ${dateLabel(second)} · Weeks ${first.number}–${second.number}`;
}
function tutorialButton() {
 const route = state.view;
 const name = navs.find(([id]) => id === route)[2];
 const id = route === 'reading' ? 'read' : route;
 return `<button type="button" id="${id}-tutorial-launch" class="read-tutorial-button" data-tutorial="${route}" aria-haspopup="dialog" aria-controls="home-tutorial">${name} Tutorial</button>`;
}
function heading(n,title,copy,tag=''){
 const badge=tag?`<span class="tag">${tag}</span>`:'';
 return `<div class="section-head"><div class="section-title"><span class="step">${n}</span><div><h2>${title}</h2><p>${copy}</p></div></div><div class="section-heading-actions">${badge}${tutorialButton()}</div></div>`;
}
function nav(){ $('#navigation').innerHTML=navs.map(([id,label,short,shape],i)=>`<a class="nav-item ${state.view===id?'active':''}" href="#${id}" ${state.view===id?'aria-current="page"':''} aria-label="${label}">${icon(shape)}<span class="nav-text"><span class="desktop-label">${label}</span><span class="mobile-label">${short}</span></span><small>0${i+1}</small></a>`).join('');}
function go(view,scroll=true){view=legacyViews[view]||view;state.view=navs.some(n=>n[0]===view)?view:'introduction';history.replaceState(null,'','#'+state.view);nav();render();$('#view .study-panel').classList.add('view-enter');if(scroll)$('#view').scrollIntoView({behavior:motionEnabled()?'smooth':'auto',block:'start'});}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&navs.some(n=>a.hash==='#'+n[0])){e.preventDefault();go(a.hash.slice(1));}});
window.addEventListener('hashchange',()=>go(location.hash.slice(1),false));
function pickWeek(n){if(state.week!==Number(n)){state.word=null;state.glossaryQuery='';}state.week=Number(n);state.verse=null;state.context=true;storage.set('week',state.week);}
function studySelector(){const groups=groupSessions(curriculum.sessions,state.rhythm);const index=groups.findIndex(g=>g.some(s=>s.number===state.week));return `<div class="study-selector"><div class="selector-fields"><label for="rhythm">Meeting Rhythm<select id="rhythm"><option value="weekly" ${state.rhythm==='weekly'?'selected':''}>Every Week</option><option value="fortnightly" ${state.rhythm==='fortnightly'?'selected':''}>Every Two Weeks</option></select></label><label for="week">${state.rhythm==='weekly'?'Study Week':'Two-Week Gathering'}<select id="week">${groups.map((g,i)=>`<option value="${g[0].number}" ${i===index?'selected':''}>${esc(weekOptionLabel(g))}</option>`).join('')}</select></label></div><div class="week-arrows"><button class="icon-button" data-week="${groups[index-1]?.[0].number||1}" ${index===0?'disabled':''} aria-label="Previous study">←</button><button class="icon-button" data-week="${groups[index+1]?.[0].number||12}" ${index===groups.length-1?'disabled':''} aria-label="Next study">→</button></div></div>${state.rhythm==='fortnightly'?'<p class="rhythm-note">Use the same three prompts for both passages. Carry the second week’s bridge question into your next gathering.</p>':''}`;}
function pastoralIntro(){return `<section class="pastoral-intro" aria-labelledby="pastoral-welcome"><div class="eyebrow">Growing Together in the Word</div><h3 id="pastoral-welcome">${esc(pastoralIntroduction.title)}</h3><p class="pastoral-welcome">${esc(pastoralIntroduction.welcome)}</p><p class="pastoral-credit">Each week, read the passage, then observe, interpret and apply it. At the end of each module, The Story So Far helps you look back and see how the scenes connect.</p></section>`;}
function intro() {
  const cards = curriculum.modules.slice(0, 3).map(module => {
    const firstWeek = curriculum.sessions.find(week => week.module === module.id);
    const question = artAvailable(firstWeek) ? module.question : openingLabel(firstWeek);
    return `<article class="module-card"><div class="module-body">
      <div class="eyebrow">Module ${module.id} · ${esc(moduleWeeks(module.id))}</div>
      <h3>${esc(moduleTitle(module))}</h3>
      <p class="big-question">${esc(question)}</p>
      <p>${esc(module.description)}</p>
    </div></article>`;
  }).join('');

  return `<div class="section-tutorial-heading"><h2>Introduction</h2>${tutorialButton()}</div>
    ${pastoralIntro()}
    <div class="intro-reading">
      <div class="guide-sections">
        ${groupDefinition}
        ${groupMeetingGuide}
      </div>
      <section class="intro-modules" aria-labelledby="intro-journey-title">
        <div class="section-subhead"><h3 id="intro-journey-title">Your Journey Through Act I</h3><span>October – December 2026</span></div>
        <div class="module-grid">${cards}</div>
      </section>
    </div>`;
}
function future(){return `<div class="future-act">${icon('lock')}<div><span class="eyebrow">Continuing in 2027</span><h3>Act II · The King Begins His Ministry</h3><p>Our journey will continue to Jerusalem, the cross, the resurrection and the witness of the church. These studies are not open yet. We will share the dates and teaching soon.</p></div><span class="tag">Locked</span></div>`;}
function highlighted(text,week=state.week){if(!state.word||!state.showWord||week!==state.week)return esc(text);const forms=[...state.word.forms].sort((a,b)=>b.length-a.length).map(f=>f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const re=new RegExp(`\\b(${forms.join('|')})(?:[’']s)?\\b`,'gi');let output='',last=0;for(const match of text.matchAll(re)){output+=esc(text.slice(last,match.index))+`<mark>${esc(match[0])}</mark>`;last=match.index+match[0].length;}return output+esc(text.slice(last));}
function chapter(s){return bible.chapters[s.book+'.'+s.chapter];}
function readVerses(s){return state.context?Object.entries(chapter(s).verses).map(([verse,text])=>({verse:Number(verse),text,key:`${s.book}.${s.chapter}.${verse}`})):s.verses;}
function reading(){
 return heading('02','Read the Text','Here is the whole chapter. This week’s passage is highlighted. Read it slowly, out loud if you can, and let the text lead your conversation.','WEB')+studySelector()+currentGroup().map(s=>{
  const m=curriculum.modules.find(m=>m.id===s.module),c=chapter(s);
  const verses=Object.entries(c.verses).map(([n,text])=>{const v=Number(n),focus=v>=s.start&&v<=s.end,key=`${s.book}.${s.chapter}.${v}`;let copy=highlighted(text,s.number);
   if(s.partialEnd&&v===s.end){const excerpt=s.verses.at(-1).text;copy=`<span class="study-verse-part">${highlighted(excerpt,s.number)}</span><span class="context-remainder">${highlighted(text.slice(excerpt.length),s.number)}</span>`;}
   return `${v===s.start?`<div class="passage-start" id="study-start-${s.number}" tabindex="-1"><span class="eyebrow">This Week’s Passage · ${esc(s.passage)}</span></div>`:''}<p id="verse-${s.number}-${v}" tabindex="-1" class="verse ${focus?'focus-verse':'context-verse'} ${s.partialEnd&&v===s.end?'partial-verse':''}"><span class="verse-num" aria-label="Verse ${v}">${v}</span>${copy}</p>`;
  }).join('');
  return `<article class="reading-session"><header class="reading-session-head"><span class="eyebrow">${weekLabel(s.date)} · ${moduleLabel(s.module)}</span><h3>${esc(sessionTitle(s))}</h3></header><div class="paper chapter-paper"><div class="reader-toolbar"><div><strong>${esc(c.book)} ${s.chapter} · Complete Chapter</strong><p class="annotation">The dark red line on the left marks ${esc(s.passage)}. The verses before and after help you see the context.</p><button class="text-link" data-study-jump="${s.number}">Jump to the study passage ↓</button></div><div class="type-tools"><button data-size="-1" aria-label="Smaller Bible text">A−</button><button data-size="1" aria-label="Larger Bible text">A+</button></div></div>${s.number===state.week?`<div class="word-highlight-control"><label><input type="checkbox" data-show-word ${state.showWord?'checked':''} ${state.word?'':'disabled'}><span>Show selected word from Bible Study Tools${state.word?` · <strong>${esc(state.word.word)}</strong>`:''}</span></label>${state.word?'':'<p class="annotation">Choose a keyword in Bible Study Tools and it will be highlighted here.</p>'}</div>`:''}<div class="reading-text">${verses}</div><div class="scripture-credit">World English Bible Classic · Public domain. Scripture wording is unchanged. ${s.partialEnd?'The study highlights only the opening clause of Micah 5:5; the rest of the verse remains visible.':''}</div></div>${sceneConnections(s)}<section class="reading-discussion"><h3>Talk About This Passage Together</h3>${questions(s)}</section><div class="reading-next">${s.number!==currentGroup().at(-1).number?'':s.number<12?`<button class="secondary-button" data-read="${s.number+1}">Continue to ${weekLabel(curriculum.sessions[s.number].date)} →</button>`:'<a class="secondary-button" href="#story">Return to The Story So Far →</a>'}</div></article>`;
 }).join('');
}
function verseLabel(key){const [b,c,v]=key.split('.');return `${bible.chapters[b+'.'+c]?.book||({'2Sam':'2 Samuel',Isa:'Isaiah',Mic:'Micah'}[b]||b)} ${c}:${v}`;}
const bookNames={Gen:'Genesis',Exod:'Exodus',Lev:'Leviticus',Num:'Numbers',Deut:'Deuteronomy',Josh:'Joshua',Judg:'Judges','1Sam':'1 Samuel','2Sam':'2 Samuel','1Kgs':'1 Kings','2Kgs':'2 Kings','1Chr':'1 Chronicles','2Chr':'2 Chronicles',Neh:'Nehemiah',Ps:'Psalms',Prov:'Proverbs',Eccl:'Ecclesiastes',Song:'Song of Solomon',Isa:'Isaiah',Jer:'Jeremiah',Lam:'Lamentations',Ezek:'Ezekiel',Dan:'Daniel',Hos:'Hosea',Obad:'Obadiah',Mic:'Micah',Nah:'Nahum',Hab:'Habakkuk',Zeph:'Zephaniah',Hag:'Haggai',Zech:'Zechariah',Mal:'Malachi',Matt:'Matthew',Rom:'Romans','1Cor':'1 Corinthians','2Cor':'2 Corinthians',Gal:'Galatians',Eph:'Ephesians',Phil:'Philippians',Col:'Colossians','1Thess':'1 Thessalonians','2Thess':'2 Thessalonians','1Tim':'1 Timothy','2Tim':'2 Timothy',Phlm:'Philemon',Heb:'Hebrews',Jas:'James','1Pet':'1 Peter','2Pet':'2 Peter','1John':'1 John','2John':'2 John','3John':'3 John',Rev:'Revelation'};
function refLabel(key){if(passages?.[key])return passages[key].label;const [a,b]=key.split('-');const [book,c,v]=a.split('.');const end=b?.split('.');return `${bookNames[book]||book} ${c}:${v}${b?'–'+(end[1]===c?end[2]:end[1]+':'+end[2]):''}`;}
function scopeSessions(){return [session()];}
function analysisVerses(){return scopeSessions().flatMap(s=>s.verses.map(v=>({...v,week:s.number,label:chapter(s).book+' '+s.chapter+':'+v.verse+(v.part||'')})));}

function toolsWeekSelector(){return `<div class="study-selector tools-week-selector"><label for="week">Study Week<select id="week">${curriculum.sessions.map(s=>`<option value="${s.number}" ${s.number===state.week?'selected':''}>${esc(weekOptionLabel([s]))}</option>`).join('')}</select></label><div class="week-arrows"><button class="icon-button" data-week="${state.week-1}" ${state.week===1?'disabled':''} aria-label="Previous study week">←</button><button class="icon-button" data-week="${state.week+1}" ${state.week===12?'disabled':''} aria-label="Next study week">→</button></div></div><p class="tools-passage-note">All three tools below use this week’s passage: <strong>${esc(session().passage)}</strong>.</p>`;}
function words(){const verses=analysisVerses(),list=analyze(verses,'keywords');let word=state.word?list.find(w=>w.word===state.word.word):list[0];state.word=word||null;const max=list[0]?.count||1;return '<h3 class="tool-heading">Repeated Words · Keywords</h3>'+`<p class="tool-help"><strong>Why Repeated Words Matter.</strong> When a writer repeats a word or a verb, he is usually showing us what is important. In Bible times, many people heard the text read aloud, and repetition helped them remember the main idea.</p><p class="tool-help">When you notice a word that comes back again and again, ask: Why does the writer repeat this? What does it show about God, about the people in the story, or about the main message?</p><p class="word-reading-notice"><strong>Choose a word below and it will be highlighted in Read the Text.</strong> To turn the highlight on or off, use the button “Show selected word from Bible Study Tools” on the reading page.${!state.showWord?' <strong>Highlighting is currently off.</strong>':''}</p><p class="info-note">The bigger the button, the more often the word appears in ${esc(session().passage)}. Similar forms of a word (for example “save” and “saved”) are counted together. The count is based on the English text, not on the original Hebrew or Greek.</p><div class="paper word-cloud">${list.slice(0,50).map(w=>{const ratio=w.count/max,tier=ratio>=.8?5:ratio>=.5?4:ratio>=.3?3:ratio>=.2?2:1;return `<button class="word-cloud-pill frequency-${tier} ${word?.word===w.word?'active':''}" data-word="${esc(w.word)}" aria-pressed="${word?.word===w.word}" aria-label="${esc(w.word)}, ${w.count} occurrences"><span>${esc(w.word)}</span><b>${w.count}</b></button>`}).join('')||'<p>No keywords repeat in this passage.</p>'}</div>${word?`<section class="word-insight" id="word-insight"><span class="eyebrow">In This Passage · ${esc(session().passage)}</span><h3>${esc(studyTitle(word.word))}</h3><div class="word-meaning">${paragraphs(word.definition)}</div><p class="annotation">This is only a reading help. Always compare it with the passage itself and with what your group observes.</p></section>`:''}`;}
const moduleLabel=id=>id===4?'Interlude':'Module '+id;
const moduleState=id=>{const source=reflections?.modules.find(m=>m.id===id),full=approvedStories?.modules.find(m=>m.id===id);return {...source,...(full?.reading?full:{}),id,releaseAt:journey.storyDates[id],released:Date.now()>=Date.parse(journey.storyDates[id]),available:storyAvailable(id)};};
const moduleTitle=m=>storyAvailable(m.id)?studyTitle(m.name):`${m.id===4?'Interlude':'Module'} unlocks on ${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(new Date(journey.storyDates[m.id]))}`;
const currentModule=()=>[...curriculum.sessions].reverse().find(s=>Date.now()>=Date.parse(lessonMeta(s)?.releaseAt))?.module||1;
const glossaryModule=g=>curriculum.sessions[g.week-1].module;
async function openModuleReading(id,sectionId){
 if(!storyAvailable(id))return;
 try{await ensureStories()}catch{showToast('The reading could not be loaded. Please try again.');return}
 const module=moduleState(id),reading=module?.reading,topic=selectStoryTopic(reading,sectionId);
 if(!module?.available||!topic)return;
 const blocks=topic.blocks.map(b=>b.kind==='quote'?`<blockquote class="module-scripture"><cite>${esc(b.reference)}</cite>${paragraphs(b.text)}</blockquote>`:b.kind==='heading'?`<h4>${esc(studyTitle(b.text))}</h4>`:paragraphs(b.text)).join('');
 openDialog(`Act I / Story / ${moduleLabel(id)}`,studyTitle(topic.title),
 `<div class="module-reading-meta">${topic.wordCount.toLocaleString('en-GB')} words · About ${topic.minutes} minutes</div><div class="module-reading-content"><section class="module-reading-section"><img src="./assets/${topic.image}" alt="${esc(topic.alt)}" width="1774" height="887">${blocks}</section></div><p class="pastoral-credit">${esc(reading.credit)}</p><p class="reading-return-note">Close this reading to return to the same place in ${esc(moduleLabel(id))}.</p>`);
}
function openConcept(index){const card=concepts[index];if(card)openModuleReading(card.module,'theme-'+index);}
function filterGlossary(){
 const q=state.glossaryQuery.trim().toLowerCase(),entries=glossaryForWeek(glossary,session());
 const found=entries.filter(g=>(g.word+' '+g.forms.join(' ')+' '+g.definition).toLowerCase().includes(q));
 $('#glossary-list').innerHTML=found.map(glossaryItem).join('')||'<p class="annotation">No matching terms for this passage. Try a different word.</p>';
 $('#glossary-status').textContent=`${found.length} of ${entries.length} terms · ${session().passage}`;
}

function jumpToGlossary(word){closeDialog();state.tool='glossary';state.glossaryQuery=word;go('tools',false);$('#glossary-search').focus({preventScroll:true});$('#glossary-heading').scrollIntoView({block:'start',behavior:motionEnabled()?'smooth':'auto'});const match=[...$('#glossary-list').querySelectorAll('details')].find(el=>el.querySelector('summary span').textContent===studyTitle(word));if(match)match.open=true;}
function moduleReflections(m){
 const ready=storyAvailable(m.id)&&moduleState(m.id).suppliedReflection;
 return `<section class="reflection-module minimal-story-module ${storyAvailable(m.id)?'is-open':'is-locked'}" aria-labelledby="reflection-module-${m.id}"><h3 id="reflection-module-${m.id}">${esc(moduleTitle(m))}</h3>${ready?`<button class="module-art module-reading-button" data-module-reflection="${m.id}" aria-label="Read ${esc(studyTitle(ready.title))}" aria-haspopup="dialog">${moduleArt(m)}<span class="module-reading-label">Read Reflection <span aria-hidden="true">↗</span></span></button>`:`<div class="module-art">${moduleArt(m)}</div>`}</section>`;
}
async function openSuppliedReflection(id){
 if(!storyAvailable(id))return;
 try{await ensureStories()}catch{showToast('The reading could not be loaded. Please try again.');return}
 const reflection=moduleState(id).suppliedReflection;
 if(!reflection)return;
 openDialog(`Act I / Story / ${moduleLabel(id)}`,studyTitle(reflection.title),
 `<div class="module-reading-content"><p><em>${esc(reflection.reference)}</em></p>${reflection.paragraphs.map(p=>paragraphs(p)).join('')}</div>`);
}
function conceptsView(){return heading('04','The Story So Far','Each week gives us one piece of the story. At the end of each module, we stop to put the pieces together, see what connects them, and see how they lead us to Jesus. It is a time to look back together before the next step.','3 Modules + Interlude')+curriculum.modules.map(moduleReflections).join('');}

function glossaryView(){return `<section class="pastoral-glossary" aria-labelledby="glossary-heading"><h3 id="glossary-heading">This Week’s Glossary</h3><p>Some words in the Bible had a special meaning in their own time. The glossary explains how a word or idea was understood when the passage was written, and gives the closest meaning for us today.</p><p>Why does this matter? It helps us hear the text as the first readers heard it, and keeps us from reading our own ideas into it. Some entries name a theme rather than an exact word in ${esc(session().passage)}. Use them as a starting point for your group’s conversation.</p><div class="glossary-tools weekly-glossary-search"><label for="glossary-search">Look Up a Word from This Passage<input id="glossary-search" type="search" placeholder="Search this week’s glossary…" value="${esc(state.glossaryQuery)}"></label></div><p id="glossary-status" class="glossary-count" role="status"></p><div id="glossary-list" class="glossary-list"></div></section>`;}

function glossaryItem(g){return `<details class="glossary-item"><summary><span>${esc(studyTitle(g.word))}</span><b aria-hidden="true">+</b></summary><div class="definition">${paragraphs(g.definition)}<p class="glossary-context">This Week’s Passage · ${esc(g.reference)}</p></div></details>`;}
function methodCards(){return `<div class="question-set">${weeklyStudy.method.map((m,i)=>`<section class="study-question"><span class="question-label">0${i+1} · ${esc(m.title)}</span><p>${esc(m.question)}</p></section>`).join('')}</div>`;}
function questions(s){if(!artAvailable(s))return methodCards()+`<section class="narrative-bridge"><span class="eyebrow">One Question to Carry Forward</span><p>${esc(openingLabel(s))}. Return then for this week’s question.</p></section>`;return methodCards()+`<section class="narrative-bridge"><span class="eyebrow">One Question to Carry Forward</span><p>${esc(weeklyStudy.sessions[s.number-1].bridgeQuestion)}</p><p class="bridge-invitation">${esc(weeklyStudy.discussionNote)}</p></section>`;}
function lessonMeta(s){
 const entry=catalog?.lessons?.find(l=>l.id===s.id);
 if(entry?.id==='luke-acts-08' && entry.status==='scheduled' && Date.now()>=Date.parse(entry.commentaryReleaseAt))
  return {...entry,status:'available',timed:true};
 return entry;
}
async function readTimedCommentary(){
 const [reader,response]=await Promise.all([import('./timed/reader.mjs'),fetch('./timed/week08.age')]);
 if(!response.ok)throw new Error('Missing scheduled commentary');
 const ciphertext=await response.text();
 for(let attempt=0;attempt<4;attempt++){
  try{return await reader.decryptLesson(ciphertext);}
  catch(error){if(attempt===3)throw error;await new Promise(resolve=>setTimeout(resolve,1000));}
 }
}
function statusCard(s){const l=lessonMeta(s);if(l?.status==='available')return `<div class="commentary-ready"><span>Pastoral commentary is available</span><button class="primary-button" data-lesson="${s.id}">Read Commentary ↗</button></div>`;return `<div class="awaiting-commentary">${icon('lock')}<div><strong>${l?.status==='scheduled'?'Commentary scheduled':'Waiting for content from Pastors'}</strong><p>For ${weekLabel(s.date)}. ${l?.status==='scheduled'?'Available during this study week.':'The reading and discussion guide are ready in Read the Text. The commentary will appear when the pastors have supplied it and this study week has begun.'}</p></div></div>`;}
function studiesView(){const selected=session();return `<div class="section-tutorial-heading"><h2>Weekly Commentaries</h2>${tutorialButton()}</div>`+progressSummary()+`<div class="pastoral-progress-control"><p class="eyebrow">${weekLabel(selected.date)} · ${esc(selected.passage)}</p>${completionControl(selected)}</div><section class="all-studies pastoral-studies"><div class="section-subhead"><h3>All Twelve Weeks</h3><label for="module-filter" class="sr-only">Filter study weeks by module</label><select id="module-filter"><option value="all">All Modules</option>${curriculum.modules.map(m=>`<option value="${m.id}" ${state.module===String(m.id)?'selected':''}>${m.id===4?'Interlude':'Module '+m.id}</option>`).join('')}</select></div><div class="pastoral-week-list">${curriculum.sessions.filter(s=>state.module==='all'||s.module===Number(state.module)).map(s=>{
 const open=artAvailable(s),available=lessonMeta(s)?.status==='available',current=s.number===selected.number;
 return `<article class="pastoral-week-row ${current?'current':''}" aria-label="${weekLabel(s.date)}"><button class="pastoral-week-select" data-pastoral-week="${s.number}" aria-pressed="${current}" aria-label="Select ${weekLabel(s.date)}: ${esc(sessionTitle(s))}">${sessionArt(s,true)}<span class="pastoral-week-copy"><span class="schedule-date">${weekLabel(s.date)}</span><strong>${esc(sessionTitle(s))}</strong><small>${esc(s.passage)}</small></span></button><div class="pastoral-week-action">${available?`<button class="primary-button" data-lesson="${s.id}" aria-label="Read Commentaries for ${weekLabel(s.date)}">Read Commentaries ↗</button>`:`<span class="pastoral-week-status">${icon('lock')}${open?'Commentary coming soon':esc(openingLabel(s))}</span>`}</div></article>`;
 }).join('')}</div></section>${future()}`;}
function resourcesView(){return heading('06','External Resources','Free websites that can help when you have a question the passage alone does not answer.','11 Tools')+`<section class="resource-intro"><h3>Start with Scripture. Then Explore.</h3><p>First read the passage and make your own observations. Then, if a question comes up, choose the website that fits it. These sites are not part of EIC Paris, so read them with care and always compare what you find with the Bible. Bring what you learn, and any questions that remain, to your group.</p></section>${['Historical setting','Study the passage','Places and words'].map((category,i)=>`<section class="resource-section"><h3>${esc(studyTitle(category))}</h3><p class="info-note resource-category-note">${esc(categoryNotes[category])}</p><div class="resource-grid">${resources.filter(r=>r[2]===category).map(([name,url,,copy])=>`<a class="resource-card" href="${url}" target="_blank" rel="noopener noreferrer"><h4 class="resource-brand">${esc(name.split(' · ')[0])}${name.includes(' · ')?`<span class="resource-service">${esc(name.split(' · ')[1])}</span>`:''}</h4><p>${copy}</p><small>${new URL(url).hostname}</small><span class="text-link">Open Resource ↗</span></a>`).join('')}</div></section>`).join('')}<section class="method-section"><h3>A Simple Guide for Your Time Together</h3><p>Simple steps for your group: observe, interpret, apply, encourage one another, pray and plan your next meeting.</p>${[...weeklyStudy.method.map(m=>[m.title,m.question]),...methodGuide.slice(3)].map(([title,copy],i)=>`<details class="method-detail"><summary><span>0${i+1} · ${title}</span><b>+</b></summary><p>${copy}</p></details>`).join('')}</section>`;}
function downloadsView() {
  const cards = downloadGuides.map(guide => {
    const id = guide.id;
    return `<article class="guide-card" data-download-guide="${id}" aria-labelledby="guide-title-${id}">
      <header class="guide-cover">
        <img class="guide-landscape" src="./assets/guides/panorama.webp" alt="" width="1036" height="326">
        <img class="guide-sheet" src="./assets/guides/${id}.webp" alt="" width="${id === 'study-print' ? 580 : 462}" height="820" loading="lazy" decoding="async">
        <div class="guide-cover-copy">
          <span class="guide-edition" id="guide-edition-${id}">${esc(guide.edition)}</span>
          <h3 id="guide-title-${id}">${esc(guide.title).replace('D-Groups', '<span class="guide-name-word">D-Groups</span>')}</h3>
        </div>
      </header>
      <div class="guide-details">
        <p>${esc(guide.description)}</p>
        <div class="guide-action">
          <span class="guide-format" id="guide-format-${id}">${esc(guide.format)} · ${guide.pages} pages</span>
          <a class="guide-download" href="./guides/${guide.filename}" download="${guide.filename}" aria-labelledby="guide-button-${id} guide-title-${id} guide-edition-${id}" aria-describedby="guide-format-${id}">${icon('download')}<span id="guide-button-${id}">Download</span></a>
        </div>
      </div>
    </article>`;
  }).join('');
  return heading('07', 'Downloads', 'Choose a PDF for your phone or print a guide for your next D-Group meeting.') + `<div class="guide-grid">${cards}</div>`;
}

function render(){if(!curriculum)return;disposeSceneMotion();$('.series-hero').hidden=state.view!=='introduction';updateLocation();$('#view').innerHTML=`<div class="study-panel">${sectionBanner()}${({introduction:intro,reading,tools:toolsView,story:conceptsView,studies:studiesView,resources:resourcesView,downloads:downloadsView}[state.view])()}</div>`;wire();wireFrames($('#view'));disposeSceneMotion=wireSceneMotion(document);lastGateSignature=gateSignature();scheduleWeekOpening();}
function openDialog(kicker,title,body){modalVersion++;$('#detail').classList.remove('commentary-reader');$('.commentary-font-controls')?.remove();$('#dialog-kicker').textContent=kicker;$('#dialog-body').innerHTML=`<h2 id="dialog-title">${esc(title)}</h2>${body}`;if(!$('#detail').open){document.documentElement.classList.add('dialog-open');$('#detail').showModal();}$('#detail').scrollTop=0;return modalVersion;}
function closeDialog(){modalVersion++;$('#detail').close();document.documentElement.classList.remove('dialog-open');}
$('#detail').addEventListener('close',()=>document.documentElement.classList.remove('dialog-open'));
$('#close-dialog').onclick=closeDialog;$('#detail').addEventListener('cancel',()=>modalVersion++);
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});

async function loadReferences(){if(passages)return passages;if(!referencePromise)referencePromise=fetchJSON('./references.json').then(data=>passages=data).catch(e=>{referencePromise=null;throw e});return referencePromise;}
async function openReference(ref){const version=openDialog('World English Bible',refLabel(ref),'<p role="status">Opening the connected passage…</p>');try{await loadReferences();if(version!==modalVersion||!$('#detail').open)return;const p=passages[ref];if(!p)throw Error('Missing reference');$('#dialog-body').innerHTML=`<h2 id="dialog-title">${esc(p.label)}</h2>${p.verses.map(v=>`<p class="scripture-quote"><sup>${v.chapter}:${v.verse}</sup>${esc(v.text)}</p>`).join('')}<p>Read the surrounding chapter before deciding how the passages connect.</p><a class="text-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Read the chapter at eBible.org ↗</a>`;wireModal();}catch{if(version===modalVersion)$('#dialog-body').innerHTML=`<h2 id="dialog-title">Unable to Load This Passage</h2><p>Please check your connection and try again.</p><button class="primary-button" data-ref="${ref}">Try again</button>`;wireModal();}}
function guide(n){const s=curriculum.sessions[n-1];openDialog(`${weekLabel(s.date)}`,sessionTitle(s),`<p>${esc(s.passage)}</p>${questions(s)}<button class="primary-button" data-study="${s.number}">Open the study page</button>`);wireModal();}
async function openLesson(id){const l=lessonMeta({id});if(l?.status!=='available')return;const version=openDialog('Pastoral Commentary',studyTitle(l.title),'<p role="status">Opening commentary…</p>');try{const data=l.timed?await readTimedCommentary():await fetchJSON(`${$('meta[name="lesson-base"]').content}/${encodeURIComponent(id)}/lesson.json`,{cache:'no-store'});if(version!==modalVersion||!$('#detail').open)return;commentaryTextControls();$('#dialog-body').innerHTML=`<h2 id="dialog-title">${esc(studyTitle(data.title))}</h2><section class="commentary-opening" aria-labelledby="commentary-opening-title"><h3 id="commentary-opening-title">Before You Begin</h3>${commentaryParagraphs(commentaryPreface)}<p class="commentary-authority"><strong>${esc(commentaryAuthority)}</strong></p></section>${commentaryParagraphs(commentaryIntroduction(data.introduction))}${data.points.map((p,i)=>`<section><h3>${i+1}. ${esc(studyTitle(p.title))}</h3><div class="point-reference">${esc(p.reference)}</div>${p.image?`<img src="${$('meta[name="lesson-base"]').content}/${id}/${encodeURIComponent(p.image)}" alt="${esc(p.alt)}" loading="lazy">`:''}${commentaryParagraphs(p.text)}</section>`).join('')}${data.finalWord?`<h3>A Final Word</h3>${commentaryParagraphs(data.finalWord)}`:''}<p class="annotation">Teaching supplied by the pastors of EIC Paris.</p>`;}catch{if(version===modalVersion)$('#dialog-body').innerHTML='<h2 id="dialog-title">Commentary Unavailable</h2><p>Please try again later. The teaching may not yet be available for this study week.</p>';}}
function wireModal(){ $('#dialog-body').querySelectorAll('[data-glossary-jump]').forEach(b=>b.onclick=()=>jumpToGlossary(b.dataset.glossaryJump)); $('#dialog-body').querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>openReference(b.dataset.ref));$('#dialog-body').querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>{closeDialog();pickWeek(b.dataset.study);go('studies')});$('#dialog-body').querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>{closeDialog();pickWeek(b.dataset.read);go('reading')});}
function wire(){
 document.querySelectorAll('[data-module-reflection]').forEach(b=>b.onclick=()=>openSuppliedReflection(Number(b.dataset.moduleReflection)));
 document.querySelectorAll('[data-module-jump]').forEach(b=>b.onclick=()=>$('#reflection-module-'+b.dataset.moduleJump).scrollIntoView({block:'start',behavior:motionEnabled()?'smooth':'auto'}));
 $('[data-glossary-all]')?.addEventListener('click',()=>{state.glossaryQuery='';render();$('#glossary-search').focus({preventScroll:true});$('#glossary-heading').scrollIntoView({block:'start'})});
 $('#week')?.addEventListener('change',e=>{pickWeek(e.target.value);render();$('#week').focus({preventScroll:true})});
 $('#rhythm')?.addEventListener('change',e=>{state.rhythm=e.target.value;storage.set('rhythm',state.rhythm);state.word=null;state.verse=null;render();$('#rhythm').focus({preventScroll:true})});
 document.querySelectorAll('[data-week]').forEach(b=>b.onclick=()=>{pickWeek(b.dataset.week);render()});
 document.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>{pickWeek(b.dataset.read);go('reading')});
 document.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>{pickWeek(b.dataset.study);go('studies')});
 document.querySelectorAll('[data-module]').forEach(b=>b.onclick=()=>{const m=Number(b.dataset.module);pickWeek(curriculum.sessions.find(s=>s.module===m).number);state.module=String(m);go('studies')});
 $('[data-open-classes]')?.addEventListener('click',()=>go('studies'));
 $('#context')?.addEventListener('change',e=>{state.context=e.target.checked;render();$('#context').focus()});
 document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{state.size=Math.min(25,Math.max(16,state.size+Number(b.dataset.size)));storage.set('size',state.size);document.documentElement.style.setProperty('--reading-size',state.size+'px')});

 document.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>openReference(b.dataset.ref));
 document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>guide(Number(b.dataset.guide)));
 document.querySelectorAll('[data-show-word]').forEach(b=>b.onchange=()=>{state.showWord=b.checked;storage.set('show-word',String(state.showWord));const index=[...document.querySelectorAll('[data-show-word]')].indexOf(b);render();document.querySelectorAll('[data-show-word]')[index]?.focus({preventScroll:true});});
 document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{state.word=analyze(analysisVerses(),'keywords').find(w=>w.word===b.dataset.word);render();$(`[data-word="${state.word.word}"]`)?.focus({preventScroll:true});$('#word-insight').scrollIntoView({block:'nearest',behavior:motionEnabled()?'smooth':'auto'})});
 document.querySelectorAll('[data-hit]').forEach(b=>b.onclick=()=>{const [week,verse]=b.dataset.hit.split(':').map(Number);const word=state.word;pickWeek(week);state.word=word;state.rhythm='weekly';storage.set('rhythm','weekly');state.verse=`${session().book}.${session().chapter}.${verse}`;go('reading',false);requestAnimationFrame(()=>{$(`#verse-${week}-${verse}`)?.scrollIntoView({block:'center'});$(`#verse-${week}-${verse}`)?.focus({preventScroll:true})})});
 document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>openConcept(Number(b.dataset.concept)));
 wireJourney();
 if($('#glossary-list'))filterGlossary();
 $('#glossary-search')?.addEventListener('input',e=>{state.glossaryQuery=e.target.value;filterGlossary()});
 document.querySelectorAll('[data-pastoral-week]').forEach(b=>b.onclick=()=>{pickWeek(b.dataset.pastoralWeek);render();document.querySelector(`[data-pastoral-week="${state.week}"]`)?.focus({preventScroll:true});});
 document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{const id=b.dataset.lesson;const s=curriculum.sessions.find(s=>s.id===id);if(state.view==='studies'&&s){pickWeek(s.number);render();document.querySelector(`[data-lesson="${id}"]`)?.focus({preventScroll:true});}openLesson(id);});
 $('#module-filter')?.addEventListener('change',e=>{state.module=e.target.value;render();$('#module-filter').focus({preventScroll:true})});
}
$('#sources').onclick=()=>openDialog('D-Groups · About','Growing Together in the Word.',`<section class="about-credits"><h3>Pastoral Team</h3><p><strong>EIC Rueil-Malmaison:</strong><br>Jeff Walters — Senior Pastor<br>Christian Nartatez — Associate Pastor</p><p><strong>EIC Rive Gauche:</strong><br>John Hugh — Senior Pastor</p><h3>Developed By</h3><p>The Graphic Department at EIC Paris</p></section><h3>Scripture</h3><p>The <a href="https://ebible.org/eng-web/" target="_blank" rel="noopener noreferrer">World English Bible Classic</a> is in the public domain. This app contains the twelve Act I readings and their seven surrounding chapters. Scripture is reproduced from the official eBible archive, without editorial headings or footnote markers. Micah 5:5a is an excerpt; its full verse is available in chapter context.</p><h3>Supporting Scenes</h3><p>Each study includes two selected WEB passages to help explore the module question and the final Narrative Bridge. These passages use the existing Scripture imports without rewriting them. The short hints on the cards are editorial reading aids; participants can follow other observations and applications that arise from the texts.</p><h3>TSK-Based Cross References</h3><p>The <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener noreferrer">OpenBible.info dataset</a> draws primarily on the Treasury of Scripture Knowledge and includes additional connections. The imported source includes 3,333 rows for the seven context chapters, with 2,733 distinct WEB passages. TSK Bible Concordance displays six selected connections from each weekly study passage. Each connection keeps its source verse and adds a brief editorial explanation; these explanations were not supplied by TSK. The dataset is used under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>, with an editorial selection for the twelve study passages. A cross reference is a starting point for comparison, not proof that two passages have identical meanings.</p><h3>Curriculum and Resources</h3><p>The twelve passages, narrative journey and module introductions come from EIC Paris’s “DGroups Curriculum Framework: From Bethlehem to the Nations, Act I”, dated October–December 2026. The three brief discussion prompts are adapted from the observation, interpretation and application sections of the D-Groups 1 Peter guide. Its 2025 dates and readings do not apply to this series. One condensed Narrative Bridge question is kept for each week. Resource links come from both pages of the Bible Study Resources guide.</p><h3>Weekly Vocabulary</h3><p>Keyword notes follow the selected weekly passage. The glossary selects related concepts, including headings not printed verbatim in that passage. Historical setting is explained through the biblical accounts: for example, 2 Kings 15:29, 1 Chronicles 24, Exodus 30:7–8 and Leviticus 12. These editorial reading aids distinguish English repetition from original-language word study and offer comparisons with Luke–Acts for discussion.</p><h3>Study Notes and Pastoral Teaching</h3><p>The study notes, teaching texts and pastoral commentaries are developed by Associate Pastor Christian Nartatez at EIC Rueil-Malmaison, under the supervision of the Senior Pastors of EIC Paris.</p><h3>Illustrations and Design</h3><p>The Low Poly illustrations with cel-style shading were generated with AI as symbolic illustrations, not archaeological reconstructions. The design follows the D-Groups and EIC Paris study apps.</p><h3>Your Preferences</h3><p>Completed studies, meeting rhythm, selected week, word highlighting, theme, animation preference, Bible reading size and commentary text size stay in this browser. Animations start on; use Animations: On / Off at the top to choose a still view at any time. Progress is not synced between devices; clearing browser site data removes it. If storage is unavailable, completion lasts only for the current visit. Review-edition progress is kept separate. Each week’s title, illustration, narrative question and completion button open on Monday at 06:00 Paris time. Completion cannot reveal a future week. Module reflections open after the module is completed or its study period has ended. They do not change the pastoral commentary release calendar. This app does not collect names or shared notes. Act II and later teaching are not included.</p>`);
async function fetchJSON(url,options){const r=await fetch(url,options);if(!r.ok)throw Error(`${r.status}`);return r.json();}
async function loadReflections(){
 const url=$('meta[name="reflection-catalog"]').content;
 const next=await fetchJSON(url,{cache:'no-store'});
 reflections=next;
 approvedStories=null;storyPromise=null;
}
async function refreshReleases(){
 if(!curriculum)return;
 const before=JSON.stringify(reflections),beforeCatalog=JSON.stringify(catalog);
 try{await loadReflections();catalog=await fetchJSON($('meta[name="lesson-catalog"]').content,{cache:'no-store'});if(curriculum.modules.some(m=>storyAvailable(m.id)))await ensureStories();if(!$('#detail').open&&(before!==JSON.stringify(reflections)||beforeCatalog!==JSON.stringify(catalog)||lastGateSignature!==gateSignature()))render()}catch{/* Keep the last verified view; a reload retries the request. */}
}
window.addEventListener('focus',refreshReleases);
setInterval(()=>{if(!document.hidden)refreshReleases()},60000);
async function start(){try{[curriculum,bible,catalog,journey,weeklyStudy]=await Promise.all([fetchJSON('./curriculum.json?v=61a0d204363f'),fetchJSON('./data.json'),fetchJSON($('meta[name="lesson-catalog"]').content,{cache:'no-store'}),fetchJSON('./journey.json?v=883d4f500421'),fetchJSON('./weekly-study.json?v=d02dded3f980',{cache:'no-store'})]);await loadReflections();completed=readProgress();if(curriculum.modules.some(m=>storyAvailable(m.id)))await ensureStories();go(location.hash.slice(1)||'introduction',false);}catch{$('#view').innerHTML='<div class="error"><h2>The Study Could Not Be Opened</h2><p>Please check your connection, then reload the page.</p><button id="retry" class="primary-button">Try again</button></div>';$('#retry').onclick=start}}
start();


function progressKey(){return reflections?.review?'review-progress-v1':'progress-v1';}
function readProgress(){try{const key='luke-acts-'+progressKey(),raw=localStorage.getItem(key),saved=parseProgress(raw),valid=eligibleProgress(saved,catalog.lessons);if(valid.length!==saved.length)localStorage.setItem(key,JSON.stringify({version:1,completed:valid}));progressSaved=true;return valid;}catch{progressSaved=false;return [];}}
function storyAvailable(id){return storyOpen(id,curriculum.sessions,completed,journey.storyDates[id],Date.now(),false,journey.storyUnlock);}
function artAvailable(s){return weekOpen(lessonMeta(s)?.releaseAt);}
function openingLabel(s){return 'Opens the week of '+weekLabel(s.date).replace(' Week','');}
function sessionTitle(s){return artAvailable(s)?studyTitle(journey.sessions[s.number-1].commentaryTitle||s.title):openingLabel(s);}
function scheduleWeekOpening(){clearTimeout(releaseTimer);const next=catalog.lessons.flatMap(l=>[Date.parse(l.releaseAt),Date.parse(l.commentaryReleaseAt)]).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];if(next)releaseTimer=setTimeout(()=>{if(!$('#detail').open)render();refreshReleases();},Math.min(next-Date.now()+20,2147483647));}
function gateSignature(){return JSON.stringify([curriculum.sessions.map(artAvailable),curriculum.modules.map(m=>storyAvailable(m.id))]);}
function showToast(message){$('#toast').textContent=message;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function moduleUnlockLabel(m){const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(new Date(journey.storyDates[m.id]));return (m.id===1?'The first module unlocks on ':m.id===4?'The interlude unlocks on ':'Module '+m.id+' unlocks on ')+date;}
function lockedCover(compact=false,module=null){return `<span class="series-cover ${compact?'compact-cover':''} ${module?'module-unlock-cover':''}"><img src="./assets/series-mosaic.webp" alt="${compact?'':esc(journey.seriesCover.alt)}" width="1774" height="887" loading="lazy"><span class="series-wordmark"><span class="series-lock">${icon('lock')}</span>${module?`<strong>${esc(moduleUnlockLabel(module))}</strong>`:`<strong>From Bethlehem<br>to the Nations</strong><small>D-Group Bible Study Series</small>`}</span></span>`;}
function sessionArt(s,compact=false){const item=journey.sessions[s.number-1],open=artAvailable(s),done=open&&completed.includes(s.number);return `<span class="session-art journey-frame ${done?'is-complete':''} ${compact?'session-thumb':''}" data-session-art="${s.number}">${open?`<img src="./assets/${item.image}?v=20261012-diversity" alt="${compact?'':esc(item.alt)}" width="1774" height="887" loading="lazy">`:lockedCover(compact)}${done?'<span class="completed-badge">✓ Completed</span>':!open&&!compact?`<span class="art-unlock">${esc(openingLabel(s))} · Monday, 06:00 Paris time.</span>`:''}</span>`;}
function moduleArt(m){const c=concepts.find(c=>c.module===m.id);return storyAvailable(m.id)?`<img src="./assets/${c.image}" alt="${esc(c.alt)}" width="1774" height="887" loading="lazy">`:lockedCover(false,m);}
function progressSummary(){return `<section class="journey-progress" aria-label="Your Act I progress"><div><strong>Your Journey · ${completed.length} of 12 studies completed</strong><p>${reflections?.review?'Review progress is separate. ':''}${progressSaved?'Your progress is saved only in this browser, on this device. If you clear your browser data, it will be deleted. It does not move to your other devices.':'Browser storage is unavailable. Your progress will last only for this visit.'}</p></div><progress max="12" value="${completed.length}" aria-label="Completed studies">${completed.length} of 12</progress></section>`;}
function completionControl(s){if(!artAvailable(s))return `<section class="completion-control" aria-label="Week ${s.number} completion"><div><strong>${esc(openingLabel(s))}</strong><p>Available from Monday at 06:00 Paris time.</p></div><button class="primary-button" disabled aria-disabled="true">Mark week ${s.number} as completed</button></section>`;const done=completed.includes(s.number),ready=storyAvailable(s.module);return `<section class="completion-control" aria-label="Week ${s.number} completion"><div><strong>${done?'✓ Study Completed':'Finished This Study?'}</strong><p>When your group has read, talked about and prayed through the passage, mark it as done here.</p></div><button class="${done?'secondary':'primary'}-button" data-complete="${s.number}" aria-pressed="${done}">${done?'Mark week '+s.number+' as not completed':'Mark week '+s.number+' as completed'}</button>${ready?`<a class="text-link" href="#story">Return to The Story So Far ↗</a>`:''}</section>`;}
function sceneConnections(s){const item=journey.sessions[s.number-1],hints=weeklyStudy.sessions[s.number-1].hints;return `<section class="scene-connections" aria-labelledby="scene-${s.number}"><span class="eyebrow">A Little More Context</span><h4 id="scene-${s.number}">Two Related Passages to Read</h4><div class="support-card-grid">${item.connections.map((p,i)=>`<article class="support-card"><button class="text-link" data-scene="${s.number}:${i}">Look at ${esc(p.reference)} ↗</button><p>${esc(hints[i])}</p></article>`).join('')}</div></section>`;}
function openScene(number,index){const s=journey.sessions[number-1],p=s?.connections[index];if(!p)return;openDialog('Supporting Passage · WEB',p.reference,`<p class="connection-hint">${esc(weeklyStudy.sessions[number-1].hints[index])}</p>${p.verses.map(v=>`<p class="scripture-quote"><sup>${v.verse}</sup>${esc(v.text)}</p>`).join('')}<a class="text-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Read the surrounding chapter ↗</a>`);}

async function ensureStories(){
 if(approvedStories)return approvedStories;
 if(reflections?.review){approvedStories=reflections;return approvedStories;}
 if(!storyPromise)storyPromise=fetchJSON($('meta[name="story-catalog"]').content,{cache:'no-store'}).then(data=>{approvedStories=data;return data}).catch(e=>{storyPromise=null;throw e});
 return storyPromise;
}
function tskView(){return `<h3 class="tool-heading">TSK Bible Concordance</h3><p class="info-note">The Bible often explains the Bible. A concordance shows how verses in different books are linked by the same word, the same image or the same promise. Following these lines helps you see the one big story, and how the Old Testament points to Jesus.</p><p class="info-note">For each passage you will find six connections, chosen from the Treasury of Scripture Knowledge (TSK), a classic collection of Bible cross references first published in the 1800s. The short notes are our reading hints, not quotations from TSK.</p>${[session()].map(s=>`<section class="weekly-concordance"><header><span class="eyebrow">${weekLabel(s.date)}</span><h4>${esc(s.passage)}</h4><button class="text-link" data-read="${s.number}">Return to this week’s reading ↗</button></header><div class="concordance-grid">${weeklyStudy.sessions[s.number-1].concordance.map((c,i)=>`<article class="concordance-card"><span class="connection-origin">From ${esc(verseLabel(c.source)+(c.source==='Mic.5.5'?'a':''))}</span><button class="text-link" data-connection="${s.number}:${i}">${esc(refLabel(c.ref))} ↗</button><p>${esc(c.reason)}</p></article>`).join('')}</div></section>`).join('')}`;}
async function openConnection(number,index){const c=weeklyStudy.sessions[number-1]?.concordance[index];if(!c)return;await openReference(c.ref);if($('#detail').open&&$('#dialog-title')?.textContent===refLabel(c.ref)){const note=document.createElement('p');note.className='connection-hint';note.textContent=verseLabel(c.source)+(c.source==='Mic.5.5'?'a':'')+' → '+refLabel(c.ref)+'. '+c.reason;$('#dialog-title').after(note);}}

function toolsView(){const names={words:'Repeated Words',glossary:'Glossary',tsk:'TSK Bible Concordance'};return heading('05','Bible Study Tools','Three simple tools help you look more closely at the passage: repeated words, a glossary and a concordance. Use them after your first reading, to see what you might have missed.')+toolsWeekSelector()+`<div class="tool-tabs" role="tablist" aria-label="Bible Study Tools">${Object.entries(names).map(([key,name])=>`<button role="tab" id="tool-tab-${key}" aria-controls="tool-panel" aria-selected="${state.tool===key}" tabindex="${state.tool===key?0:-1}" data-tool="${key}">${name}</button>`).join('')}</div><section id="tool-panel" role="tabpanel" aria-labelledby="tool-tab-${state.tool}">${({words,glossary:glossaryView,tsk:tskView}[state.tool])()}</section>`;}
function wireJourney(){
 document.querySelectorAll('[data-study-jump]').forEach(b=>b.onclick=()=>$('#study-start-'+b.dataset.studyJump)?.focus());
 document.querySelectorAll('[data-tools-tsk]').forEach(b=>b.onclick=()=>{pickWeek(b.dataset.toolsTsk);state.tool='tsk';go('tools');});
 document.querySelectorAll('[data-tool]').forEach(b=>{b.onclick=()=>{state.tool=b.dataset.tool;render();$('#tool-tab-'+state.tool).focus();};b.onkeydown=e=>{const keys=['words','glossary','tsk'],i=keys.indexOf(state.tool);let next;if(e.key==='ArrowRight')next=keys[(i+1)%3];if(e.key==='ArrowLeft')next=keys[(i+2)%3];if(e.key==='Home')next=keys[0];if(e.key==='End')next=keys[2];if(next){e.preventDefault();state.tool=next;render();$('#tool-tab-'+next).focus();}};});
 document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>openScene(...b.dataset.scene.split(':').map(Number)));
 document.querySelectorAll('[data-connection]').forEach(b=>b.onclick=()=>openConnection(...b.dataset.connection.split(':').map(Number)));
 document.querySelectorAll('[data-complete]').forEach(b=>b.onclick=async()=>{
  const n=Number(b.dataset.complete);if(!artAvailable(curriculum.sessions[n-1])){render();return;}const wasDone=completed.includes(n);completed=toggleCompleted(completed,n,lessonMeta(curriculum.sessions[n-1])?.releaseAt);
  try{localStorage.setItem('luke-acts-'+progressKey(),JSON.stringify({version:1,completed}));progressSaved=true;}catch{progressSaved=false;}
  if(curriculum.modules.some(m=>storyAvailable(m.id))){try{await ensureStories()}catch{/* Completion stays saved. Opening the reading offers a retry. */}}
  render();document.querySelector(`[data-complete="${n}"]`)?.focus({preventScroll:true});
  showToast(!progressSaved?'Completed for this visit; browser storage is unavailable.':wasDone?'Completion removed.':moduleCompleted(curriculum.sessions[n-1].module,curriculum.sessions,completed)?'Module completed. The Story So Far is open.':'Study completed. Your scene is now open.');
 });
}
window.addEventListener('storage',async e=>{if(curriculum&&e.key==='luke-acts-'+progressKey()){completed=readProgress();if(curriculum.modules.some(m=>storyAvailable(m.id)))try{await ensureStories()}catch{}if(!$('#detail').open)render();}});

const sectionScenes={introduction:['intro','Introduction','Enter the story.'],reading:['read','Read','Read the passage slowly.'],studies:['studies','Pastoral Commentaries','Optional teaching from our pastors, one week at a time.'],story:['story','Story','See the threads come together.'],tools:['tools','Tools','Look closer at the words.'],resources:['resources','Resources','Explore a little further.']};
function sectionBanner(){const [id,title,copy]=sectionScenes[state.view]||[];return `${['reading','studies','story','tools','resources'].includes(state.view)?`<div class="section-banner" data-section="${state.view}" aria-label="${title}">${id?`<img src="./assets/banner-${id}.webp?v=20261012-diversity" alt="" width="1536" height="512" decoding="async">`:""}<div><span class="eyebrow">From Bethlehem to the Nations · Act I</span><p class="banner-title">${title}</p><p>${copy}</p></div></div>`:''}<div class="location-trail" aria-label="Your place in the study">Act I <span aria-hidden="true">/</span> ${esc(navs.find(n=>n[0]===state.view)[1])}${['reading','studies','commentaries'].includes(state.view)?` <span aria-hidden="true">/</span> ${esc(weekLabel(session().date))}`:state.view==='tools'?` <span aria-hidden="true">/</span> ${esc({words:'Repeated Words',glossary:'Glossary',tsk:'TSK Bible Concordance'}[state.tool])}`:''}</div>`;}
function updateLocation(){const label=navs.find(n=>n[0]===state.view)[2];$('.breadcrumb').innerHTML=`<span class="crumb-series">Luke–Acts / Act I</span><strong aria-current="page">${esc(label)}</strong>`;}

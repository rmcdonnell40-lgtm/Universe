/* COSMIC VX Genesis: evidence-based missions, discovery log, branching science directive. */
(()=>{
'use strict';
const storage=window.COSMIC_VX_STORAGE;
if(!storage)return;
const PROFILE='cosmic:explorer:profile:v2';
const RESOURCES='claimyourplanet:resource-expedition:v18';
const LAB='cosmic:myworld:laboratory:v21';
const STORY='cosmic:vx:story:v1';
const ingredients=['water','carbon','phosphorus','sulfur','metals','energy','culture'];
const missionCatalog=[
 {id:'m1',title:'EXPLORER INITIATION',description:'Register your identity with the COSMIC Exploration Authority and enter the galaxy.'},
 {id:'m2',title:'FIRST SURVEY',description:'Explore a planetary system and complete your first planetary scan.'},
 {id:'m3',title:'INGREDIENTS OF CREATION',description:'Collect all seven ingredients required to cultivate First Life.'},
 {id:'m4',title:'THE FIRST EXPERIMENT',description:'Combine the seven ingredients inside the Laboratory petri dish.'},
 {id:'m5',title:'GENESIS',description:'Use First Life Culture from Resources to begin seeding ASTRA-01.'},
 {id:'m6',title:'A LIVING WORLD',description:'Wait for life to establish, then open the Life page on ASTRA-01.'},
 {id:'m7',title:'THE GENESIS DIRECTIVE',description:'Choose whether to observe natural evolution or guide early research.'}
];
const read=(k,def={})=>{try{const x=JSON.parse(storage.getItem(k)||'null');return x&&typeof x==='object'?x:def}catch(e){return def}};
const defaultStory=()=>({schema:1,completed:{},decisions:{},log:[],scenes:{},viewedLife:false,seenPlanets:{},ingredientHistory:{},firstCultivated:false,firstSeeding:false,milestones:[]});
let story={...defaultStory(),...read(STORY)};
if(!story.decisions||typeof story.decisions!=='object')story.decisions={};
if(!story.completed||typeof story.completed!=='object')story.completed={};
if(!Array.isArray(story.log))story.log=[];
if(!story.seenPlanets||typeof story.seenPlanets!=='object')story.seenPlanets={};
if(!story.ingredientHistory||typeof story.ingredientHistory!=='object')story.ingredientHistory={};
let rendering=false,dialogOpen=false,readyForIntro=false,showDirectivePending=false,toastTimer=null;
const host=document.createElement('div');host.id='vxMissionDock';host.innerHTML='<button class="vx-mission-head" type="button" id="vxMissionCollapse"><span>◈ CEA // ASSIGNED OBJECTIVE</span><span id="vxMissionArrow">⌄</span></button><section class="vx-mission-content"><div id="vxMissionKicker" class="vx-mission-kicker">GENESIS PROGRAM</div><div id="vxMissionTitle" class="vx-mission-title">Preparing mission</div><div id="vxMissionDescription" class="vx-mission-details">Synchronising expedition records...</div><div class="vx-progress-track"><div id="vxMissionFill" class="vx-progress-fill"></div></div><div class="vx-mission-footer"><span id="vxMissionProgress"></span><span id="vxMissionPercent"></span></div><button id="vxMissionHistory" class="vx-mission-btn" type="button">VIEW MISSION LOG</button></section>';
document.body.append(host);
const notice=document.createElement('div');notice.id='vxToast';document.body.append(notice);
const narrative=document.createElement('div');narrative.id='vxNarrativeOverlay';narrative.innerHTML='<div class="vx-narrative-card" role="dialog" aria-modal="true" aria-label="COSMIC mission transmission"><div><div class="vx-narrative-overline" id="vxStoryEyebrow">COSMIC // INCOMING TRANSMISSION</div><h1 class="vx-narrative-title" id="vxStoryTitle">Transmission</h1><p class="vx-narrative-body" id="vxStoryBody"></p></div><div class="vx-narrative-actions" id="vxStoryActions"></div></div>';document.body.append(narrative);
const $=id=>document.getElementById(id);
const isDev=storage.getSlot()==='developer';
function persist(){storage.setItem(STORY,JSON.stringify(story))}
function insertLog(type,title,detail,key){
 if(story.log.some(x=>x.key===key))return false;
 story.log.unshift({type,title,detail,key,at:Date.now()});
 if(story.log.length>300)story.log.length=300;
 return true;
}
function notify(text){
 notice.textContent=text;notice.classList.add('on');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.classList.remove('on'),3800);
}
function complete(id){
 if(story.completed[id])return false;
 story.completed[id]=Date.now();
 const m=missionCatalog.find(m=>m.id===id);
 insertLog('MISSION',m.title,'Objective verified and recorded in the COSMIC expedition journal.','mission:'+id);
 notify('◈ MISSION COMPLETE · '+m.title);
 return true;
}
function profile(){return read(PROFILE,null)}
function data(){
 const resources=read(RESOURCES,{worlds:{}}),lab=read(LAB,{stock:{},added:[]});
 const worlds=Object.entries(resources.worlds||{}).filter(([k,v])=>v?.surveyed);
 const finds=worlds.flatMap(([k,v])=>(v.findings||[]).map((f,i)=>({planet:v.name,resource:f.resource,collected:!!v.collected?.[i]})));
 const collected=finds.filter(f=>f.collected&&f.resource);
 const started=Math.max(0,Number(lab.seedStartedAt)||0),established=!!lab.seeded&&started>0&&Date.now()-started>=600000;
 return {resources,lab,worlds,finds,collected,established};
}
function reconcile(){
 const profileData=profile(),d=data();
 let changed=false;
 for(const [key,w] of d.worlds){
  if(story.seenPlanets[key])continue;
  story.seenPlanets[key]=true;
  if(insertLog('PLANETARY SURVEY',w.name||'Unknown world','Surveyed in '+(w.system||'an uncharted star system')+'. Geological anomalies recorded.','world:'+key))changed=true;
 }
 for(const x of d.collected){
  const id=String(x.resource?.item||'').toLowerCase();
  // Record each collected resource category, never award duplicate collection rewards.
  if(id&&insertLog('RESOURCE',x.resource.item,'First collected during planetary exploration.','resource:'+id))changed=true;
 }
 for(const k of ingredients){
  const witnessed=Number(d.lab.stock?.[k])>0||d.lab.added?.includes(k);
  if(witnessed&&!story.ingredientHistory[k]){story.ingredientHistory[k]=true;changed=true}
 }
 if(d.lab.living||Number(d.lab.cultures)>0||d.lab.seeded){
  if(!story.firstCultivated){story.firstCultivated=true;changed=true}
  for(const k of ingredients)if(!story.ingredientHistory[k]){story.ingredientHistory[k]=true;changed=true}
 }
 if(d.lab.seeded&&!story.firstSeeding){story.firstSeeding=true;changed=true}
 const flags=[
  !!profileData?.id&&!!profileData?.name,
  d.worlds.length>0,
  ingredients.every(k=>story.ingredientHistory[k]),
  story.firstCultivated,
  !!d.lab.seeded,
  d.established&&story.viewedLife,
  !!story.decisions.genesis
 ];
 for(let i=0;i<missionCatalog.length;i++){
  if(i>0&&!story.completed[missionCatalog[i-1].id])break;
  if(flags[i]&&!story.completed[missionCatalog[i].id]){complete(missionCatalog[i].id);changed=true}
 }
 if(d.established&&insertLog('BIOLOGY','Astracella prima — Species 001','First single-celled aquatic organism established in the oceans of ASTRA-01.','life:astracella'))changed=true;
 if(story.decisions.genesis&&insertLog('DIRECTIVE','Genesis Directive',story.decisions.genesis==='guided'?'Directed biological research authorised.':'Natural development selected.','directive:genesis'))changed=true;
 if(changed)persist();
 renderMission();
 maybeIntro(d,profileData);
 maybeDirective(d);
}
function renderMission(){
 const done=missionCatalog.filter(m=>story.completed[m.id]).length;
 const next=missionCatalog.find(m=>!story.completed[m.id]);
 $('vxMissionFill').style.width=(done/missionCatalog.length*100)+'%';
 $('vxMissionProgress').textContent=done+' / '+missionCatalog.length+' objectives';
 $('vxMissionPercent').textContent=Math.round(done/missionCatalog.length*100)+'%';
 $('vxMissionKicker').textContent=next?'CHAPTER 01 // GENESIS':'GENESIS CHAPTER COMPLETE';
 $('vxMissionTitle').textContent=next?.title||'THE FIRST CHAPTER IS COMPLETE';
 $('vxMissionDescription').textContent=next?.description||'Continue exploring the galaxy. New scientific and narrative chapters will follow.';
}
function isGameplayVisible(){
 try{
  const parent=window.parent?.document;
  if(parent===document)return true;
  const menu=parent.getElementById('vxOverlay'),gate=parent.getElementById('vxProfileGate');
  return !menu?.classList.contains('on')&&gate?.style.display!=='block';
 }catch(e){return true}
}
function showScene({id,eyebrow,title,body,buttons}){
 if(dialogOpen||!isGameplayVisible())return false;
 dialogOpen=true;narrative.classList.add('open');
 $('vxStoryEyebrow').textContent=eyebrow||'COSMIC // SCIENTIFIC TRANSMISSION';
 $('vxStoryTitle').textContent=title;
 $('vxStoryBody').textContent=body;
 const actions=$('vxStoryActions');actions.replaceChildren();
 for(const entry of buttons||[{label:'CONTINUE',action:()=>{}}]){
  const b=document.createElement('button');b.textContent=entry.label;
  if(entry.secondary)b.className='muted';
  b.onclick=()=>{narrative.classList.remove('open');dialogOpen=false;entry.action?.()};
  actions.append(b);
 }
 return true;
}
function maybeIntro(d,p){
 if(isDev||story.scenes.intro||dialogOpen||!isGameplayVisible()||!p?.id)return;
 if(showScene({title:'YOUR ASSIGNMENT',eyebrow:'CEA / GENESIS PROGRAMME',body:
  'Explorer '+p.name+', your orders are confirmed.\n\nYou have been assigned to ASTRA-01: an ocean-bearing world with no established biological life.\n\nTravel the nearby star systems. Recover the ingredients of creation. Return to the Laboratory.\n\nWe came searching for life. Perhaps it is time we created it.',
  buttons:[{label:'BEGIN EXPEDITION',action:()=>{story.scenes.intro=Date.now();insertLog('TRANSMISSION','Genesis Assignment','Explorer assigned to ASTRA-01.','scene:intro');persist()}}]}))return;
}
function maybeDirective(d){
 if(isDev||story.decisions.genesis||!story.completed.m6||dialogOpen||!isGameplayVisible())return;
 showScene({title:'THE GENESIS DIRECTIVE',eyebrow:'CEA // DECISION 001',body:
  'Astracella prima has established a stable microbial population. The next stage of research requires your authorisation.\n\nChoose how you intend to influence the biosphere. This decision is recorded in your expedition history and affects microbial population growth.',
  buttons:[
   {label:'NATURAL DEVELOPMENT',secondary:true,action:()=>chooseDirective('natural')},
   {label:'DIRECTED RESEARCH',action:()=>chooseDirective('guided')}
  ]});
}
function chooseDirective(choice){
 if(story.decisions.genesis)return;
 story.decisions.genesis=choice;
 story.decision=choice; // Compatibility with earlier VX Life prototype.
 persist();notify(choice==='guided'?'◈ DIRECTED RESEARCH AUTHORISED':'◈ NATURAL DEVELOPMENT AUTHORISED');
 reconcile();
}
function journal(container){
 if(!container)return;
 const sec=document.createElement('section');sec.className='vx-journal-section';
 const h=document.createElement('h3');h.textContent='◈ COSMIC Expedition Record';
 const p=document.createElement('p');p.className='vx-journal-note';
 p.textContent='Your scientific discoveries, completed objectives and long-term decisions are recorded in this Explorer save.';
 sec.append(h,p);
 const list=document.createElement('div');list.className='vx-journal-list';
 const history=[...story.log].sort((a,b)=>b.at-a.at).slice(0,60);
 if(!history.length){const n=document.createElement('p');n.className='vx-journal-note';n.textContent='No expedition events recorded yet.';sec.append(n)}
 for(const event of history){
  const card=document.createElement('article');card.className='vx-journal-entry';
  const b=document.createElement('b'),sm=document.createElement('small'),detail=document.createElement('div');
  b.textContent=event.title;sm.textContent=event.type+' · '+new Date(event.at).toLocaleString();detail.textContent=event.detail;
  card.append(b,sm,detail);list.append(card);
 }
 sec.append(list);
 const missionHead=document.createElement('h3');missionHead.textContent='Mission Checklist';sec.append(missionHead);
 const missions=document.createElement('div');missions.className='vx-journal-list';
 for(const m of missionCatalog){
  const el=document.createElement('div');el.className='vx-journal-entry';
  const b=document.createElement('b');b.textContent=(story.completed[m.id]?'✓ ':'○ ')+m.title;
  const p=document.createElement('div');p.textContent=m.description;
  el.append(b,p);missions.append(el);
 }
 sec.append(missions);
 if(story.decisions.genesis){
  const d=document.createElement('p');d.className='vx-journal-note';
  d.textContent='GENESIS DIRECTIVE: '+(story.decisions.genesis==='guided'?'Directed Research':'Natural Development')+' · Recorded permanently for this Explorer.';
  sec.append(d);
 }
 container.append(sec);
}
window.COSMIC_VX_renderJournal=journal;
$('vxMissionCollapse').onclick=()=>{host.classList.toggle('collapsed');$('vxMissionArrow').textContent=host.classList.contains('collapsed')?'⌃':'⌄'};
$('vxMissionHistory').onclick=()=>{
 const journalTab=document.querySelector('.rt-nav .rt-tab:nth-child(3)');
 journalTab?.click();
};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='COSMIC_VX_LIFE_VIEWED')return;
 story.viewedLife=true;persist();reconcile();
});
window.addEventListener('cosmic-vx:saved',e=>{if(e.detail?.key===STORY)return;setTimeout(reconcile,0)});
setInterval(reconcile,1800);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile()});
reconcile();
})();

/* COSMIC VX — Main Menu, save slot management, Explorer registration and developer workbench. */
(()=>{
'use strict';
const INDEX='cosmic:vx:index:v1',PROFILE='cosmic:explorer:profile:v2',LAB='cosmic:myworld:laboratory:v21';
const RESOURCE='claimyourplanet:resource-expedition:v18';
const $=id=>document.getElementById(id);
const safeParse=(raw,fallback=null)=>{try{return JSON.parse(raw)||fallback}catch(e){return fallback}};
const raw=window.localStorage;
const adapter=window.COSMIC_VX_STORAGE;
if(!adapter){console.error('VX SaveAdapter must be loaded before menu');return}
const index=()=>{const v=safeParse(raw.getItem(INDEX),{});return {version:1,slots:Array.isArray(v.slots)?v.slots:[]}};
const updateIndex=fn=>{const s=index();fn(s);raw.setItem(INDEX,JSON.stringify(s));return s};
const slotPrefix=id=>'cosmic:vx:slot:'+id+':';
const setSlot=id=>{
 if(!/^[\w-]{1,90}$/.test(id))throw Error('Invalid save slot ID');
 window.COSMIC_VX_ACTIVE_SLOT=id;
 sessionStorage.setItem('cosmic:vx:active-slot',id);
};
const getFor=(id,key)=>safeParse(raw.getItem(slotPrefix(id)+key),null);
const putFor=(id,key,obj)=>raw.setItem(slotPrefix(id)+key,JSON.stringify(obj));
const mkId=()=> 'explorer_'+(typeof crypto.randomUUID==='function'?crypto.randomUUID().replace(/-/g,'').slice(0,16):Date.now().toString(36)+Math.random().toString(36).slice(2,7));
const blankLab=()=>({stock:{water:0,carbon:0,phosphorus:0,sulfur:0,metals:0,energy:0,culture:0},added:[],living:false,cultures:0,seeded:false,seedStartedAt:0});
const grantLab=()=>({...blankLab(),stock:{water:3,carbon:3,phosphorus:3,sulfur:3,metals:3,energy:3,culture:3}});
const panel=document.createElement('div');
panel.id='vxOverlay';
panel.innerHTML=`<div class="vx-screen">
 <section class="vx-hero"><div><div class="vx-eyebrow">THE GENESIS INITIATIVE // COSMIC EXPLORATION AUTHORITY</div><h1 class="vx-logo">COSMIC<span style="color:#66c8ee">.</span></h1><div class="vx-tagline">THE SPACE GAME</div><p>A universe waiting to be explored.<br>One untouched world. One explorer. The beginning of life.</p></div><div class="vx-deco" aria-hidden="true"></div></section>
 <section class="vx-menu-panel" aria-label="COSMIC VX main menu">
 <div class="vx-header-row"><div class="vx-panel-title">COSMIC // VX GENESIS</div><span style="font:750 10px monospace;color:#9ed8ee">BUILD VX · WORK IN PROGRESS</span></div>
 <div id="vxMain" class="vx-view on">
   <button id="vxNew" class="vx-menu-button primary"><span class="symbol">✧</span><span><b>NEW GAME</b><small>Create a fresh Explorer and begin the Genesis mission</small></span></button>
   <button id="vxLoad" class="vx-menu-button"><span class="symbol">◫</span><span><b>LOAD GAME</b><small>Resume your saved expedition</small></span></button>
   <button id="vxDeveloper" class="vx-menu-button"><span class="symbol">⚙</span><span><b>DEVELOPER</b><small>Separate sandbox · tools and experimental world states</small></span></button>
   <button id="vxResume" class="vx-menu-button" hidden><span class="symbol">↗</span><span><b>RESUME SESSION</b><small>Return to the currently active save</small></span></button>
   <p style="color:#7796ad;font-size:11px;line-height:1.65">Your VX saves are separate from V20. Existing worlds, profile cards and older builds remain untouched.</p>
 </div>
 <div id="vxLoading" class="vx-view"><button id="vxLoadBack" class="vx-back">← MAIN MENU</button><h2 style="font-size:20px;letter-spacing:.12em;margin:3px 0">AVAILABLE EXPEDITIONS</h2><div class="vx-save-list" id="vxSaveList"></div><button id="vxImport" class="vx-back">⇧ IMPORT SAVE FILE</button><input type="file" id="vxImportInput" accept=".json,application/json" hidden></div>
 <div class="vx-foot">CEA // GENESIS DIVISION · DESKTOP DEVELOPMENT EDITION</div>
 </section></div>`;
document.body.append(panel);
const menuButton=document.createElement('button');
menuButton.id='vxMenuQuick';menuButton.textContent='☰ VX MENU';menuButton.hidden=true;document.body.append(menuButton);
const devButton=document.createElement('button');
devButton.id='vxDevQuick';devButton.textContent='⚙ DEV TOOLS';document.body.append(devButton);
const devPanel=document.createElement('section');
devPanel.id='vxDevTools';devPanel.innerHTML=`<div class="vx-header-row"><h3>⚙ GENESIS WORKBENCH</h3><button id="vxDevClose" class="vx-small">✕</button></div><p>A dedicated developer save. These controls do not modify New Game or V20 progress.</p>
<div class="vx-dev-grid">
<button data-dev="grant">GRANT 7 INGREDIENTS</button><button data-dev="resetlab">RESET LABORATORY</button>
<button data-dev="culture">CREATE LIFE CULTURE</button><button data-dev="seed">START SEEDING</button>
<button data-dev="complete">COMPLETE SEEDING</button><button data-dev="sterile">STERILE PLANET</button>
<button data-dev="resetworld">RESET DEV WORLD</button><button data-dev="reload">RELOAD SCENE</button>
</div><div class="vx-dev-status" id="vxDevState"></div>`;
document.body.append(devPanel);
const profileGate=document.createElement('div');
profileGate.id='vxProfileGate';profileGate.style.cssText='display:none;position:fixed;inset:0;z-index:65000;background:#03101f;';
profileGate.innerHTML='<button id="vxProfileReturn" type="button" style="position:absolute;top:12px;right:20px;z-index:10;border:1px solid #70c3df;background:#123a54;color:#e3faff;border-radius:11px;padding:13px 21px;font:800 12px system-ui;cursor:pointer" hidden>✧ ENTER COSMIC</button><iframe id="vxProfileFrame" title="COSMIC Explorer Identity" style="width:100%;height:100%;border:0"></iframe>';
document.body.append(profileGate);
let activeSlot=null;
let initialised=false;
const frame=$('galaxyV7Frame'),shell=$('galaxyV7Shell');
function profileValid(id){const p=getFor(id,PROFILE);return !!(p&&p.name&&p.id&&p.gender&&p.portraitId)}
function touchIndex(id){
 const p=getFor(id,PROFILE);
 updateIndex(s=>{const slot=s.slots.find(x=>x.id===id);if(slot){slot.lastOpened=Date.now();if(p?.name)slot.name=p.name}});
}
function switchView(page){$('vxMain').classList.toggle('on',page==='main');$('vxLoading').classList.toggle('on',page==='loading');}
function openMenu(){
 menuButton.hidden=true;devPanel.classList.remove('on');
 $('vxResume').hidden=!activeSlot;
 switchView('main');panel.classList.add('on');
}
function closeMenu(){panel.classList.remove('on');menuButton.hidden=false}
function startGame(id){
 setSlot(id);activeSlot=id;initialised=true;touchIndex(id);
 panel.classList.remove('on');menuButton.hidden=false;
 const url='Galaxy_VX.html?slot='+encodeURIComponent(id);
 if(frame.getAttribute('src')!==url)frame.setAttribute('src',url);
 if(!shell.classList.contains('open'))$('openGalaxyV7').click();
 const isDev=id==='developer';
 devButton.style.display=isDev?'block':'none';
 devPanel.classList.remove('on');
 if(!profileValid(id)){openProfile(true)}else{profileGate.style.display='none'}
}
function openProfile(required){
 if(!activeSlot)return;
 const url='COSMIC_Explorer_Profile_VX.html?slot='+encodeURIComponent(activeSlot);
 if($('vxProfileFrame').getAttribute('src')!==url)$('vxProfileFrame').setAttribute('src',url);
 profileGate.style.display='block';
 $('vxProfileReturn').hidden=required&&!profileValid(activeSlot);
}
function ensureNew(){
 const id=mkId(),now=Date.now();
 updateIndex(s=>s.slots.push({id,name:'Unregistered Explorer',created:now,lastOpened:now,type:'player'}));
 putFor(id,LAB,blankLab());
 putFor(id,RESOURCE,{worlds:{},home:null});
 startGame(id);
}
function ensureDeveloper(){
 const id='developer';
 if(!index().slots.some(s=>s.id===id))updateIndex(s=>s.slots.push({id,name:'Developer',created:Date.now(),lastOpened:Date.now(),type:'developer'}));
 if(!getFor(id,LAB))putFor(id,LAB,grantLab());
 if(!getFor(id,PROFILE))putFor(id,PROFILE,{version:1,name:'Developer',gender:'Male',age:30,nationality:'Not specified',countryCode:'',assignment:'ASTRA-01',rank:'Developer',id:'CEA-VX-DEV',portraitId:'dev-1',photo:null,issuedAt:new Date().toISOString()});
 if(!getFor(id,RESOURCE))putFor(id,RESOURCE,{worlds:{},home:null});
 startGame(id);
}
const fmtTime=ms=>{try{return new Date(ms).toLocaleString()}catch(e){return 'Unknown'}};
function exportSave(id){
 const rec=index().slots.find(x=>x.id===id);if(!rec)return;
 const files={};const prefix=slotPrefix(id);
 for(let i=0;i<raw.length;i++){const k=raw.key(i);if(k&&k.startsWith(prefix))files[k.slice(prefix.length)]=raw.getItem(k)}
 const out={app:'COSMIC-VX',schema:1,exportedAt:new Date().toISOString(),label:rec.name,type:rec.type,files};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='COSMIC_VX_'+id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function renderSaves(){
 const list=$('vxSaveList');list.replaceChildren();
 const slots=index().slots.filter(x=>x.type==='player').sort((a,b)=>(b.lastOpened||0)-(a.lastOpened||0));
 if(!slots.length){const p=document.createElement('p');p.className='vx-empty';p.textContent='No saved expeditions yet. Choose New Game to create your first Explorer.';list.append(p);return}
 for(const slot of slots){
  const card=document.createElement('div');card.className='vx-save-card';const left=document.createElement('div');
  const name=document.createElement('strong');name.textContent=slot.name||'Unregistered Explorer';
  const p=getFor(slot.id,PROFILE),lab=getFor(slot.id,LAB);
  const small=document.createElement('small');small.textContent='ASTRA-01 · '+(lab?.seeded?'Life seeding / microbial stage':'Sterile planet')+' · '+fmtTime(slot.lastOpened||slot.created);
  left.append(name,small);card.append(left);
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:end';
  const load=document.createElement('button');load.textContent='LOAD';load.onclick=()=>startGame(slot.id);
  const exp=document.createElement('button');exp.textContent='↓';exp.title='Export save';exp.onclick=()=>exportSave(slot.id);
  actions.append(load,exp);card.append(actions);list.append(card);
 }
}
function reloadGalaxy(){
 if(!activeSlot)return;
 const src='Galaxy_VX.html?slot='+encodeURIComponent(activeSlot)+'&r='+Date.now();
 frame.setAttribute('src',src);
}
function mutateDev(kind){
 if(activeSlot!=='developer')return;
 let lab=getFor('developer',LAB)||blankLab();
 if(kind==='grant')for(const k of Object.keys(blankLab().stock))lab.stock[k]=Math.max(3,Number(lab.stock?.[k])||0);
 if(kind==='resetlab'||kind==='sterile')lab=blankLab();
 if(kind==='culture'){lab.cultures=(lab.cultures||0)+1;lab.living=true;lab.added=Object.keys(blankLab().stock)}
 if(kind==='seed'){if(!lab.cultures)lab.cultures=1;lab.cultures--;lab.seeded=true;lab.seedStartedAt=Date.now()}
 if(kind==='complete'){lab.seeded=true;lab.seedStartedAt=Date.now()-11*60*1000}
 if(kind==='resetworld'){
  if(!confirm('Reset the developer save world, scanner, journal, Laboratory and missions?'))return;
  for(const k of Array.from({length:raw.length},(_,i)=>raw.key(i)))if(k?.startsWith(slotPrefix('developer'))&&!k.endsWith(':'+PROFILE))raw.removeItem(k);
  lab=grantLab();putFor('developer',RESOURCE,{worlds:{},home:null});
 }
 if(kind!=='reload')putFor('developer',LAB,lab);
 reloadGalaxy();renderDevState();
}
function renderDevState(){
 const lab=getFor('developer',LAB)||blankLab(),resource=getFor('developer',RESOURCE)||{worlds:{}};
 $('vxDevState').textContent='ASTRA-01: '+(lab.seeded?(Date.now()-lab.seedStartedAt>=600000?'MICROBIAL':'SEEDING'):'STERILE')+' · Cultures: '+(lab.cultures||0)+' · Planets scanned: '+Object.keys(resource.worlds||{}).length;
}
$('vxNew').onclick=ensureNew;
$('vxDeveloper').onclick=ensureDeveloper;
$('vxLoad').onclick=()=>{renderSaves();switchView('loading')};
$('vxLoadBack').onclick=()=>switchView('main');
$('vxImport').onclick=()=>$('vxImportInput').click();
$('vxImportInput').addEventListener('change',async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 try{
  if(file.size>10*1024*1024)throw Error('Maximum 10 MB save file');
  const obj=JSON.parse(await file.text());
  if(obj.app!=='COSMIC-VX'||obj.schema!==1||!obj.files||Array.isArray(obj.files)||typeof obj.files!=='object')throw Error('Not a valid COSMIC VX save');
  const entries=Object.entries(obj.files);
  if(entries.length>90)throw Error('Save contains too many entries');
  for(const [key,value] of entries)if(!/^[a-zA-Z0-9:._-]{1,120}$/.test(key)||typeof value!=='string'||value.length>7e6)throw Error('Invalid save entry');
  const id=mkId();
  for(const [key,value] of entries)raw.setItem(slotPrefix(id)+key,value);
  const p=getFor(id,PROFILE);
  updateIndex(s=>s.slots.push({id,name:p?.name||'Imported Explorer',type:'player',created:Date.now(),lastOpened:Date.now()}));
  renderSaves();
 }catch(err){alert('Unable to import save: '+err.message)}
});
$('vxResume').onclick=closeMenu;
$('vxProfileReturn').onclick=()=>{
 if(!activeSlot||!profileValid(activeSlot))return;
 touchIndex(activeSlot);profileGate.style.display='none';
};
window.addEventListener('message',e=>{
 if(e.origin!==location.origin)return;
 const profileFrame=$('vxProfileFrame');
 if(e.source===profileFrame.contentWindow&&e.data?.type==='COSMIC_PROFILE_REGISTERED'){
  if(activeSlot&&profileValid(activeSlot)){$('vxProfileReturn').hidden=false;touchIndex(activeSlot)}
  return;
 }
 if(e.source===frame.contentWindow&&e.data?.type==='COSMIC_SHOW_PROFILE')openProfile(!profileValid(activeSlot));
});
menuButton.onclick=openMenu;
devButton.onclick=()=>{devPanel.classList.toggle('on');renderDevState()};
$('vxDevClose').onclick=()=>devPanel.classList.remove('on');
devPanel.querySelectorAll('[data-dev]').forEach(b=>b.onclick=()=>mutateDev(b.dataset.dev));
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&devPanel.classList.contains('on'))devPanel.classList.remove('on')});
setInterval(()=>{if(activeSlot)touchIndex(activeSlot)},30000);
// The main menu is always the first screen. Gameplay initialises only after a save is selected.
panel.classList.add('on');
})();

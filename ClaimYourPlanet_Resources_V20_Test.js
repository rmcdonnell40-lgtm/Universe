/* ClaimYourPlanet — Extinct World Resource Expedition V18. Browser-only progression, not a live marketplace. */
(function(){
'use strict';
const KEY='claimyourplanet:resource-expedition:v20-test';
const $=id=>document.getElementById(id);
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
function seeded(n){return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
// Names must match V15 exactly. A number means virtual inventory units, not a physical assay.
const RESOURCE_DROPS={"Ancient impact basin":{"item":"Minerals","amount":0.5},"Metal-rich strata":{"item":"Iron","amount":0.5},"Ancient riverbed":{"item":"Water","amount":0.5},"Dormant caldera":{"item":"Minerals","amount":0.5},"Sulfur vent field":{"item":"Minerals","amount":0.5},"Obsidian plains":{"item":"Minerals","amount":0.5},"Magma reservoir":{"item":"Energy","amount":0.5},"Subsurface brine":{"item":"Water","amount":0.5},"Cryovolcanic fissure":{"item":"Water","amount":0.5},"Deep ice archive":{"item":"Water","amount":0.5},"Hydrothermal vent":{"item":"Energy","amount":0.5},"Abyssal trench":null,"Seabed mineral field":{"item":"Minerals","amount":0.5},"Organic chemical traces":{"item":"Carbon","amount":0.5},"Isotope anomaly":null,"Magnetic anomaly":null,"Jet-stream boundary":null,"Giant storm vortex":{"item":"Energy","amount":0.5},"Electrical storm belt":{"item":"Energy","amount":0.5},"Polar auroral oval":null,"Exotic cloud chemistry":{"item":"Minerals","amount":0.5},"High-altitude haze":null};
const COSMIC_LAB_KEY='cosmic:myworld:laboratory:v20-test';
const COSMIC_TEST_INGREDIENTS=[['water','Water'],['carbon','Carbon'],['phosphorus','Phosphorus'],['sulfur','Sulfur'],['metals','Catalytic Metals'],['energy','Energy Source'],['culture','Primordial Culture']];
function readCosmicLab(){
 const initial={stock:{water:1,carbon:1,phosphorus:1,sulfur:1,metals:1,energy:1,culture:1},added:[],living:false,cultures:0,seeded:false,seedStartedAt:0};
 // V20-Test intentionally does not import an earlier seeded world.
 try{const loaded=JSON.parse(localStorage.getItem(COSMIC_LAB_KEY));if(loaded&&typeof loaded==='object'){return {...initial,...loaded,stock:{...initial.stock,...loaded.stock}}}}catch(e){}
 return initial;
}
function saveCosmicLab(lab){try{localStorage.setItem(COSMIC_LAB_KEY,JSON.stringify(lab));return true}catch(e){return false}}
// Use real elapsed time, so seeding continues when COSMIC is closed.
const SEEDING_DURATION_MS=10*60*1000;
function seedingState(){
 const lab=readCosmicLab();
 if(!lab.seeded)return {status:'sterile',progress:0,remaining:SEEDING_DURATION_MS};
 if(!Number.isFinite(Number(lab.seedStartedAt))||Number(lab.seedStartedAt)<=0){
  lab.seedStartedAt=Date.now();
  saveCosmicLab(lab);
 }
 const elapsed=Math.max(0,Date.now()-Number(lab.seedStartedAt));
 return {status:elapsed>=SEEDING_DURATION_MS?'microbes':'seeding',progress:Math.min(1,elapsed/SEEDING_DURATION_MS),remaining:Math.max(0,SEEDING_DURATION_MS-elapsed)};
}

const iconMap={'Iron':'◆','Water':'💧','Carbon':'✦','Minerals':'◈','Energy':'⚡','Ancient Technology':'✧'};
let state={worlds:{},home:null};
try{
 const raw=JSON.parse(localStorage.getItem(KEY)||'null');
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
  if(raw.worlds&&typeof raw.worlds==='object'&&!Array.isArray(raw.worlds))state.worlds=raw.worlds;
  if(raw.home&&typeof raw.home==='object')state.home=raw.home;
 }
}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('Save unavailable',e);}}
function aggregate(){
 const totals={},byWorld=[];
 Object.entries(state.worlds).forEach(([key,record])=>{
  if(!record?.surveyed)return;
  let finds=Array.isArray(record.findings)?record.findings:[];
  finds.forEach((f,i)=>{
   if(!record.collected?.[i]||!f.resource)return;
   const label=f.resource.item,amount=Number(f.resource.amount)||0;
   totals[label]=Math.round(((totals[label]||0)+amount)*100)/100;
   byWorld.push({resource:label,amount,world:record.name,discovery:f.name});
  });
 });
 return {totals,byWorld};
}
const PLANET_INGREDIENT_TYPES={terrestrial:[65,65,55,40,50,25],ocean:[95,70,40,40,20,55],forest:[85,85,55,35,40,30],desert:[15,50,75,60,75,30],ice:[95,45,15,35,30,30],rocky:[20,55,75,50,90,25],lava:[3,25,55,95,80,95],gasGiant:[25,85,0,45,0,90],toxic:[15,70,25,85,35,65]};
const INGREDIENT_DESCRIPTIONS={
water:['Frozen aquifer','💧','Water ice or subsurface reservoir'],
carbon:['Carbon compounds','◆','Methane, organic chemistry or carbon mineral'],
phosphorus:['Phosphate strata','✦','Phosphorus-bearing rock deposits'],
sulfur:['Sulfur deposit','⬡','Sulfur-rich gas or volcanic vent'],
metals:['Catalytic ores','◈','Iron-nickel and catalytic trace metals'],
energy:['Energy gradient','⚡','Geothermal vents or storm energy'],
culture:['Primordial microbial sample','🧬','Extremely rare viable microbial sample (fictional)']};
function planetaryIngredients(p,seed){
 const rnd=seeded(hash(seed+'|'+p.seed+'|'+p.id+'|resources-v21'));
 const w=[...(PLANET_INGREDIENT_TYPES[p.type]||PLANET_INGREDIENT_TYPES.rocky)];
 if(p.water>50)w[0]=Math.min(98,w[0]+10);
 if(p.temperature>175)w[0]=Math.min(8,w[0]);
 const sorted=COSMIC_TEST_INGREDIENTS.slice(0,6).map(([id,label],i)=>({id,label,weight:w[i]})).sort((a,b)=>b.weight-a.weight);
 let chosen=sorted.filter(s=>s.weight>0&&rnd()*100<s.weight).slice(0,2);
 if(!chosen.length)chosen=[sorted[0]];
 const plausible=['ice','ocean','terrestrial','forest'].includes(p.type)&&p.temperature>-170&&p.temperature<95;
 if((plausible&&rnd()<.055)||(p.life?.pastLife&&rnd()<.09))chosen.unshift({id:'culture',label:'Primordial Culture',weight:2});
 return chosen.map(s=>{
  const [name,icon,description]=INGREDIENT_DESCRIPTIONS[s.id];
  return {name,type:'Astrobiology deposit',icon,rarity:s.id==='culture'?'Extraordinary':s.weight>=70?'Common':'Uncommon',
   description:description+'. Collect one sealed laboratory sample.',
   resource:{item:s.label,amount:1,id:s.id},cosmicIngredientId:s.id};
 });
}
function awardLaboratoryDeposit(f){
 const id=f?.cosmicIngredientId;if(!Object.prototype.hasOwnProperty.call({water:1,carbon:1,phosphorus:1,sulfur:1,metals:1,energy:1,culture:1},id))return;
 const lab=readCosmicLab();lab.stock[id]=(Math.max(0,Number(lab.stock[id])||0)+1);saveCosmicLab(lab);
}

function normalFindings(p,seed){
 const base=window.CYPlanetScannerV15.find(p,seed),history=p.life?.pastLife;
 const finds=history?base.slice(0,history.ancientTechnology?3:4):base.slice(0,5);
 if(history){
  finds.push({name:'Fossilised Biosignatures',type:'Palaeobiology',icon:'🦠',rarity:'Rare',resource:null,
   description:history.evidence+'. Estimated extinction '+history.ageBillionYears+' billion years ago. Possible cause: '+history.cause+'.'});
  if(history.ancientTechnology)finds.push({name:'Ancient Technology',type:'Archaeological anomaly',icon:'✧',rarity:'Extraordinary',
   resource:{item:'Ancient Technology',amount:.5},description:'Fragments of engineered technology found within ancient strata. The origin remains uncertain.'});
 }
 finds.push(...planetaryIngredients(p,seed).slice(0,Math.max(1,8-finds.length)));
 return finds.map((f,i)=>{
  const loot=f.resource===null?null:f.resource||RESOURCE_DROPS[f.name]||null;
  const rnd=seeded(hash(seed+'|'+p.seed+'|'+p.id+'|'+i));
  return {...f,resource:loot?{item:loot.item,amount:loot.amount}:null,
   x:clamp([.24,.72,.33,.68,.47][i%5]+(rnd()-.5)*.08,.14,.85),
   y:clamp([.37,.46,.67,.72,.56][i%5]+(rnd()-.5)*.07,.28,.78)};
 });
}

function init(api){
 const terrain=$('terrainOverlay'),toolbar=terrain.querySelector('.terrain-toolbar');
 const frame=$('terrainFrame');
 let modal=null,scanning=false,selectedIndex=-1,lastSignature='',livePositions=[];
 const nav=node('nav','rt-nav');nav.setAttribute('aria-label','Gameplay navigation');
 const tabs=[
  ['home','⌂ My Planet'],
  ['galaxy','✧ Galaxy'],
  ['journal','▣ Journal'],
  ['resources','◈ Resources'],
  ['profile','◉ Profile']
 ];
 const tabButtons=new Map();
 tabs.forEach(([id,label])=>{const b=node('button','rt-tab',label);b.type='button';nav.append(b);tabButtons.set(id,b);});
 document.body.append(nav);
 const scanBtn=node('button','rt-explore-btn','⌁ Scan Planet');scanBtn.type='button';toolbar.prepend(scanBtn);
 const markers=node('div','rt-markers');markers.hidden=true;terrain.append(markers);
 const scanbar=node('div','rt-scanbar');scanbar.hidden=true;terrain.append(scanbar);
 const selectedCard=node('div','rt-popover');selectedCard.hidden=true;terrain.append(selectedCard);
 const radar=node('div','cy-radar');radar.hidden=true;radar.setAttribute('role','dialog');radar.setAttribute('aria-modal','true');radar.setAttribute('aria-label','Planetary radio wave survey');
 radar.innerHTML='<div class="cy-scanfx"><div class="cy-scope"><div class="grid"></div><div class="sweep"></div><div class="ring"></div><div class="ring r2"></div><div class="ring r3"></div><div class="core"></div></div></div><div class="cy-scan-header"><small>PLANETARY RADIO-WAVE SURVEY</small><h2 id="rtScanName">Transmitting scan</h2><p>Triangulating mineral, chemical and atmospheric signals</p></div><div class="cy-scan-progress"><span id="rtProgress">0% · Acquiring signal</span><div class="cy-bar"><div id="rtFill"></div></div></div><div class="cy-result" id="rtResult" hidden></div>';
 document.body.append(radar);
 const sheets={};
 for(const kind of ['home','journal','resources']){
  const outer=node('section','rt-overlay');outer.hidden=true;outer.setAttribute('role','dialog');outer.setAttribute('aria-modal','true');outer.setAttribute('aria-label',kind);
  const inner=node('div','rt-sheet');outer.append(inner);document.body.append(outer);
  sheets[kind]={outer,inner};
 }
 function current(){
  const p=api.getPlanet();if(!p||api.getMode()!=='system')return null;
  const key=api.getSeed()+'|'+p.seed+'|'+p.id;
  const findings=normalFindings(p,api.getSeed()),record=state.worlds[key]||null;
  return {p,key,findings,record};
 }
 function ensureRecord(c){
  const rec=state.worlds[c.key]||{surveyed:false,collected:{},name:c.p.name,system:api.getSystem(),planetId:c.p.id,galaxySeed:api.getSeed(),type:c.p.type,findings:[]};
  if(!rec.collected||typeof rec.collected!=='object')rec.collected={};
  return rec;
 }
 function closeSheets(){Object.values(sheets).forEach(s=>s.outer.hidden=true);}
 function highlightTab(which){tabButtons.forEach((button,name)=>button.classList.toggle('active',name===which));}
 function updateNavigation(){
  const totals=aggregate().totals,units=Object.values(totals).reduce((n,x)=>n+x,0);
  const btn=tabButtons.get('resources');btn.textContent='◈ Resources'+(units?' ('+units.toFixed(1)+')':'');
 }
 function recordFinding(c){
  const rec=ensureRecord(c);rec.surveyed=true;rec.name=c.p.name;rec.system=api.getSystem();rec.type=c.p.type;rec.findings=c.findings;rec.history=c.p.life?.pastLife||null;state.worlds[c.key]=rec;persist();api.onSurvey?.();
 }
 function collect(i){
  const c=current();if(!c||!c.record?.surveyed)return;
  const item=c.findings[i];
  if(!item?.resource||c.record.collected[i])return;
  c.record.collected[i]=true;persist();awardLaboratoryDeposit(item);renderMarkers();renderSelected(i);updateNavigation();
 }
 function uncollected(c){return c.findings.filter((f,i)=>f.resource&&!c.record?.collected?.[i]).length;}
 function collectAll(){
  const c=current();if(!c||!c.record?.surveyed)return;
  c.findings.forEach((f,i)=>{if(f.resource&&!c.record.collected[i]){c.record.collected[i]=true;awardLaboratoryDeposit(f);}});
  persist();renderMarkers();selectedCard.hidden=true;updateNavigation();
 }
 function showSheet(which){
  setLabVisible(false);
  if(which!=='home')setWorldVisible(false);
  closeSheets();
  const sheet=sheets[which];if(!sheet)return;
  sheet.outer.hidden=false;highlightTab(which);
  const inner=sheet.inner;inner.replaceChildren();
  const header=node('div','rt-head');const left=node('div');
  left.append(node('small','rt-eyebrow','CLAIM YOUR PLANET · RESOURCE TESTER'));
  left.append(node('h2','',which==='resources'?'Resources Inventory':which==='journal'?'Explorer Journal':'My Planet'));
  const exit=node('button','rt-btn','✕ Close');exit.onclick=()=>{closeSheets();highlightTab('galaxy');};header.append(left,exit);inner.append(header);
  if(which==='resources'){
    inner.append(node('p','','Resources are earned only once from relevant scanned discoveries. They are stored for future colonisation, building and research mechanics, which are not enabled yet.'));
    const inv=aggregate().totals,grid=node('div','rt-grid');const entries=Object.entries(inv).sort((a,b)=>a[0].localeCompare(b[0]));
    for(const [label,amount] of entries){
      const card=node('article','rt-card');card.append(node('strong','',iconMap[label]+' '+label),node('div','rt-amount',amount.toFixed(1)+' units'),node('small','', 'Collected from planetary anomalies'));grid.append(card);
    }
    if(!entries.length)grid.append(node('div','rt-empty','No resources yet. Explore a planet, scan it and collect a resource-bearing finding.'));
    inner.append(grid,node('div','rt-ribbon','Resource amounts are fictional game units. This is a single-player browser save, not an online trading wallet.'));
    const lab=readCosmicLab();
    inner.append(node('h3','','Laboratory · Collected Ingredients'));
    const labGrid=node('div','rt-grid');
    for(const [id,label] of COSMIC_TEST_INGREDIENTS){const card=node('article','rt-card');card.append(node('strong','',label),node('p','',String(Math.max(0,Number(lab.stock?.[id])||0))+' available'));labGrid.append(card);}
    const cultureCard=node('article','rt-card');cultureCard.append(node('strong','','🧫 First Life Culture'),node('p','',String(Math.max(0,Number(lab.cultures)||0))+' ready for seeding'));
    const seedBtn=node('button','rt-btn primary','Seed ASTRA-01');
    seedBtn.disabled=!(lab.cultures>0)||!!lab.seeded;
    if(lab.seeded){const phase=seedingState();cultureCard.append(node('p','',phase.status==='microbes'?'✓ First microbial life established on ASTRA-01':'◷ Seeding in progress — '+Math.ceil(phase.remaining/60000)+' minutes or less remaining'));}
    else{
      seedBtn.onclick=()=>{
        const next=readCosmicLab();
        if(next.seeded||!(next.cultures>0))return showSheet('resources');
        if(!confirm('Use one First Life Culture to initiate microbial seeding on ASTRA-01?'))return;
        next.cultures-=1;next.seeded=true;next.seedStartedAt=Date.now();
        if(saveCosmicLab(next)){showSheet('resources');}else alert('Unable to save seeding progress. Please check browser storage.');
      };
      cultureCard.append(seedBtn);
    }
    labGrid.append(cultureCard);inner.append(labGrid);
    const labOpen=node('button','rt-btn','⚗ Open Laboratory');
    labOpen.onclick=openLaboratory;
    inner.append(labOpen);

  }
  if(which==='journal'){
    const all=Object.values(state.worlds).filter(r=>r?.surveyed);
    const findings=all.flatMap(r=>(r.findings||[]).map((f,i)=>({r,f,i})));
    const rare=findings.filter(({f})=>f.rarity==='Rare'||f.rarity==='Extraordinary').length;
    const collected=findings.filter(({r,f,i})=>f.resource&&r.collected?.[i]).length;
    const stats=node('div','rt-stats');
    [[all.length,'Planets surveyed'],[findings.length,'Journal findings'],[collected,'Collected deposits']].forEach(([number,label])=>{const c=node('div','rt-stat');c.append(node('strong','',number),node('span','',label));stats.append(c);});
    inner.append(node('p','','Each scan records geological findings and any detected biological history. Not every finding awards resources.'),stats);
    const past=all.filter(r=>r.history);
    if(past.length){
      inner.append(node('h3','','Extinct World Records'));
      const cards=node('div','rt-grid');
      past.forEach(r=>{const card=node('article','rt-card');
       card.append(node('strong','','🦠 '+r.name+' — Extinct World'),node('p','',r.history.evidence+'. '+r.history.cause+'.'),
         node('small','',r.history.ancientTechnology?'Ancient technology signal detected':'No ancient technology found'));
       cards.append(card);});inner.append(cards);
    }
    const grid=node('div','rt-grid');
    findings.reverse().forEach(({r,f,i})=>{
      const card=node('article','rt-card');card.append(node('strong','',f.icon+' '+f.name),node('small','',r.name+' · '+f.rarity+' · '+f.type),node('p','',f.description));
      card.append(node('p','',f.resource?(r.collected?.[i]?'✓ Collected: ':'Available: ')+f.resource.amount.toFixed(1)+' '+f.resource.item:'Journal only · No extractable resource'));
      grid.append(card);
    });
    if(!findings.length)grid.append(node('div','rt-empty','The journal is empty. Enter terrain or atmosphere and run a Planet Scan.'));
    inner.append(grid,node('p','','Rare and extraordinary discoveries: '+rare+'. Findings have fixed rarity for a given planet and galaxy seed.'));
  }
  if(which==='home'){
    if(state.home){
      inner.append(node('p','','Your locally designated homeworld. Ownership is not public or account-backed in this tester.'));
      const card=node('div','rt-card');card.append(node('strong','',state.home.name),node('small','','System: '+state.home.system),node('p','','Homeworld designation: '+state.home.owner));
      const go=node('button','rt-btn primary','Explore My Planet');
      go.onclick=()=>{closeSheets();if(!api.goToPlanet(state.home.id,state.home.galaxySeed))showSheet('home');else highlightTab('galaxy');};
      card.append(go);inner.append(card);
    }else{
      inner.append(node('div','rt-empty','No home planet selected. Choose a planet in Galaxy view and use the existing Claim field to designate your homeworld locally.'));
      const go=node('button','rt-btn primary','Browse planets');go.onclick=()=>navigateGalaxy();inner.append(go);
    }
  }
 }
 function navigateGalaxy(){setLabVisible(false);setWorldVisible(false);closeSheets();if(api.isTerrainOpen())api.closeTerrain();api.backToGalaxy();highlightTab('galaxy');}
 function setHome(p,owner){
  if(!p||!owner)return;
  state.home={id:p.id,galaxySeed:api.getSeed(),name:p.name,system:api.getSystem(),owner:String(owner).slice(0,80)};persist();updateNavigation();
 }
 function renderSelected(i){
  const c=current();if(!c||!c.record?.surveyed)return;
  const f=c.findings[i];if(!f)return;
  selectedIndex=i;selectedCard.hidden=false;selectedCard.replaceChildren();
  selectedCard.append(node('div','rt-rarity',f.rarity+' · '+f.type),node('h3','',f.icon+' '+f.name),node('p','',f.description));
  const line=f.resource?(c.record.collected[i]?'✓ Collected ': 'Available reward: ')+f.resource.amount.toFixed(1)+' '+f.resource.item:'Journal only · No collectable resource';
  selectedCard.append(node('p','',line));
  const actions=node('div','rt-popover-actions');
  const close=node('button','rt-btn','Close');close.onclick=()=>selectedCard.hidden=true;actions.append(close);
  if(f.resource){const take=node('button','rt-btn primary',c.record.collected[i]?'✓ Collected':'Collect '+f.resource.item);take.disabled=!!c.record.collected[i];take.onclick=()=>collect(i);actions.append(take);}
  selectedCard.append(actions);
 }
 function applyPositions(){
  if(!api.isTerrainOpen()||markers.hidden)return;
  const c=current();if(!c?.record?.surveyed)return;
  [...markers.children].forEach((button,i)=>{
    const pos=livePositions[i];
    const visible=!!pos&&pos.visible===true&&Number.isFinite(pos.x)&&Number.isFinite(pos.y);
    button.hidden=!visible;
    if(visible){button.style.left=pos.x+'px';button.style.top=pos.y+'px';}
  });
 }
 frame.addEventListener('load',()=>{
  livePositions=[];
  const c=current();
  if(!c||!api.isTerrainOpen())return;
  if(c.p.type==='gasGiant'){
    frame.contentWindow.postMessage({kind:'rt:set-anchors',planetId:c.p.id,
       anchors:c.findings.map(f=>({x:f.x,y:f.y}))},location.origin);
  }
 });
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.kind!=='rt:positions')return;
  const c=current();if(!c||!api.isTerrainOpen()||Number(e.data.planetId)!==c.p.id)return;
  if(!Array.isArray(e.data.anchors))return;
  livePositions=e.data.anchors.slice(0,8);
  applyPositions();
 });
 function renderMarkers(){
  const c=current(),visible=api.isTerrainOpen()&&!!c?.record?.surveyed;
  lastSignature=c?(c.key+'|'+api.isTerrainOpen()+'|'+!!c.record?.surveyed+'|'+JSON.stringify(c.record?.collected||{})):'none';
  markers.hidden=!visible;markers.replaceChildren();selectedCard.hidden=true;
  scanbar.hidden=!api.isTerrainOpen()||!c;
  if(!api.isTerrainOpen()||!c)return;
  scanBtn.textContent=c.record?.surveyed?'✓ Scan Complete':'⌁ SCAN PLANET';
  scanBtn.disabled=!!c.record?.surveyed;
  scanbar.replaceChildren();
  const status=node('span','rt-caption',c.record?.surveyed?c.findings.length+' anomalies located':'Unexplored · Scan required');
  scanbar.append(status);
  if(c.record?.surveyed){
    const outstanding=uncollected(c);
    const take=node('button','rt-btn primary','Auto Collect All'+(outstanding?' ('+outstanding+')':''));
    take.disabled=!outstanding;take.onclick=collectAll;scanbar.append(take);
    const journal=node('button','rt-btn','Journal');journal.onclick=()=>showSheet('journal');scanbar.append(journal);
    c.findings.forEach((f,i)=>{
      const button=node('button','rt-marker'+(c.record.collected?.[i]?' done':'')+(!f.resource?' nonresource':''),c.record.collected?.[i]?'✓':f.icon);
      button.type='button';button.hidden=true;
      button.dataset.name=f.name;button.setAttribute('aria-label','Inspect '+f.name);
      button.onclick=()=>renderSelected(i);
      markers.append(button);
    });
    applyPositions();
  }
 }
 function sync(){
  const c=current(),visible=api.isTerrainOpen();
  scanBtn.hidden=!visible||!c;
  if(!visible||!c){markers.hidden=true;selectedCard.hidden=true;scanbar.hidden=true;}
  else if(!scanning){
   const signature=c?(c.key+'|'+visible+'|'+!!c.record?.surveyed+'|'+JSON.stringify(c.record?.collected||{})):'none';
   if(signature!==lastSignature)renderMarkers();
  }
  updateNavigation();
 }
 function scan(){
  const c=current();if(!c||scanning||!api.isTerrainOpen())return;
  if(c.record?.surveyed){renderMarkers();return;}
  scanning=true;radar.hidden=false;radar.classList.remove('done');
  $('rtResult').hidden=true;$('rtScanName').textContent='Scanning '+c.p.name;
  const began=performance.now(),duration=2600;
  function tick(now){
   if(!scanning)return;
   const p=Math.min(1,(now-began)/duration);
   $('rtFill').style.width=(p*100).toFixed(1)+'%';
   $('rtProgress').textContent=Math.round(p*100)+'% · '+(p<.33?'Transmitting radio waves':p<.69?'Identifying anomalies':p<.9?'Mapping deposits':'Recording discoveries');
   if(p<1){requestAnimationFrame(tick);return;}
   scanning=false;recordFinding(c);const refreshed=current();radar.classList.add('done');
   const card=$('rtResult');card.hidden=false;card.replaceChildren();
   card.append(node('span','icon','⌁'),node('span','grade','SURVEY COMPLETE'),node('h2','',c.p.name),node('p','',refreshed.findings.length+' planetary findings recorded in the Explorer Journal. Resources appear as highlighted icons in the terrain or atmosphere.'));
   const resourceCount=refreshed.findings.filter(f=>!!f.resource).length;
   card.append(node('p','',resourceCount+' resource-bearing locations · '+(refreshed.findings.length-resourceCount)+' scientific observations'));
    const history=refreshed.record?.history;
    card.append(node('p','',history?'🦠 EXTINCT WORLD — '+history.evidence+'. No current life detected.':'BIOLOGICAL HISTORY — No ancient biosignatures detected within this survey.'));
    if(history?.ancientTechnology)card.append(node('p','','✧ RARE ANCIENT TECHNOLOGY — inspect its marker to collect 0.5 Ancient Technology.'));
   const row=node('div','cy-actionrow');
   const view=node('button','','View Findings');view.onclick=()=>{radar.hidden=true;renderMarkers();};
   const all=node('button','','Auto Collect All ('+resourceCount+')');all.onclick=()=>{radar.hidden=true;collectAll();};
   row.append(view,all);card.append(row);sync();
  }requestAnimationFrame(tick);
 }
 function onTerrainChange(){lastSignature='';livePositions=[];scanBtn.hidden=!api.isTerrainOpen();sync();}
 // V20 Homeworld: dedicated visual home planet, no manual claim required.
 let homeWorldOverlay=null;
 let laboratoryOverlay=null;
 function setLabVisible(visible){
   if(!laboratoryOverlay)return;
   laboratoryOverlay.hidden=!visible;
   laboratoryOverlay.style.visibility=visible?'visible':'hidden';
   laboratoryOverlay.style.pointerEvents=visible?'auto':'none';
   window.COSMIC_GALAXY_SUSPENDED=visible||Boolean(homeWorldOverlay&&!homeWorldOverlay.hidden);
   notifyHomeMode(visible||Boolean(homeWorldOverlay&&!homeWorldOverlay.hidden));
 }
 function openLaboratory(){
   closeSheets();setWorldVisible(false);
   if(!laboratoryOverlay){
      laboratoryOverlay=node('section','cosmic-laboratory-overlay');
      laboratoryOverlay.style.cssText='position:fixed;inset:0;z-index:11000;background:#020713;';
      const frame=document.createElement('iframe');
      frame.title='COSMIC My Planet Laboratory';
      frame.src='COSMIC_My_Planet_Laboratory_V20_Test.html';
      frame.style.cssText='display:block;width:100%;height:100%;border:0;';
      laboratoryOverlay.append(frame);document.body.append(laboratoryOverlay);
   }else{
      const old=laboratoryOverlay.querySelector('iframe');
      old?.contentWindow?.postMessage({type:'COSMIC_LAB_REFRESH'},location.origin);
   }
   setLabVisible(true);
   highlightTab('home');
 }

 function setWorldVisible(visible){
   if(!homeWorldOverlay)return;
   homeWorldOverlay.hidden=!visible;
   homeWorldOverlay.style.visibility=visible?'visible':'hidden';
   homeWorldOverlay.style.pointerEvents=visible?'auto':'none';
   const view=homeWorldOverlay.querySelector('iframe');
   try{view?.contentWindow?.postMessage({type:'COSMIC_SET_WORLD_ACTIVE',active:visible},location.origin);}catch(e){}
   notifyHomeMode(visible);
   window.COSMIC_GALAXY_SUSPENDED=visible;
 }

 function notifyHomeMode(visible){if(window.parent!==window)window.parent.postMessage({type:'COSMIC_HOMEWORLD_VISIBILITY',visible},window.location.origin);}
 function openMyWorld(){
   setLabVisible(false);
   closeSheets();
   if(!homeWorldOverlay){
     homeWorldOverlay=node('div','cosmic-homeworld-overlay');
     homeWorldOverlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#020713;';
     const view=document.createElement('iframe');
     view.title='My Planet — six continent orbit and terrain';
     view.src='COSMIC_My_Planet_V20_Test.html';
     view.addEventListener('load',()=>{view.contentWindow?.postMessage({type:'COSMIC_SET_WORLD_ACTIVE',active:!homeWorldOverlay.hidden},location.origin);});
     view.setAttribute('allow','fullscreen');
     view.style.cssText='position:absolute;inset:0;border:0;width:100%;height:100%;';
     homeWorldOverlay.append(view);
     document.body.append(homeWorldOverlay);
   }
   setWorldVisible(true);
   highlightTab('home');
 }
 window.addEventListener('message',event=>{
   if(event.origin!==window.location.origin)return;
   if(!homeWorldOverlay||event.source!==homeWorldOverlay.querySelector('iframe')?.contentWindow)return;
   const message=event.data;
   if(!message||message.type!=='COSMIC_MY_WORLD_NAV')return;
   const dest=message.destination;
   if(dest==='home'){openMyWorld();return;}
   if(dest==='laboratory'){openLaboratory();return;}
   if(dest==='galaxy'){setWorldVisible(false);navigateGalaxy();return;}
   if(dest==='journal'||dest==='resources'){
      setWorldVisible(false);
      showSheet(dest);
   }
 });
 window.addEventListener('message',event=>{
   if(event.origin!==location.origin)return;
   if(!laboratoryOverlay||event.source!==laboratoryOverlay.querySelector('iframe')?.contentWindow)return;
   if(event.data?.type!=='COSMIC_LAB_NAV')return;
   if(event.data.destination==='home')openMyWorld();
   else if(event.data.destination==='resources')showSheet('resources');
 });

 // While seeding, only the My Planet tab pulses. The progress bar lives inside My Planet.
 const homeButton=tabButtons.get('home');
 const activityDot=node('span','cosmic-home-activity');
 activityDot.setAttribute('aria-hidden','true');
 activityDot.style.cssText='display:none;width:7px;height:7px;flex:none;border-radius:50%;background:#51c9ff;box-shadow:0 0 8px #39c4ff;';
 homeButton.append(activityDot);
 homeButton.style.display='inline-flex';
 homeButton.style.alignItems='center';
 homeButton.style.justifyContent='center';
 homeButton.style.gap='5px';
 const activityStyle=node('style','');
 activityStyle.textContent='@keyframes cosmicPulse{0%,100%{opacity:.38;transform:scale(.76);box-shadow:0 0 3px #4bc9ff}50%{opacity:1;transform:scale(1.38);box-shadow:0 0 14px #4bc9ff}} .cosmic-home-activity.is-seeding{display:inline-block!important;animation:cosmicPulse 1.5s ease-in-out infinite} @media(prefers-reduced-motion:reduce){.cosmic-home-activity.is-seeding{animation:none;opacity:1}}';
 document.head.append(activityStyle);
 function refreshSeedingIndicator(){
  const seeding=seedingState().status==='seeding';
  activityDot.classList.toggle('is-seeding',seeding);
  homeButton.setAttribute('aria-label',seeding?'My Planet — seeding in progress':'My Planet');
 }
 window.setInterval(refreshSeedingIndicator,1000);
 document.addEventListener('visibilitychange',refreshSeedingIndicator);
 window.addEventListener('focus',refreshSeedingIndicator);
 refreshSeedingIndicator();

 for(const [key,b] of tabButtons){
  b.onclick=()=>{if(key==='galaxy'){setWorldVisible(false);navigateGalaxy();}else if(key==='home')openMyWorld();else if(key==='profile'){window.parent.postMessage({type:'COSMIC_SHOW_PROFILE'},location.origin);}else{setWorldVisible(false);showSheet(key);}};
 }
 scanBtn.onclick=scan;
 const observer=new MutationObserver(onTerrainChange);observer.observe(terrain,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if(!radar.hidden&&!scanning){radar.hidden=true;e.stopPropagation();}
  else if(!selectedCard.hidden){selectedCard.hidden=true;e.stopPropagation();}
  else if(Object.values(sheets).some(sheet=>!sheet.outer.hidden)){closeSheets();highlightTab('galaxy');e.stopPropagation();}
 },true);
 highlightTab('galaxy');sync();
 function getSurvey(p){if(!p)return null;const rec=state.worlds[api.getSeed()+'|'+p.seed+'|'+p.id];return rec?.surveyed?rec:null;}
 function getProgress(){const records=Object.values(state.worlds).filter(r=>r?.surveyed);
  return {surveyed:records.length,extinct:records.filter(r=>r.history).length,
   technology:records.filter(r=>(r.findings||[]).some(f=>f.name==='Ancient Technology')).length};}
 return {sync,scan,setHome,showSheet,getSurvey,getProgress};
}
window.CYResourceTester={init,RESOURCE_DROPS};
})();
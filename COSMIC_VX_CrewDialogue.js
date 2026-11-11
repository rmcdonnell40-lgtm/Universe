/* COSMIC VX — CREW COMMS / playable narrative conversation prototype.
   Self-contained save-slot demo; it does not spend real resources or complete canon story missions. */
(()=>{
'use strict';
const KEY='cosmic:vx:crew-dialogue:demo:v1';
const A={
 sanaa:{name:'Dr. Sanaa Imani',role:'Lead Exobiologist',tag:'SCIENCE DIVISION',skin:'#bd806c',hair:'#191b27',coat:'#dbe5ed',trim:'#3ec8d3',background:'#123d52',initial:64},
 ward:{name:'Commander Helena Ward',role:'Expedition Commander',tag:'ODYSSEY COMMAND',skin:'#d0a186',hair:'#343f4b',coat:'#26384d',trim:'#83b5db',background:'#283849',initial:52},
 marcus:{name:'Marcus Vale',role:'Chief Engineer',tag:'ENGINEERING DIVISION',skin:'#b9856b',hair:'#3a2d29',coat:'#7d6c54',trim:'#e7a75c',background:'#4b3026',initial:58},
 mara:{name:'Lt. Mara Chen',role:'Expedition Pilot',tag:'FLIGHT OPERATIONS',skin:'#d4aa8c',hair:'#23222a',coat:'#2b4053',trim:'#6fd4d6',background:'#1d3b51',initial:60}
};
const missions={
 first:{number:'01',title:'THE FIRST SPARK',category:'EXOBIOLOGY',location:'ASTRA-01 // SCIENCE LAB',person:'sanaa',risk:'MODERATE',brief:'The team has isolated the seven chemical precursors needed for a controlled microbial culture. Dr. Imani believes the colony is ready to attempt its first experiment. But once a viable organism exists, every decision about containment and seeding carries consequences.',objectives:['Review the exobiology report','Discuss the risks with Dr. Imani','Record a decision on initial cultivation'],rewards:'Culture Chamber clearance · Scientific trust',caption:'A first culture. A new chapter in biological history.'},
 shelter:{number:'02',title:'A PLACE TO CALL HOME',category:'COLONY OPERATIONS',location:'ODYSSEY // COMMAND',person:'ward',risk:'LOW',brief:'Forty crew members remain in temporary surface quarters. Commander Ward has requested additional habitats, while the science team needs the same materials for a research expansion. The expedition cannot fund both immediately.',objectives:['Hear the Commander’s concerns','Choose a resource priority','Notify the expedition staff'],rewards:'Colony allocation report · Command trust',caption:'Every new world needs somewhere to call home.'},
 blackout:{number:'03',title:'THE POWER SHORTFALL',category:'ENGINEERING',location:'ASTRA-01 // GENERATOR BAY',person:'marcus',risk:'HIGH',brief:'An unexpected storm has damaged an auxiliary power relay. The science complex and surface accommodation both depend on the main grid. Marcus needs a decision before the next atmospheric front arrives.',objectives:['Review grid stability','Pick an emergency power plan','Issue the engineering work order'],rewards:'Engineering support · Colony safety',caption:'One failing relay can change the future of a settlement.'},
 signal:{number:'04',title:'THE QUIET SIGNAL',category:'RECONNAISSANCE',location:'ODYSSEY // FLIGHT DECK',person:'mara',risk:'UNKNOWN',brief:'Mara Chen has intercepted an anomalous signal from an apparently uninhabited moon. The transmission is too structured to dismiss as ordinary background noise, yet there is no evidence of an active civilisation.',objectives:['Analyse the intercepted pattern','Discuss the risks with Mara','Decide how to investigate'],rewards:'Uncharted coordinates · Flight crew trust',caption:'The most dangerous discoveries rarely announce themselves.'}
};
const D={
 sanaa:{
 start:{text:'The latest samples are in, Pilot. Water quality is stable, the carbon chains hold together, and we have the phosphorus we need. For the first time, I think we can attempt an independent microbial culture here on ASTRA-01. I want you involved in the decision.',choices:[
  ['Let’s do it. Begin the culture.','ready','sanaa',2],
  ['What happens if the experiment goes wrong?','risk','sanaa',1],
  ['Shouldn’t the rest of the crew have a say?','crew','ward',2],
  ['I want more data before we commit.','caution','sanaa',2]]},
 ready:{text:'Then I’ll prepare the sealed growth chamber. Understand what this means: we are not just finding life in the universe. We may be introducing the first living organisms this world has ever known. Do you authorise the controlled trial?',choices:[
  ['Authorise the first controlled culture.','culture','sanaa',7,'culture_authorised'],
  ['Only after a full containment review.','containment','sanaa',4,'containment_first'],
  ['Not yet. Tell me about the risks.','risk','sanaa',0]]},
 risk:{text:'Our immediate danger is containment failure. We have no native biosphere to disrupt, according to the surveys, but “none detected” is not the same as “none exists.” Once we cultivate the organism, our obligation is to prevent an accidental release.',choices:[
  ['Establish a stricter isolation protocol.','containment','sanaa',5,'containment_first'],
  ['The potential justifies the risk.','culture','ward',-2,'culture_authorised'],
  ['I need to think about this.','caution','sanaa',1]]},
 crew:{text:'Marcus wants the energy reserved for infrastructure. Helena is worried about crew safety. I understand both of them. But if we only ever choose what is safe, we’ll never answer why we came this far.',choices:[
  ['Request a formal crew review.','containment','ward',4,'containment_first'],
  ['Science has to move forward.','culture','sanaa',5,'culture_authorised'],
  ['We can revisit this later.','caution','sanaa',1]]},
 caution:{text:'Then we wait. I would rather earn your confidence than rush a discovery we cannot undo. Come back when you are ready; the cultures will remain in sterile storage.',choices:[]},
 containment:{text:'Agreed. I’ll bring the isolation plan to Commander Ward before any sample leaves the chamber. Thank you for taking the science seriously, not just its possibilities.',choices:[]},
 culture:{text:'Authorisation recorded. I’ll initiate the first sequence. If this succeeds, history will remember the moment a small group of people gave a silent planet its first living cell.',choices:[]}
 },
 ward:{
 start:{text:'Pilot, forty people are still living in temporary modules on the surface. The science division wants the same materials for another lab. My responsibility is to keep this expedition alive. Tell me where you stand.',choices:[
 ['The crew comes first. Build the habitats.','habitat','ward',7,'habitats_first'],
 ['Research could secure the colony’s future.','lab','sanaa',5,'research_first'],
 ['Give me time to find more supplies.','supplies','ward',2,'resource_mission']]},
 habitat:{text:'Good. I’ll approve the housing allocation and tell engineering to begin preparing modules. We can’t call ASTRA-01 a home while half the team is sleeping in cargo containers.',choices:[]},
 lab:{text:'I respect the argument, even if I don’t like the timetable. I’ll sign a limited research allocation. You’ll be explaining the delay to the crew, not just me.',choices:[]},
 supplies:{text:'You have one expedition cycle. Return with a credible supply plan and I’ll reconsider. If you can’t, I will make the call for you.',choices:[]}
 },
 marcus:{
 start:{text:'We’ve got a problem, Pilot. That last ion storm cooked the auxiliary relay. The reserve batteries can keep either the habitation heaters or the research grid running at full power tonight. Not both.',choices:[
 ['Protect the crew quarters.','heaters','marcus',6,'crew_power'],
 ['Keep the lab online.','lab','sanaa',4,'science_power'],
 ['Can we improvise a temporary relay?','relay','marcus',4,'repair_plan']]},
 heaters:{text:'Right answer in my book. We’ll divert power to the habitation ring. Sanaa will have to suspend experiments, but everyone gets through the night warm.',choices:[]},
 lab:{text:'Understood. I’ll keep the culture chamber stable, but I need you to tell the Commander why we’re cutting the heaters to minimum power.',choices:[]},
 relay:{text:'Actually... there’s an old drive regulator in Cargo Bay Three. Give me a maintenance team and I might be able to make it survive the night. Not pretty, but it’s a plan.',choices:[]}
 },
 mara:{
 start:{text:'You need to hear this. I was mapping the outer moon when this sequence appeared on the comms spectrum. Thirty-one pulses. An eleven-second pause. Then the exact same sequence again. It’s too regular to ignore.',choices:[
 ['Show me the signal analysis.','analysis','mara',2],
 ['Could it be equipment interference?','skeptic','mara',1],
 ['I want to fly out and investigate.','flight','mara',5,'send_flight']]},
 analysis:{text:'No navigation beacons, no orbital traffic, no historical survey marker. The source is buried under two kilometres of regolith. Whatever it is, it has been there for a long time.',choices:[
 ['Send a probe. Keep our distance.','probe','ward',3,'send_probe'],
 ['Prepare a crewed flight. I’m going.','flight','mara',4,'send_flight'],
 ['Classify it until we have more data.','classified','ward',2,'classify_signal']]},
 skeptic:{text:'I ran the diagnostics twice. The pattern is coming from the moon, not our instruments. I’m not saying it’s alien. I’m saying physics owes us an explanation.',choices:[
 ['Okay. Dispatch a remote probe.','probe','mara',4,'send_probe'],
 ['Then I want to see it myself.','flight','mara',5,'send_flight'],
 ['Keep it out of the crew briefings.','classified','ward',1,'classify_signal']]},
 flight:{text:'I was hoping you’d say that. I’ve already plotted a low-energy transfer. I’ll fly wing, you take point. We tell Ward before launch. Whatever we find, we bring the crew home.',choices:[]},
 probe:{text:'Smart. I’ll configure a long-range scanner and send the coordinates to the probe console. Maybe we get answers without putting anyone in danger.',choices:[]},
 classified:{text:'All right. Encrypted log only. But if that thing keeps transmitting, sooner or later someone else on the ship will notice it too.',choices:[]}
 }
};
const slot=()=>window.COSMIC_VX_STORAGE;
const load=()=>{try{return JSON.parse(slot()?.getItem(KEY)||'null')||{}}catch(_){return {}}};
const fresh=()=>({relations:Object.fromEntries(Object.entries(A).map(([k,v])=>[k,v.initial])),decisions:{},seen:{},history:[]});
let state={...fresh(),...load()};
state.relations={...fresh().relations,...(state.relations||{})};
state.decisions=state.decisions||{};state.seen=state.seen||{};state.history=Array.isArray(state.history)?state.history:[];
const save=()=>{try{slot()?.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Crew demo save unavailable',e)}};
let actor='sanaa',mission='first',node='start',lastEffect='',onClose=null,onNavigate=null;
const root=document.createElement('section');root.id='cd-overlay';root.hidden=true;
root.innerHTML=
 '<div class="cd-app" role="dialog" aria-modal="true" aria-label="COSMIC Expedition Crew conversations">'+
 '<header class="cd-top"><div class="cd-logo">COSMIC <b>THE SPACE GAME</b></div><div class="cd-top-buttons">'+
 '<button data-cd-nav="home">⌂ MY PLANET</button><button data-cd-nav="galaxy">✧ GALAXY</button><button data-cd-nav="resources">◈ INVENTORY</button><button data-cd-nav="construction">▤ CONSTRUCTION</button><button class="cd-selected" data-cd-nav="crew">◉ CREW</button><button class="cd-exit" data-cd-nav="close">✕ CLOSE</button>'+
 '</div></header>'+
 '<div class="cd-main">'+
 '<aside class="cd-left"><div class="cd-aside-head"><small>ODYSSEY / PERSONNEL</small><h2>EXPEDITION CREW</h2><p>240 souls · 4 available contacts</p></div><div id="cd-people" class="cd-people"></div>'+
 '<div class="cd-ship"><span class="cd-live-dot"></span> ODYSSEY NETWORK<br><strong>ALL CHANNELS SECURE</strong></div></aside>'+
 '<main class="cd-center"><div class="cd-stage"><div class="cd-scene-grid"></div><div class="cd-scene-planet"></div><div class="cd-scene-lab"></div><div id="cd-portrait" class="cd-portrait"></div>'+
 '<div class="cd-stage-label"><span class="cd-live-dot"></span> LIVE HOLOGRAPHIC CHANNEL <span id="cd-location"></span></div></div>'+
 '<div class="cd-conversation"><div class="cd-speaker"><div><small id="cd-department"></small><h1 id="cd-name"></h1><p id="cd-role"></p></div><div class="cd-trust">RELATIONSHIP <strong id="cd-trust-name"></strong><div class="cd-meter"><span id="cd-meter-bar"></span></div></div></div>'+
 '<div class="cd-spoken" id="cd-spoken" aria-live="polite"></div><div id="cd-options" class="cd-options"></div><div id="cd-effect" class="cd-effect" aria-live="polite"></div></div></main>'+
 '<aside class="cd-right"><div class="cd-section-tag">GENESIS INITIATIVE // CAMPAIGN</div><h2>MISSION DOSSIERS</h2><div id="cd-mission-buttons" class="cd-mission-buttons"></div>'+
 '<div class="cd-dossier"><div class="cd-dossier-art"><span>EXPEDITION FILE <b id="cd-mission-number"></b></span><div class="cd-dossier-planet"></div><div class="cd-dossier-structure"></div><strong id="cd-art-title"></strong></div><small id="cd-mission-type"></small><h3 id="cd-mission-title"></h3><p id="cd-mission-brief"></p><h4>MISSION OBJECTIVES</h4><ul id="cd-objectives"></ul><h4>REWARDS / IMPLICATIONS</h4><p id="cd-mission-rewards"></p></div>'+
 '</aside></div>'+
 '<footer class="cd-footer"><span><i class="cd-live-dot"></i> ASTRA-01 · EXPEDITION DAY 42</span><span id="cd-footer-status">NARRATIVE SYSTEM TEST // SAVED SEPARATELY</span><div><button id="cd-log">▣ DECISION LOG</button><button id="cd-reset">↻ RESET DEMO</button></div></footer>'+
 '<div class="cd-history" id="cd-history" hidden><div class="cd-history-header"><h2>CREW DECISION LOG</h2><button id="cd-history-close">✕ CLOSE</button></div><div id="cd-history-content"></div></div>'+
 '</div>';
document.body.append(root);
const $=id=>root.querySelector('#'+id);
const text=(id,value)=>{$(id).textContent=value};
const create=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n};
const clamp=n=>Math.min(100,Math.max(0,n));
function portraitSVG(a){
 const hair=a.hair,skin=a.skin,coat=a.coat,trim=a.trim,id=Object.keys(A).find(x=>A[x]===a);
 const back=id==='sanaa'?'<path d="M95 157Q40 70 96 36Q164 -5 223 45Q260 108 232 199L202 209 103 207Z" fill="'+hair+'"/><circle cx="85" cy="94" r="38" fill="'+hair+'"/><circle cx="228" cy="92" r="36" fill="'+hair+'"/><circle cx="115" cy="46" r="35" fill="'+hair+'"/><circle cx="184" cy="49" r="38" fill="'+hair+'"/>':id==='mara'?'<ellipse cx="218" cy="152" rx="42" ry="87" fill="'+hair+'"/><path d="M92 155Q65 40 160 35Q257 40 229 155Z" fill="'+hair+'"/>':id==='ward'?'<path d="M98 158Q55 45 166 33Q250 47 225 168L197 112 109 117Z" fill="'+hair+'"/>':'<path d="M102 130Q63 51 160 36Q249 42 219 132L193 75 121 83Z" fill="'+hair+'"/>';
 const facial=id==='marcus'?'<path d="M117 204Q160 234 204 204Q196 259 158 262Q126 255 117 204" fill="#5b4239" opacity=".47"/><path d="M134 222q25 10 50 0" stroke="#e9b5a0" stroke-width="3" fill="none"/>':'<path d="M134 225q25 10 50 0" stroke="#8d4c4c" stroke-width="4" fill="none"/>';
 const bangs=id==='sanaa'?'<path d="M105 106Q107 52 156 63Q213 51 219 120Q191 100 169 88Q142 120 105 106Z" fill="'+hair+'"/>':id==='mara'?'<path d="M103 110Q99 53 158 55Q198 54 218 105Q175 92 152 77Q130 109 103 110Z" fill="'+hair+'"/>':id==='ward'?'<path d="M98 110Q117 38 179 53Q210 56 216 91Q166 78 100 122Z" fill="'+hair+'"/>':'<path d="M109 98Q120 54 170 51Q218 53 213 99L190 82 148 91 114 108Z" fill="'+hair+'"/>';
 return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 440" preserveAspectRatio="xMidYMax meet"><defs>'+
 '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+a.background+'"/><stop offset="1" stop-color="#070f20"/></linearGradient><linearGradient id="face" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="'+skin+'"/><stop offset=".65" stop-color="'+skin+'"/><stop offset="1" stop-color="#6a5149"/></linearGradient>'+
 '</defs><rect width="320" height="440" fill="url(#bg)"/><circle cx="245" cy="115" r="135" fill="'+trim+'" opacity=".10"/><path d="M0 380L320 300M0 395L320 315M0 412L320 330" stroke="'+trim+'" stroke-width="1" opacity=".2"/>'+
 '<path d="M24 440Q23 328 97 301L127 289 196 288Q288 294 303 440Z" fill="'+coat+'"/><path d="M111 292L159 352 212 292 198 288 128 287Z" fill="#263b52"/>'+
 '<path d="M139 256L139 305 178 323 188 303 185 258Z" fill="'+skin+'"/>'+
 back+'<ellipse cx="160" cy="163" rx="64" ry="97" fill="url(#face)"/><ellipse cx="97" cy="171" rx="9" ry="19" fill="'+skin+'"/><ellipse cx="224" cy="171" rx="9" ry="19" fill="'+skin+'"/>'+
 bangs+'<path d="M115 158q20-11 40-3m16 0q19-9 38 0" stroke="'+hair+'" stroke-width="6" stroke-linecap="round" fill="none"/>'+
 '<ellipse cx="138" cy="171" rx="10" ry="5" fill="#f1ece8"/><ellipse cx="188" cy="171" rx="10" ry="5" fill="#f1ece8"/><circle cx="140" cy="171" r="4.6" fill="#26363c"/><circle cx="187" cy="171" r="4.6" fill="#26363c"/><circle cx="142" cy="169" r="1.5" fill="#d6ffff"/><circle cx="189" cy="169" r="1.5" fill="#d6ffff"/>'+
 '<path d="M161 179l-5 21 12 2" stroke="#7b5047" stroke-width="2.5" fill="none" opacity=".75"/>'+facial+
 '<path d="M55 350L105 294 154 352 170 440 42 440Z" fill="'+coat+'" opacity=".7"/><path d="M272 350L216 294 172 354 166 440 291 440Z" fill="'+coat+'" opacity=".65"/><path d="M110 299l40 48-19 24-49-56M209 299l-39 48 19 24 49-56" stroke="'+trim+'" stroke-width="3" fill="none" opacity=".8"/>'+
 '<rect x="212" y="371" width="49" height="19" rx="3" fill="#142536" stroke="'+trim+'" stroke-width="1.5"/><path d="M221 380h30" stroke="'+trim+'" stroke-width="2"/><path d="M17 427h286" stroke="#8be0ef" stroke-width="2" opacity=".36"/></svg>';
}
function face(a,small){
 const n=create('div',small?'cd-mini-face':'cd-main-face');n.innerHTML=portraitSVG(a);return n;
}
function missionFor(person){return Object.keys(missions).find(x=>missions[x].person===person)||'first'}
function chooseMission(id){
 if(!missions[id])return;mission=id;actor=missions[id].person;node='start';lastEffect='';render();
}
function chooseActor(id){if(!A[id])return;actor=id;mission=missionFor(id);node='start';lastEffect='';render()}
function renderPeople(){
 const host=$('cd-people');host.replaceChildren();
 for(const [id,p] of Object.entries(A)){
  const b=create('button','cd-person'+(id===actor?' on':''));b.type='button';b.append(face(p,true));
  const content=create('div','cd-person-info');content.append(create('strong','',p.name),create('small','',p.role));
  const meter=create('span','cd-person-meter');const fill=create('i');fill.style.width=clamp(state.relations[id]||0)+'%';meter.append(fill);
  content.append(meter);b.append(content);b.onclick=()=>chooseActor(id);host.append(b);
 }
}
function renderMissions(){
 const host=$('cd-mission-buttons');host.replaceChildren();
 for(const [id,m] of Object.entries(missions)){
  const b=create('button','cd-mission-tab'+(id===mission?' on':''));b.type='button';
  b.append(create('span','',m.number),create('strong','',m.title));
  if(state.decisions[id])b.append(create('small','','✓'));
  b.onclick=()=>chooseMission(id);host.append(b);
 }
}
function renderDossier(){
 const m=missions[mission];
 text('cd-location',m.location);text('cd-mission-number',m.number);text('cd-art-title',m.caption);
 text('cd-mission-type',m.category+' // '+m.risk+' RISK');text('cd-mission-title',m.title);
 text('cd-mission-brief',m.brief);text('cd-mission-rewards',m.rewards);
 const host=$('cd-objectives');host.replaceChildren();
 m.objectives.forEach((label,i)=>{const li=create('li',((i===0)||(i===1&&!!state.seen[mission+':start'])||(i===2&&!!state.decisions[mission]))?'done':'',label);host.append(li)});
 $('cd-footer-status').textContent=state.decisions[mission]?'DECISION SAVED // '+state.decisions[mission].replace(/_/g,' ').toUpperCase():'NARRATIVE PROTOTYPE // NO RESOURCES SPENT';
}
function renderDialog(){
 const a=A[actor],s=D[actor][node]||D[actor].start,value=clamp(state.relations[actor]||0);
 const portrait=$('cd-portrait');portrait.replaceChildren(face(a,false));
 root.style.setProperty('--cd-accent',a.trim);root.style.setProperty('--cd-ambient',a.background);
 text('cd-department',a.tag+' // PERSONNEL FILE');text('cd-name',a.name);text('cd-role',a.role);
 text('cd-trust-name',value>=75?'TRUSTED':value>=50?'COOPERATIVE':value>=30?'CAUTIOUS':'STRAINED');
 $('cd-meter-bar').style.width=value+'%';
 $('cd-spoken').textContent=s.text;
 const options=$('cd-options');options.replaceChildren();
 if(s.choices.length){
  s.choices.forEach((entry,i)=>{
   const b=create('button','cd-choice');b.type='button';
   const idx=create('span','cd-choice-num',String(i+1).padStart(2,'0'));
   b.append(idx,create('span','cd-choice-label',entry[0]),create('span','cd-choice-arrow','↗'));
   b.onclick=()=>selectChoice(entry);
   options.append(b);
  });
 }else{
  const back=create('button','cd-choice cd-return');back.append(create('span','cd-choice-num','↶'),create('span','cd-choice-label','Continue conversation / return to topics'));back.onclick=()=>{node='start';lastEffect='';render();};options.append(back);
  const done=create('div','cd-ending-note',state.decisions[mission]?'◈ A lasting narrative choice has been recorded in this demonstration.':'◈ Conversation concluded. You can speak to this crew member again.');options.append(done);
 }
 text('cd-effect',lastEffect);
}
function selectChoice(entry){
 const [label,target,who,delta,decision]=entry,stamp=mission+':'+node+':'+target;
 let effect='';
 if(!state.seen[stamp]){
  state.seen[stamp]=Date.now();
  if(who&&delta){state.relations[who]=clamp((state.relations[who]??A[who].initial)+delta);effect=(delta>0?'+':'')+delta+' '+A[who].name+' relationship';}
  if(decision&&!state.decisions[mission]){
   state.decisions[mission]=decision;
   effect+=(effect?' · ':'')+'Decision logged: '+decision.replace(/_/g,' ');
  }
  state.history.unshift({at:Date.now(),speaker:A[actor].name,mission:missions[mission].title,line:label,effect});
  state.history=state.history.slice(0,80);save();
 }else effect='Previously discussed — relationship changes are not awarded twice.';
 node=target;lastEffect=effect;render();
}
function render(){renderPeople();renderMissions();renderDossier();renderDialog()}
function open(opts={}){
 onClose=typeof opts.onClose==='function'?opts.onClose:null;
 onNavigate=typeof opts.onNavigate==='function'?opts.onNavigate:null;
 if(opts.mission&&missions[opts.mission]){mission=opts.mission;actor=missions[mission].person;node='start'}
 root.hidden=false;render();
 const first=root.querySelector('.cd-person.on');first?.focus({preventScroll:true});
}
function close(notify=false){
 if(root.hidden)return;root.hidden=true;$('cd-history').hidden=true;
 const cb=notify?onClose:null;onClose=null;onNavigate=null;cb?.();
}
function navigate(dest){
 if(dest==='close'){close(true);return}
 if(dest==='crew')return;
 const cb=onNavigate;close(false);cb?.(dest);
}
root.querySelectorAll('[data-cd-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.cdNav)));
$('cd-log').onclick=()=>{
 const host=$('cd-history-content');host.replaceChildren();
 if(!state.history.length)host.append(create('p','cd-empty','No decisions yet. Speak to a crew member to begin your story.'));
 for(const entry of state.history){
  const card=create('article','cd-log-card');card.append(create('small','',new Date(entry.at).toLocaleString()+' · '+entry.mission),create('b','',entry.speaker),create('p','',entry.line));
  if(entry.effect)card.append(create('em','',entry.effect));host.append(card);
 }
 $('cd-history').hidden=false;
};
$('cd-history-close').onclick=()=>{$('cd-history').hidden=true};
$('cd-reset').onclick=()=>{
 if(!window.confirm('Reset only the COSMIC Crew dialogue demo? Planetary construction, Inventory and real story progress will be untouched.'))return;
 state=fresh();save();node='start';lastEffect='';$('cd-history').hidden=true;render();
};
document.addEventListener('keydown',e=>{
 if(root.hidden)return;
 if(e.key==='Escape'){if(!$('cd-history').hidden)$('cd-history').hidden=true;else close(true);e.preventDefault();return}
 if(!e.altKey&&!e.ctrlKey&&!e.metaKey&&/^[1-5]$/.test(e.key)&&!e.repeat){
  const choices=D[actor][node]?.choices||[];const index=Number(e.key)-1;
  if($('cd-history').hidden&&choices[index]){selectChoice(choices[index]);e.preventDefault()}
 }
});
window.COSMIC_VX_CREW={open,close,selectMission:chooseMission,getDemoState:()=>JSON.parse(JSON.stringify(state)),missions:Object.keys(missions)};
})();
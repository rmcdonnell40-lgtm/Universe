/* COSMIC VX — Surface construction, orbital assets and finite probe expeditions. */
(()=>{
'use strict';
const KEY='cosmic:vx:construction:v1', EXP='claimyourplanet:resource-expedition:v18';
const I=()=>window.COSMIC_VX_INVENTORY, S=()=>window.COSMIC_VX_STORAGE;
const categories=[['planet','◫ PLANET'],['satellites','◎ SATELLITES'],['probes','⌁ PROBES']];
const continents=['Aurelia','Vespera','Caelora','Nivalis','Solara','Thalora'];
/* Matching technical blueprint glyphs: simple vector artwork, one per asset. */
const iconPaths={
 survey:'<path d="M12 17v4M8 21h8M12 17l-4-6m4 6 4-6M9 7a4 4 0 0 1 6 0M6.5 4a8 8 0 0 1 11 0"/><circle cx="12" cy="11" r="1.1"/>',
 solar:'<circle cx="19" cy="4.5" r="1.8"/><path d="M19 1v1m0 5v1m-3.5-3.5h1m5 0h1M5 7l-3 11h18L17 7H5ZM4 12h14M10 7l-1 11m6-11 1 11M10 18v3m4-3v3M7 21h10"/>',
 extractor:'<path d="M4 20h16M6 20V7h12v13M4 7h16M8 7V4h8v3M12 7v10m-2-2 2 3 2-3M8 10h2m4 0h2m-9 3h2m6 0h2M5 4l2-2m10 2 2-2"/>',
 science:'<path d="M9 2h6m-5 0v7l-5.8 9.4A2.4 2.4 0 0 0 6.3 22h11.4a2.4 2.4 0 0 0 2.1-3.6L14 9V2M7 15h10M9 19h.01M14 18h.01M12 12v1"/>',
 launch:'<path d="M12 2c-2.5 3-4.3 7-4.3 12l4.3 3 4.3-3C16.3 9 14.5 5 12 2ZM10 10h4M8 13l-3.5 4.5 3.5-.8m8-3.7 3.5 4.5-3.5-.8M10 18l-1 4m5-4 1 4M4 22h16M19 3v13M19 3h3m-3 4h2m-2 4h2"/>',
 base:'<path d="M2 20h20M4 20v-7h6v7m4 0V9h6v11M3 13l4-5 4 5M13 9l4-6 4 6M6 16h2m8-3h2m-2 3h2M12 20v-4h2m-11 4V8m8 12V8"/>',
 mapping:'<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 11H2v2h7m6-2h7v2h-7M4 10v4m3-4v4m10-4v4m3-4v4M12 9V5m-2-2 2-2 2 2M9 18c2 2 4 2 6 0m-8 3c3.5 3 6.5 3 10 0"/>',
 relay:'<path d="M4 4l10 10m-9-9a10 10 0 0 0 10 10M8 13l3 3m-1 5h8m-4-5v5m2-16a4 4 0 0 1 3 3m-3-7a8 8 0 0 1 7 7M10 10l4 4M8 8l2 2"/>',
 scout:'<path d="M12 2 5 18l7-4 7 4-7-16ZM12 14v8M8 20h8M3 8l2-2m14 0 2 2M2 12h3m14 0h3M9 10h6"/>',
 mining:'<path d="M4 21h16M7 21v-8l4-3h6l2 3-2 5h-5m-5-5h5v8m0-11V6l5-3m-2-1 4 2-2 4-4-2M5 7l-2 3m18 7-3 4M3 18l3 3"/>',
 salvage:'<path d="M12 2v4m-4 0h8m-8 0-3 5 4 3m7-8 3 5-4 3M9 14l-2 3 3 3m5-6 2 3-3 3M10 20l2 2 2-2M5 3l2 2m10-2-2 2M3 13l2 2m14-2-2 2"/>',
 scienceprobe:'<path d="M9 3h6l2 9H7L9 3ZM9 6h6m-8 6-4 7h5m9-7 4 7h-5M10 12v7m4-7v7M8 19h8M10 22h4M12 7v3m-2-2h4"/><circle cx="12" cy="5" r=".6"/>'
};
function iconSVG(id,compact=false){
 const paths=iconPaths[id]||iconPaths.survey;
 return '<svg class="cb-svg'+(compact?' cb-svg-sm':'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">'+paths+'</svg>';
}
function assetIcon(id,compact=false){
 const wrap=el('span','cb-icon'+(compact?' cb-inline-icon':''));
 wrap.innerHTML=iconSVG(id,compact);
 return wrap;
}

const blueprints=[
 {id:'survey',kind:'planet',name:'Survey Outpost',icon:'⌖',desc:'A surface operations outpost for the first permanent scientific team.',cost:{iron:1,minerals:1,energy:1}},
 {id:'solar',kind:'planet',name:'Solar Array',icon:'☼',desc:'A field of adjustable solar panels that powers local operations.',cost:{iron:1,minerals:1,carbon:1}},
 {id:'extractor',kind:'planet',name:'Mineral Extractor',icon:'⚒',desc:'Industrial drilling equipment and a nearby mineral stockpile.',cost:{iron:2,minerals:2,metals:1,energy:1}},
 {id:'science',kind:'planet',name:'Science Base',icon:'⚗',desc:'Analyses atmospheric samples and the discoveries returned by probes.',cost:{iron:2,minerals:2,water:1,carbon:1,energy:1}},
 {id:'launch',kind:'planet',name:'Rocket Launch Complex',icon:'↟',desc:'A permanent pad, fuel tanks, control tower and launch gantry.',cost:{iron:3,minerals:3,carbon:1,sulfur:1,metals:2,energy:2}},
 {id:'base',kind:'planet',name:'International Space Base',icon:'▣',desc:'A multi-module planetary headquarters with industrial districts and connecting roads.',cost:{iron:5,minerals:5,water:2,carbon:2,phosphorus:1,sulfur:1,metals:3,energy:4}},
 {id:'mapping',kind:'satellites',name:'Geological Satellite',icon:'◎',desc:'Maps the homeworld from orbit. Requires an operational launch complex.',cost:{iron:1,minerals:2,metals:1,energy:1},needsLaunch:true},
 {id:'relay',kind:'satellites',name:'Communications Relay',icon:'◉',desc:'Extends control signals to distant autonomous spacecraft.',cost:{iron:1,carbon:1,metals:1,energy:1},needsLaunch:true},
 {id:'scout',kind:'probes',name:'Scout Probe',icon:'⌁',desc:'Autonomous reconnaissance, returning small planetary samples.',cost:{iron:1,minerals:1,carbon:1,energy:1}},
 {id:'mining',kind:'probes',name:'Mining Probe',icon:'◇',desc:'Extracts larger loads from scanned mineral-bearing worlds.',cost:{iron:2,minerals:2,metals:1,energy:1}},
 {id:'salvage',kind:'probes',name:'Salvage Probe',icon:'⛭',desc:'Collects recoverable material from surveyed anomalies.',cost:{iron:1,minerals:2,carbon:1,energy:1}},
 {id:'scienceprobe',kind:'probes',name:'Science Probe',icon:'✧',desc:'Collects geological and biological samples for further study.',cost:{iron:1,water:1,phosphorus:1,metals:1,energy:1}}
];
const parse=(key,fallback)=>{try{const x=S()?.getItem(key);return x?JSON.parse(x):fallback}catch(e){return fallback}};
const blank=()=>({version:1,buildings:[],missions:[],reserves:{}});
function read(){const data=parse(KEY,null);if(!data||typeof data!=='object')return blank();return {...blank(),...data,buildings:Array.isArray(data.buildings)?data.buildings:[],missions:Array.isArray(data.missions)?data.missions:[],reserves:data.reserves&&typeof data.reserves==='object'?data.reserves:{}};}
const save=state=>S().setItem(KEY,JSON.stringify(state));
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
let root=null,tab='planet',selection='survey',continent=0,world='',chosenResource='',afterClose=null,afterNavigate=null,ticker=null;
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const scanned=()=>Object.entries(parse(EXP,{})?.worlds||{}).filter(([k,r])=>r?.surveyed).map(([key,r])=>({key,...r}));
const deposits=w=>{
 const found=new Map();
 for(const f of (w?.findings||[])){
  const id=I().toId(f?.resource?.id||f?.resource?.item);
  if(!id||id==='culture'||id==='technology')continue;
  found.set(id,(found.get(id)||0)+(Number(f.resource.amount)||0));
 }
 return [...found.keys()];
};
function reserveKey(world,id){return world+'|'+id}
function initialReserve(w,id){
 let h=2166136261;for(const ch of reserveKey(w.key,id)){h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;}
 return 6+(h%15); // finite accessible units; survey results determine available resource TYPES.
}
function remaining(state,w,id){const k=reserveKey(w.key,id);return state.reserves[k]===undefined?initialReserve(w,id):Math.max(0,Number(state.reserves[k])||0)}
const qty=n=>Number(n||0).toFixed(1).replace(/\.0$/,'');
const costText=c=>Object.entries(c).map(([id,n])=>qty(n)+' '+I().labels[id]).join(' · ');
const owned=(state,id)=>state.buildings.filter(b=>b.blueprint===id);
function settle(){
 const state=read();let changed=false;
 for(const m of state.missions){
  if(m.status==='complete'||Date.now()<m.completeAt)continue;
  const receipt='cosmic:probe-delivery:'+m.id;
  const outcome=I().grant({[m.resource]:m.yield},receipt);
  if(!outcome.ok)continue;
  m.status='complete';m.finishedAt=m.completeAt;changed=true;
 }
 if(changed)save(state);
 return state;
}
function build(bp){
 const state=settle();
 if(bp.needsLaunch&&!owned(state,'launch').length)return alert('Construct a Rocket Launch Complex first.');
 const receipt='cosmic:construction:'+uid();
 const spend=I().spend(bp.cost,receipt);
 if(!spend.ok)return alert('Not enough resources. Survey and collect more materials in the Galaxy.');
 state.buildings.push({id:receipt,blueprint:bp.id,kind:bp.kind,continent,createdAt:Date.now()});
 save(state);render();
}
function launch(probeId){
 const state=settle(),probe=owned(state,probeId),busy=new Set(state.missions.filter(m=>m.status!=='complete').map(m=>m.probeId));
 const craft=probe.find(b=>!busy.has(b.id));
 if(!craft)return alert('Build a free probe first, or wait for its current mission.');
 if(!owned(state,'launch').length)return alert('Build a Rocket Launch Complex before deploying a probe.');
 const w=scanned().find(w=>w.key===world);if(!w)return alert('Survey a destination planet from the Galaxy.');
 const available=deposits(w);if(!available.includes(chosenResource))return alert('Select a confirmed resource deposit.');
 const left=remaining(state,w,chosenResource);if(left<=0)return alert('That deposit has been exhausted. Select another world.');
 const take=Math.min(left,probeId==='mining'?3:probeId==='salvage'?2:1);
 const id=uid();
 const result=I().spend({energy:1},'cosmic:probe-launch:'+id);
 if(!result.ok)return alert('Launching a probe requires 1 Energy Source from your shared inventory.');
 const duration=probeId==='mining'?95000:probeId==='salvage'?80000:probeId==='scienceprobe'?75000:60000;
 state.reserves[reserveKey(w.key,chosenResource)]=left-take;
 state.missions.push({id,probeId:craft.id,type:probeId,worldKey:w.key,worldName:w.name,resource:chosenResource,yield:take,status:'outbound',launchedAt:Date.now(),completeAt:Date.now()+duration});
 save(state);render();
}
function ensureUI(){
 if(root)return;
 root=el('section','cosmic-build-shell');root.id='cosmicConstruction';root.hidden=true;
 root.setAttribute('aria-label','COSMIC construction management');
 document.body.append(root);
 window.addEventListener('cosmic-inventory-change',()=>{if(!root.hidden)render()});
 window.addEventListener('storage',e=>{if(!root.hidden&&e.key?.includes('cosmic:vx:slot:'))render()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden){e.stopImmediatePropagation();close(true)}},true);
 if(!ticker)ticker=setInterval(()=>{if(!root.hidden)render()},2000);
}
function textButton(label,onClick,cls=''){const b=el('button',cls,label);b.type='button';b.onclick=onClick;return b}
function render(){
 if(!root||root.hidden)return;
 const st=settle(),balances=I().read().balances;
 root.replaceChildren();
 const wrap=el('div','cb-shell');
 const header=el('header','cb-header');
 const identity=el('div','cb-identity');
 identity.append(el('span','cb-kicker','COSMIC / GENESIS INITIATIVE'),el('h1','', 'CONSTRUCTION'),el('p','','Develop ASTRA-01 using the same finite resources required for life.'));
 header.append(identity,textButton('✕ Close',()=>close(true),'cb-close'));wrap.append(header);
 const topnav=el('nav','cb-topnav');topnav.setAttribute('aria-label','COSMIC navigation');
 for(const [id,label] of [['home','⌂ My Planet'],['galaxy','✧ Galaxy'],['journal','▣ Journal'],['resources','◈ Inventory'],['construction','▤ Construction'],['profile','◉ Profile']]){
  const btn=textButton(label,()=>{if(id!=='construction'){const cb=afterNavigate;close();cb?.(id);}},'cb-navbtn'+(id==='construction'?' active':''));
  topnav.append(btn);
 }
 wrap.append(topnav);
 const ribbon=el('div','cb-ribbon');
 ribbon.append(el('span','','HOMEWORLD  ASTRA-01'),el('span','','One shared inventory · No second colony renderer'),el('span','',st.buildings.length+' assets constructed'));
 wrap.append(ribbon);
 const body=el('div','cb-body'),main=el('section','cb-main'),aside=el('aside','cb-aside');
 const nav=el('div','cb-categories');
 for(const [id,label] of categories)nav.append(textButton(label,()=>{tab=id;selection=blueprints.find(x=>x.kind===id)?.id;render()},'cb-category'+(tab===id?' active':'')));
 main.append(nav);
 const inventoryTitle=el('div','cb-section-title','SHARED INVENTORY — ALSO USED BY THE LABORATORY');main.append(inventoryTitle);
 const bank=el('div','cb-bank');
 for(const [id,label,icon] of I().defs){
  const cell=el('div','cb-resource');cell.append(el('span','',icon+' '+label),el('strong','',qty(balances[id])));bank.append(cell);
 }
 main.append(bank);
 main.append(el('div','cb-section-title',tab==='planet'?'PLANET / SURFACE INSTALLATIONS':tab==='satellites'?'SATELLITES / ORBITAL EQUIPMENT':'PROBES / AUTOMATED EXPLORATION'));
 const grid=el('div','cb-cardgrid');
 for(const bp of blueprints.filter(x=>x.kind===tab)){
  const b=el('button','cb-blueprint'+(selection===bp.id?' selected':''));
  b.type='button';b.onclick=()=>{selection=bp.id;render()};
  b.append(assetIcon(bp.id),el('strong','',bp.name),el('small','',owned(st,bp.id).length+' built'));
  grid.append(b);
 }main.append(grid);
 const chosen=blueprints.find(x=>x.id===selection)||blueprints.find(x=>x.kind===tab);
 const details=el('article','cb-details');const detailHead=el('div','cb-detail-heading');detailHead.append(assetIcon(chosen.id,true),el('h2','',chosen.name));details.append(detailHead,el('p','',chosen.desc));
 if(chosen.kind==='planet'){
  const label=el('label','cb-label','BUILD ON CONTINENT');
  const select=el('select','');
  continents.forEach((name,index)=>{const o=el('option','',name);o.value=String(index);o.selected=index===continent;select.append(o)});
  select.onchange=()=>{continent=Number(select.value)};
  label.append(select);details.append(label);
 }
 const bill=el('div','cb-bill');
 for(const [id,n] of Object.entries(chosen.cost)){
  const have=balances[id]||0;
  bill.append(el('div',have>=n?'':'cb-short',I().icons[id]+' '+I().labels[id]+'     '+qty(have)+' / '+qty(n)));
 }
 details.append(el('h3','','REQUIRED MATERIALS'),bill);
 if(chosen.needsLaunch&&!owned(st,'launch').length)details.append(el('p','cb-note','Requires a Rocket Launch Complex.'));
 const can=I().canAfford(chosen.cost)&&(!chosen.needsLaunch||owned(st,'launch').length>0);
 const action=textButton('CONSTRUCT  ·  '+chosen.name.toUpperCase(),()=>build(chosen),'cb-action');
 action.disabled=!can;details.append(action);
 details.append(el('small','cb-footnote','Materials are deducted immediately. Laboratory ingredients are not protected from construction spending.'));
 aside.append(details);
 if(tab==='probes'){
  const ops=el('article','cb-details');
  ops.append(el('h2','','AUTONOMOUS PROBE MISSIONS'),el('p','','Scan other planets, then launch a built probe from ASTRA-01 to recover finite deposits.'));
  const worlds=scanned(),w=worlds.find(w=>w.key===world)||worlds[0];
  if(w){world=w.key;const worldSelect=el('select','');
   for(const item of worlds){const o=el('option','',item.name+' / '+item.system);o.value=item.key;o.selected=item.key===world;worldSelect.append(o)}
   worldSelect.onchange=()=>{world=worldSelect.value;chosenResource='';render()};
   const wLabel=el('label','cb-label','DESTINATION WORLD');wLabel.append(worldSelect);ops.append(wLabel);
   const options=deposits(w),res=options.includes(chosenResource)?chosenResource:options[0];chosenResource=res||'';
   if(options.length){const rs=el('select','');
    for(const id of options){const o=el('option','',I().labels[id]+' · '+qty(remaining(st,w,id))+' remaining');o.value=id;o.selected=id===chosenResource;rs.append(o)}
    rs.onchange=()=>{chosenResource=rs.value;render()};
    const label=el('label','cb-label','SURVEYED RESOURCE');label.append(rs);ops.append(label);
    const launchBtn=textButton('↗ LAUNCH '+chosen.name.toUpperCase(),()=>launch(chosen.id),'cb-action');
    launchBtn.disabled=!owned(st,'launch').length||!owned(st,chosen.id).length||!chosenResource||!remaining(st,w,chosenResource)||!I().canAfford({energy:1});
    ops.append(launchBtn);
    ops.append(el('small','cb-footnote','Each mission also consumes 1 Energy Source as propellant.'));
   }else ops.append(el('p','cb-note','No compatible deposits detected. Survey another destination.'));}
  else ops.append(el('p','cb-note','No surveyed worlds yet. Open Galaxy, enter a planet and run a Planet Scan.'));
  aside.append(ops);
 }
 if(st.missions.length){
  const missions=el('article','cb-details');missions.append(el('h2','','MISSION CONTROL'));
  for(const m of [...st.missions].reverse().slice(0,6)){
   const progress=Math.min(1,(Date.now()-m.launchedAt)/(m.completeAt-m.launchedAt));
   const card=el('div','cb-mission');
   card.append(el('strong','',m.worldName+' · '+I().labels[m.resource]),el('small','',m.status==='complete'?'✓ Cargo delivered: +'+qty(m.yield):'In transit · '+Math.max(0,Math.ceil((m.completeAt-Date.now())/1000))+' sec'));
   const track=el('div','cb-track'),fill=el('div','cb-fill');fill.style.width=(m.status==='complete'?100:progress*100)+'%';track.append(fill);card.append(track);missions.append(card);
  }aside.append(missions);
 }
 body.append(main,aside);wrap.append(body);root.append(wrap);
}
function open(options={}){
 ensureUI();afterClose=options.onClose||null;afterNavigate=options.onNavigate||null;root.hidden=false;render();
}
function close(notify=false){if(!root)return;root.hidden=true;if(notify){const cb=afterClose;afterClose=null;afterNavigate=null;cb?.()}}
window.COSMIC_VX_CONSTRUCTION={open,close,isOpen:()=>!!root&&!root.hidden,read,settle,blueprints};
})();
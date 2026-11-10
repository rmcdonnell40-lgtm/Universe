/* ClaimYourPlanet V15 / deterministic single-player planetary discovery scanner */
(function(){
'use strict';
const KEY='claimyourplanet:v15:journal';
const samples=[
['Ancient impact basin','rocky terrestrial desert ice lava toxic forest','Geology','◉','A huge circular basin suggests an ancient impact.'],
['Metal-rich strata','rocky terrestrial desert lava toxic forest','Minerals','◆','Magnetic readings suggest a concentrated metal-bearing layer.'],
['Ancient riverbed','rocky desert terrestrial','Hydrology','≈','Eroded channels suggest liquid may once have flowed here.'],
['Dormant caldera','rocky desert terrestrial lava forest','Geology','△','A broad depression may indicate historical volcanism.'],
['Sulfur vent field','lava toxic rocky','Chemistry','♨','Thermal and chemical anomalies suggest sulfur-bearing vents.'],
['Obsidian plains','lava rocky','Geology','◇','Vast glassy deposits may have cooled rapidly from molten rock.'],
['Magma reservoir','lava toxic','Geology','♨','The model detects extensive subsurface thermal activity.'],
['Subsurface brine','ice rocky terrestrial desert','Hydrology','≈','Data suggest a potentially protected salty-liquid reservoir.'],
['Cryovolcanic fissure','ice','Geology','❄','Frozen crust fractures may allow volatile material to escape.'],
['Deep ice archive','ice desert terrestrial forest','Hydrology','❄','Layered ice may preserve a record of past climate.'],
['Hydrothermal vent','ocean terrestrial','Hydrology','≈','Seafloor heating suggests circulation between water and rock.'],
['Abyssal trench','ocean','Geology','▽','A particularly deep ocean-floor basin appears in the model.'],
['Seabed mineral field','ocean terrestrial','Minerals','◆','Mineral-rich patches appear on the hypothetical seabed.'],
['Organic chemical traces','ocean forest terrestrial toxic','Chemistry','✦','Complex carbon-bearing molecules may be present; this does not imply life.'],
['Isotope anomaly','rocky desert ice toxic ocean forest terrestrial','Chemistry','◈','Unusual local isotopic signatures are suggested by the model.'],
['Magnetic anomaly','rocky terrestrial ice gasGiant toxic','Magnetism','⌁','A distinctive regional magnetic signal has been detected.'],
['Jet-stream boundary','gasGiant','Atmosphere','〰','Powerful cloud currents meet across a region of strong wind shear.'],
['Giant storm vortex','gasGiant','Atmosphere','🌀','An immense rotating storm appears unusually persistent.'],
['Electrical storm belt','gasGiant toxic','Atmosphere','ϟ','Deep convection may produce intense lightning activity.'],
['Polar auroral oval','gasGiant','Magnetism','✧','Charged particles may cause luminous upper-atmosphere auroras.'],
['Exotic cloud chemistry','gasGiant toxic','Chemistry','☁','Condensed atmospheric compounds may form unusual cloud layers.'],
['High-altitude haze','gasGiant toxic ice','Atmosphere','☁','A widespread aerosol layer may scatter incident light.']
];
function hash(text){let n=2166136261>>>0;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return n>>>0;}
function randomizer(n){return function(){n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function find(p,galaxy){
 let random=randomizer(hash(String(galaxy)+':'+p.seed+':'+p.id));
 let pool=samples.filter(s=>s[1].split(' ').includes(p.type));
 let count=Math.min(pool.length,2+Math.floor(random()*3)),results=[];
 for(let i=0;i<count;i++){
  let spec=pool.splice(Math.floor(random()*pool.length),1)[0],r=random();
  results.push({name:spec[0],type:spec[2],icon:spec[3],description:spec[4],rarity:r<.025?'Extraordinary':r<.14?'Rare':r<.42?'Uncommon':'Common'});
 }
 return results;
}
let saved={};try{saved=JSON.parse(window.COSMIC_VX_STORAGE.getItem(KEY)||'{}')||{}}catch(e){}
function persist(){try{window.COSMIC_VX_STORAGE.setItem(KEY,JSON.stringify(saved))}catch(e){}}
function element(tag,cls,text){let el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function init(api){
 let scanning=false;
 const scanButton=element('button','cy-scan');scanButton.hidden=true;
 document.getElementById('panelTitle').insertAdjacentElement('afterend',scanButton);
 const terrainButton=element('button','cy-t-scan','⌁ Scan Planet');terrainButton.hidden=true;
 document.querySelector('.terrain-toolbar').prepend(terrainButton);
 const journalButton=element('button','cy-j-btn','✦ Explorer Journal');
 document.querySelector('.top-actions').prepend(journalButton);
 const overlay=element('div','cy-radar');overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 overlay.innerHTML='<div class="cy-scanfx"><div class="cy-scope"><div class="grid"></div><div class="sweep"></div><div class="ring"></div><div class="ring r2"></div><div class="ring r3"></div><div class="core"></div></div></div><div class="cy-scan-header"><small>RADIO-WAVE PLANETARY SURVEY</small><h2 id="cyPlanetName">Scanning planet</h2><p>Sending deep-scan pulses · locating anomalies</p></div><div class="cy-scan-progress"><span id="cyProgress">0% · Signal acquisition</span><div class="cy-bar"><div id="cyFill"></div></div></div><div class="cy-result" id="cyScanResult" hidden></div>';
 document.body.append(overlay);
 const journal=element('section','cy-journal');journal.hidden=true;journal.setAttribute('role','dialog');journal.setAttribute('aria-modal','true');
 journal.innerHTML='<div class="cy-journal-wrap"><div class="cy-j-header"><div><div class="eyebrow">CLAIM YOUR PLANET · EXPEDITION RECORD</div><h2>Explorer Journal</h2><p>Findings are determined by each planet and galaxy seed. Progress is saved on this device.</p></div><button type="button" id="cyClose">✕ Close</button></div><div class="cy-counts" id="cyCounts"></div><div class="cy-entries" id="cyEntries"></div></div>';
 document.body.append(journal);
 const $=id=>document.getElementById(id);
 function current(){
  let p=api.getPlanet();if(!p)return null;
  let galaxy=api.getSeed(),key=String(galaxy)+':'+p.seed+':'+p.id,items=find(p,galaxy);
  let record=saved[key],count=record&&Number.isInteger(record.count)?Math.min(items.length,Math.max(0,record.count)):0;
  return {p,galaxy,key,items,count};
 }
 function sync(){
  let st=current(),shown=!!st;
  scanButton.hidden=!shown;terrainButton.hidden=!shown||!api.isTerrainOpen();
  if(st){scanButton.textContent=st.count>=st.items.length?'✓ Survey complete · '+st.count+'/'+st.items.length:'⌁ SCAN PLANET · '+st.count+'/'+st.items.length;
   terrainButton.textContent=st.count>=st.items.length?'✓ Planet surveyed':'⌁ Scan Planet';
  }
  let total=Object.values(saved).filter(v=>v&&v.count>0).length;
  journalButton.textContent='✦ Explorer Journal'+(total?' ('+total+')':'');
 }
 function closeScan(){if(scanning)return;overlay.hidden=true;overlay.classList.remove('done');}
 function finish(){
  let st=current(),discovery=st&&st.items[st.count];
  if(!st){overlay.hidden=true;return;}
  if(discovery){
   let record=saved[st.key]||{};
   record.count=st.count+1;record.name=st.p.name;record.system=api.getSystem()||'Unknown system';
   record.discoveries=st.items.slice(0,record.count);saved[st.key]=record;persist();
  }
  overlay.classList.add('done');
  const card=$('cyScanResult');card.hidden=false;card.replaceChildren();
  card.append(element('span','icon',discovery?discovery.icon:'✓'));
  let rare=discovery&&['Rare','Extraordinary'].includes(discovery.rarity);
  card.append(element('span','grade'+(rare?' rare':''),discovery?discovery.rarity:'ALL DISCOVERED'));
  card.append(element('h2','',discovery?discovery.name:'Planet fully surveyed'));
  card.append(element('p','',discovery?discovery.description:'There are no remaining undiscovered anomalies on this planet.'));
  card.append(element('p','',st.p.name+' · '+(discovery?discovery.type+' · '+(st.count+1)+' / '+st.items.length:st.items.length+' / '+st.items.length)+' findings'));
  const row=element('div','cy-actionrow');
  const again=element('button','','⌁ Scan Again');again.disabled=!discovery||st.count+1>=st.items.length;again.onclick=()=>{closeScan();scan();};
  const open=element('button','','Explorer Journal');open.onclick=()=>{closeScan();showJournal();};
  const exit=element('button','','Return to Planet');exit.onclick=closeScan;
  row.append(again,open,exit);card.append(row);sync();
 }
 function scan(){
  let st=current();if(scanning||!st)return;
  overlay.hidden=false;overlay.classList.remove('done');$('cyScanResult').hidden=true;
  if(st.count>=st.items.length){finish();return;}
  scanning=true;$('cyPlanetName').textContent='Scanning '+st.p.name;
  let begin=performance.now(),duration=2450;
  function step(now){
   if(!scanning)return;
   let p=Math.min(1,Math.max(0,(now-begin)/duration));
   $('cyFill').style.width=(p*100).toFixed(1)+'%';
   $('cyProgress').textContent=Math.round(p*100)+'% · '+(p<.26?'Transmitting pulses':p<.62?'Penetrating layers':p<.88?'Locating anomaly':'Classifying discovery');
   if(p>=1){scanning=false;finish();}else requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
 }
 function showJournal(){
  let records=Object.values(saved).filter(v=>v&&v.count>0),total=records.reduce((n,r)=>n+(r.discoveries||[]).length,0);
  let rare=records.reduce((n,r)=>n+(r.discoveries||[]).filter(d=>d.rarity==='Rare'||d.rarity==='Extraordinary').length,0);
  $('cyCounts').replaceChildren();
  [[records.length,'Planets surveyed'],[total,'Findings recorded'],[rare,'Rare discoveries']].forEach(pair=>{
   let card=element('div','cy-count');card.append(element('strong','',String(pair[0])),element('span','',pair[1]));$('cyCounts').append(card);
  });
  const list=$('cyEntries');list.replaceChildren();
  if(!total)list.append(element('div','cy-empty','Your journal is empty. Select a planet and press Scan Planet.'));
  else{
   let all=[];records.forEach(r=>(r.discoveries||[]).forEach(d=>all.push({r,d})));
   all.reverse().forEach(x=>{let box=element('div','cy-entry');box.append(element('b','',x.d.icon+' '+x.d.name),element('small','',x.r.name+' · '+x.r.system),element('small','',x.d.type+' · '+x.d.rarity),element('p','',x.d.description));list.append(box);});
  }
  journal.hidden=false;
 }
 scanButton.onclick=scan;terrainButton.onclick=scan;journalButton.onclick=showJournal;
 $('cyClose').onclick=()=>journal.hidden=true;
 const observer=new MutationObserver(sync);observer.observe(document.getElementById('terrainOverlay'),{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!journal.hidden){journal.hidden=true;e.stopPropagation();}else if(!overlay.hidden&&!scanning){closeScan();e.stopPropagation();}});
 return {sync,scan,showJournal};
}
window.CYPlanetScannerV15={init,find};
})();
/* COSMIC V21: Captain Ward's 4-stage opening, shown AFTER the profile gate is exited. */
(()=>{
'use strict';
const key=id=>'cosmic:v21:intro:'+id;
const story=[
{topic:'ONE YEAR LATER',line:"Come in, Pilot. Have a seat.\n\nDo you realise it's been exactly one year since we first touched down on ASTRA-01?\n\nThree hundred and sixty-five days. We've built shelters, secured our energy supply, established communications and learned how to survive on a world that nobody from Earth had ever seen.\n\nA remarkable achievement. But surviving here was only ever the beginning.",options:[
["We've accomplished a lot in a year, Captain.","We have. And every person in this settlement deserves recognition for that. But there is something much more important ahead of us."],
["I thought establishing the colony was our mission.","It was our first assignment. Not our primary objective. Everything we've done until now was preparation."],
["A year already? It hardly feels like home.","I know. There are mornings when I still expect to see Earth outside that window. But this is home now, whether we're ready for it or not."]]},
{topic:'THE REAL MISSION',line:"I want you to look outside that window.\n\nAn entire planet. Oceans, continents, mountains, weather systems. Billions of years of geological history. And yet, despite everything we've discovered, we haven't confirmed a single naturally occurring living organism.\n\nThe ISA selected this world because it may possess the conditions necessary to support life. Our primary assignment is to find out whether we can initiate that process. For the first time in human history, we have the opportunity to study life's beginnings by attempting to create the conditions ourselves.",options:[
["You're talking about creating life?","Precisely. Not constructing another habitat or growing a few crops. We're talking about initiating an entirely new biological history."],
["Why didn't we begin this a year ago?","Because a single contamination event could compromise decades of research. We needed a stable colony, reliable laboratories and a complete year of environmental observations before attempting anything."],
["What makes ISA believe this is possible?","Water, energy, carbon compounds and the right chemical conditions. We have promising evidence, but possibility isn't proof. That's why we need you."]]},
{topic:'YOUR ASSIGNMENT',line:"We aren't going to scatter microorganisms into an ocean and hope for the best.\n\nLife requires chemistry, energy, suitable conditions and time. And even then, we don't fully understand how the first living systems emerged on Earth.\n\nOur science division has spent the last year identifying promising locations. We now need physical samples and reliable environmental measurements. You'll be leading the preliminary survey.\n\nThere may be conditions we've overlooked. There may even be discoveries that force us to abandon the entire programme. But that's why we're here. To find answers.",options:[
["What exactly do you need me to do?","Lead the preliminary survey. Identify reliable water sources, collect mineral and chemical samples, investigate organic precursors and return everything to our laboratory for analysis."],
["What if something is already alive down there?","Then everything changes. Every suspected biological signature must be investigated before we introduce a single organism. We're not here to destroy an ecosystem we haven't discovered yet."],
["Are there risks ISA hasn't told us about?","There are uncertainties. Some environmental readings remain unexplained. I've requested a second assessment from Science Division. Until then, we follow our protocols. No exceptions."]]},
{topic:'THE DECISION',line:"When I joined the ISA, I believed humanity's greatest achievement would be travelling between the stars. I was wrong.\n\nGetting here was the easy part. What we do with this world is the real test.\n\nIf we succeed, generations from now, people may look back at this moment as the beginning of an entirely new chapter in the history of life. Perhaps they'll never know our names. That's all right with me.\n\nSo, Pilot. Are you ready to begin?",options:[
["I'm ready, Captain. Let's begin.","Good. I knew I could count on you. I'm authorising your first research assignment. Your instructions are being transferred to your mission terminal now."],
["I'll do it, but I want the science team involved.","Absolutely. You won't be working alone. Our science team will analyse every sample you bring back. This is a colony-wide undertaking."],
["I need a little more time before accepting.","Understood. This is bigger than any of us. Review the briefing, speak with the crew and return when you're ready. I'll be here."]]}
];
const $=x=>document.getElementById(x);let root,slot,idx=0,pick=-1,picks=[-1,-1,-1,-1],showing=false;
function state(id){try{return localStorage.getItem(key(id))}catch(e){return null}}
function save(id,v){try{localStorage.setItem(key(id),v)}catch(e){}}
function registerNewSlot(id){if(id&&id!=='developer')save(id,'pending')}
function mount(){
 if(root)return;
 root=document.createElement('div');root.id='v21-intro';root.hidden=true;
 root.innerHTML='<section class="shell" role="dialog" aria-modal="true" aria-label="SETTLED: Captain Ward"><header class="top"><div class="brand">COSMIC<small>THE SPACE GAME</small></div><div class="title"><small>ISA // GENESIS EXPEDITION</small>SETTLED</div><div class="step" id="v21-count">01 / 04</div></header><div class="scroll" id="v21-scroll"><div class="art"><img src="assets/captain-ward-v21.webp" alt="Captain Helena Ward in ISA uniform looking at the player"><b>CAPTAIN HELENA WARD<small>INTERSTELLAR SETTLEMENT AUTHORITY · EXPEDITION COMMANDER</small></b></div><div class="content"><div class="speaker">CAPTAIN WARD // DIRECT COMMUNICATION</div><p class="line" id="v21-line"></p><div class="select-caption">CHOOSE YOUR RESPONSE</div><div class="options" id="v21-options"></div><div class="reply" id="v21-reply" hidden><div class="speaker">CAPTAIN WARD</div><p id="v21-answer"></p></div></div></div><footer class="foot"><span>ASTRA-01 · YEAR ONE · SECURE ISA COMMS</span><div class="buttons"><button id="v21-prev" class="btn">◀ PREVIOUS</button><button id="v21-continue" class="btn next" disabled>SELECT RESPONSE</button></div></footer></section>';
 document.body.append(root);
 $('v21-prev').onclick=()=>{if(idx>0){idx--;pick=picks[idx];render()}};
 $('v21-continue').onclick=()=>{if(pick<0)return;picks[idx]=pick;if(idx<3){idx++;pick=picks[idx];render()}else end()};
}
function render(){
 const s=story[idx];
 $('v21-count').textContent=String(idx+1).padStart(2,'0')+' / 04 · '+s.topic;
 const bars=document.createElement('div');bars.className='bars';for(let j=0;j<4;j++){let e=document.createElement('i');if(j<=idx)e.className='on';bars.append(e)}$('v21-count').append(bars);
 $('v21-line').textContent=s.line;
 const options=$('v21-options');options.replaceChildren();
 s.options.forEach((o,i)=>{
  const b=document.createElement('button');b.type='button';b.className='choice'+(pick===i?' on':'');b.setAttribute('aria-pressed',String(pick===i));
  const num=document.createElement('em');num.textContent=String(i+1).padStart(2,'0');
  b.append(num,document.createTextNode(o[0]));b.onclick=()=>{pick=i;picks[idx]=i;render()};options.append(b);
 });
 $('v21-reply').hidden=pick<0;
 if(pick>=0)$('v21-answer').textContent=s.options[pick][1];
 $('v21-prev').disabled=idx===0;
 $('v21-continue').disabled=pick<0;
 $('v21-continue').textContent=pick<0?'SELECT RESPONSE':idx===3?'ENTER THE GAME ▶':'CONTINUE ▶';
}
function end(){
 save(slot,'completed');root.hidden=true;showing=false;
 try{$('galaxyV7Frame')?.contentWindow?.postMessage({type:'COSMIC_V21_SETTLED_COMPLETE',accepted:picks[3]!==2},location.origin)}catch(e){}
 slot=null;
}
function show(id){
 if(showing||!id||state(id)!=='pending')return;
 mount();slot=id;idx=0;pick=-1;picks=[-1,-1,-1,-1];showing=true;root.hidden=false;render();
}
function showOnEntry(id){
 if(!id||state(id)!=='pending')return;
 const shell=$('galaxyV7Shell'),gate=$('vxProfileGate'),frame=$('galaxyV7Frame');
 const ready=()=>shell?.classList.contains('open')&&gate?.style.display==='none';
 if(!ready())return;
 const go=()=>setTimeout(()=>{if(ready())show(id)},350);
 try{if(frame?.contentDocument?.readyState==='complete')go();else if(frame){frame.addEventListener('load',go,{once:true});setTimeout(go,1500)}else go()}catch(e){go()}
}
window.COSMIC_V21_INTRO={registerNewSlot,showOnEntry,showForTest:(id='test')=>{registerNewSlot(id);show(id)},getState:state};
})();
/* COSMIC VX — One finite resource inventory for laboratory, construction and missions. */
(()=>{
'use strict';
const KEY='cosmic:vx:inventory:v1', LAB='cosmic:myworld:laboratory:v21', EXP='claimyourplanet:resource-expedition:v18';
const defs=[
 ['water','Water','💧'],['carbon','Carbon','◆'],['phosphorus','Phosphorus','✦'],
 ['sulfur','Sulfur','⬡'],['metals','Catalytic Metals','◈'],['energy','Energy Source','⚡'],
 ['culture','Primordial Culture','🧬'],['iron','Iron','▰'],['minerals','Minerals','◇'],
 ['technology','Ancient Technology','✧']
];
const ids=defs.map(x=>x[0]), labels=Object.fromEntries(defs.map(x=>[x[0],x[1]])), icons=Object.fromEntries(defs.map(x=>[x[0],x[2]]));
const labIds=ids.slice(0,7);
const S=()=>window.COSMIC_VX_STORAGE;
const parse=(key,fallback)=>{try{const raw=S()?.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
const nonnegative=v=>Math.max(0,Math.round((Number(v)||0)*100)/100);
const normalize=o=>Object.fromEntries(ids.map(k=>[k,nonnegative(o?.[k])]));
function toId(value){
 if(!value)return null;
 const str=String(value).toLowerCase().trim();
 const aliases={'catalytic metals':'metals','energy source':'energy','primordial culture':'culture','ancient technology':'technology','mineral':'minerals','iron ore':'iron'};
 const id=aliases[str]||str;
 return ids.includes(id)?id:null;
}
function mirrorLab(balances){
 const lab=parse(LAB,null);
 if(!lab||typeof lab!=='object')return;
 const stock={...lab.stock};
 for(const id of labIds)stock[id]=balances[id];
 S().setItem(LAB,JSON.stringify({...lab,stock}));
}
function read(){
 let raw=parse(KEY,null);
 if(raw?.version===1&&raw.balances)return {version:1,balances:normalize(raw.balances),receipts:Array.isArray(raw.receipts)?raw.receipts:[]};
 const balances=normalize();
 const lab=parse(LAB,null);
 for(const id of labIds)balances[id]=nonnegative(lab?.stock?.[id]);
 // Legacy scanned deposits already credited the life ingredients to the Laboratory.
 // Recover ONLY the other materials to avoid double-crediting existing VX saves.
 const discoveries=parse(EXP,null);
 for(const world of Object.values(discoveries?.worlds||{})){
  if(!world?.surveyed)continue;
  for(const [i,f] of (world.findings||[]).entries()){
   if(!world.collected?.[i]||!f?.resource)continue;
   const id=toId(f.resource.id||f.resource.item);
   // V20/VX previously credited explicit astrobiology samples into the Lab,
   // but ordinary geological finds (including Water/Energy) were not.
   if(id&&(!labIds.includes(id)||!f.cosmicIngredientId))balances[id]+=nonnegative(f.resource.amount);
  }
 }
 raw={version:1,balances:normalize(balances),receipts:[]};
 S()?.setItem(KEY,JSON.stringify(raw));
 return raw;
}
function transfer(changes,receipt){
 const current=read();
 if(receipt&&current.receipts.includes(receipt))return {ok:true,duplicate:true,balances:current.balances};
 const delta={};
 for(const [name,quantity] of Object.entries(changes||{})){
  const id=toId(name),n=Number(quantity);
  if(!id||!Number.isFinite(n))return {ok:false,error:'Invalid resource transaction'};
  delta[id]=(delta[id]||0)+n;
 }
 const missing={};
 for(const [id,n] of Object.entries(delta)){
  if(current.balances[id]+n<-.000001)missing[id]=Math.abs(n)-current.balances[id];
 }
 if(Object.keys(missing).length)return {ok:false,error:'Insufficient resources',missing,balances:current.balances};
 for(const [id,n] of Object.entries(delta))current.balances[id]=nonnegative(current.balances[id]+n);
 if(receipt)current.receipts=[...current.receipts,receipt].slice(-1200);
 try{
  S().setItem(KEY,JSON.stringify(current));
  mirrorLab(current.balances);
  window.dispatchEvent(new CustomEvent('cosmic-inventory-change',{detail:{balances:current.balances}}));
  return {ok:true,balances:current.balances};
 }catch(e){return {ok:false,error:'Unable to save inventory'};}
}
const spend=(cost,receipt)=>transfer(Object.fromEntries(Object.entries(cost).map(([id,n])=>[id,-Math.abs(Number(n)||0)])),receipt);
const grant=(reward,receipt)=>transfer(Object.fromEntries(Object.entries(reward).map(([id,n])=>[id,Math.abs(Number(n)||0)])),receipt);
const canAfford=cost=>Object.entries(cost||{}).every(([id,n])=>read().balances[toId(id)]>=Number(n));
window.COSMIC_VX_INVENTORY={KEY,defs,ids,labels,icons,toId,read,spend,grant,canAfford,labIds};
})();
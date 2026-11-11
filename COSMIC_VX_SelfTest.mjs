/* Run at repository root: node COSMIC_VX_SelfTest.mjs */
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';
const required=[
 'Universe_Masterclass_VX.html','Galaxy_VX.html','COSMIC_VX_SaveAdapter.js',
 'COSMIC_VX_Menu.js','COSMIC_VX_Menu.css','COSMIC_VX_Inventory.js','COSMIC_VX_Construction.js','COSMIC_VX_Construction.css','COSMIC_VX_Story.js','COSMIC_VX_Story.css',
 'ClaimYourPlanet_Resources_VX.js','ClaimYourPlanet_Discoveries_VX.js',
 'COSMIC_My_Planet_VX.html','COSMIC_My_Planet_Laboratory_VX.html',
 'COSMIC_Explorer_Profile_VX.html','COSMIC_Life_Species001_VX.html'
];
let count=0;
for(const file of required){
 assert(existsSync(file),'VX file missing: '+file);
 const source=readFileSync(file,'utf8');
 const scripts=file.endsWith('.js')?[source]:Array.from(source.matchAll(/<script(?![^>]*\bsrc)[^>]*>([\s\S]*?)<\/script>/g),m=>m[1]);
 for(const script of scripts){
  const js=script.replace(/^import .*?;[ \t]*$/gm,'');
  try{new Function(js)}catch(e){throw new Error(file+' JavaScript syntax: '+e.message)}
  count++;
 }
 if(file.endsWith('.html')){
  for(const m of source.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"[^>]*>/g)){
   const target=m[1].split('?')[0];
   if(/^(?:https?:|data:|\/\/|#)/.test(target))continue;
   assert(existsSync(path.join(path.dirname(file),target)),file+' references absent asset '+target);
  }
 }
}
const menu=readFileSync('COSMIC_VX_Menu.js','utf8');
const story=readFileSync('COSMIC_VX_Story.js','utf8');
const lab=readFileSync('COSMIC_My_Planet_Laboratory_VX.html','utf8');
const res=readFileSync('ClaimYourPlanet_Resources_VX.js','utf8');
const root=readFileSync('Universe_Masterclass_VX.html','utf8');
assert(menu.includes('NEW GAME')&&menu.includes('LOAD GAME')&&menu.includes('DEVELOPER'));
assert(menu.includes('exportSave')&&menu.includes('vxImportInput'));
assert(story.includes("THE GENESIS DIRECTIVE")&&story.includes("playPrologue()"));
assert(story.includes("viewedLife")&&story.includes("missionCatalog"));
for(const ingredient of ['water','carbon','phosphorus','sulfur','metals','energy','culture']){
 assert(lab.includes("id:'"+ingredient+"'"),'Laboratory ingredient missing: '+ingredient);
}
assert(res.includes('window.COSMIC_VX_STORAGE'));
assert(root.includes('Galaxy_VX.html?slot='));
assert(!root.includes('COSMIC_Explorer_Profile_V20_Female2.html'));

const galaxy=readFileSync('Galaxy_VX.html','utf8');
const myPlanet=readFileSync('COSMIC_My_Planet_VX.html','utf8');
const construction=readFileSync('COSMIC_VX_Construction.js','utf8');
const shared=readFileSync('COSMIC_VX_Inventory.js','utf8');
assert(galaxy.includes('COSMIC_VX_Inventory.js')&&galaxy.includes('COSMIC_VX_Construction.js'));
assert(myPlanet.includes('constructionRecords(region)')&&myPlanet.includes('addConstructionTerrain(k,construction)'));
assert(lab.includes('sharedInventory.spend({[id]:1})'),'Lab must consume shared resources');
assert(res.includes("cosmic:survey:")&&res.includes("openConstruction()"));
assert(construction.includes('I().spend(bp.cost')&&construction.includes('initialReserve('));
for(const id of ['survey','solar','extractor','science','launch','base','mapping','relay','scout','mining','salvage','scienceprobe'])assert(construction.includes(id+" :'".replace(' ',''))||construction.includes(id+":'"), 'Missing custom SVG icon '+id);
const store=new Map();
store.set('cosmic:myworld:laboratory:v21',JSON.stringify({stock:{water:3,carbon:3,phosphorus:3,sulfur:3,metals:3,energy:3,culture:3},added:[],cultures:0}));
store.set('claimyourplanet:resource-expedition:v18',JSON.stringify({
 worlds:{'seed|sample':{surveyed:true,collected:{0:true,1:true},findings:[
 {resource:{item:'Iron',amount:0.5}},{resource:{item:'Water',amount:1}}
 ]}}
}));
const fakeWindow={
 COSMIC_VX_STORAGE:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,String(value))},
 dispatchEvent:()=>{}
};
vm.runInNewContext(shared,{window:fakeWindow,CustomEvent:class CustomEvent{}});
const inventory=fakeWindow.COSMIC_VX_INVENTORY;
assert.equal(inventory.read().balances.water,4,'Legacy geological Water must migrate, without duplicating old Laboratory ingredients');
assert.equal(inventory.read().balances.iron,0.5,'Existing iron discoveries should migrate');
assert(inventory.spend({water:2,metals:1}).ok,'Construction purchase should spend real resources');
assert.equal(inventory.read().balances.water,2);
assert.equal(JSON.parse(store.get('cosmic:myworld:laboratory:v21')).stock.water,2,'Laboratory mirror must be updated');
assert(!inventory.spend({water:3}).ok,'Insufficient balance must block construction');
assert.equal(inventory.read().balances.water,2,'Failed spend must not change inventory');
assert(inventory.grant({water:1},'sample-delivery').ok);
assert(inventory.grant({water:1},'sample-delivery').duplicate,'Expedition receipts must be idempotent');
assert.equal(inventory.read().balances.water,3,'Repeated delivery cannot duplicate stock');

console.log('COSMIC VX static checks passed: '+required.length+' files, '+count+' scripts, dependencies and key features.');
console.log('NOTE: This is static validation only. Browser interaction, mobile rendering and live deployment are unverified.');

/* Run at repository root: node COSMIC_VX_SelfTest.mjs */
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const required=[
 'Universe_Masterclass_VX.html','Galaxy_VX.html','COSMIC_VX_SaveAdapter.js',
 'COSMIC_VX_Menu.js','COSMIC_VX_Menu.css','COSMIC_VX_Story.js','COSMIC_VX_Story.css',
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
console.log('COSMIC VX static checks passed: '+required.length+' files, '+count+' scripts, dependencies and key features.');
console.log('NOTE: This is static validation only. Browser interaction, mobile rendering and live deployment are unverified.');

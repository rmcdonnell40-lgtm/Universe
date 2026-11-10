/* COSMIC VX — scoped browser save adapter. Does NOT import V20 state. */
(()=>{
'use strict';
const PREFIX='cosmic:vx:slot:';
function getSlot(){
  const param=new URLSearchParams(location.search).get('slot');
  if(param&&/^[a-zA-Z0-9_-]{1,90}$/.test(param))return param;
  try{const saved=sessionStorage.getItem('cosmic:vx:active-slot');if(saved&&/^[a-zA-Z0-9_-]{1,90}$/.test(saved))return saved}catch(e){}
  return 'unassigned';
}
const getKey=key=>PREFIX+getSlot()+':'+String(key);
const guarded=(task,fallback)=>{try{return task()}catch(e){console.warn('COSMIC VX save unavailable:',e);return fallback}};
const api={
 getItem(key){return guarded(()=>window.localStorage.getItem(getKey(key)),null)},
 setItem(key,value){return guarded(()=>{window.localStorage.setItem(getKey(key),String(value));window.dispatchEvent(new CustomEvent('cosmic-vx:saved',{detail:{slot:getSlot(),key:String(key)}}));return true},false)},
 removeItem(key){return guarded(()=>window.localStorage.removeItem(getKey(key)),undefined)},
 clear(){console.warn('COSMIC VX: use explicit slot-management reset; clear() is disabled.')},
 getSlot,
 getKey,
};
window.COSMIC_VX_STORAGE=api;
window.COSMIC_VX_GET_SLOT=getSlot;
})();

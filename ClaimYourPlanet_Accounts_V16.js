/* ClaimYourPlanet V16: browser Supabase auth and user-owned journal syncing.
   Only the public Supabase publishable key is allowed in static pages. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const CURRENT='claimyourplanet:v16:account-journal';
const OLD='claimyourplanet:v15:journal';
const config=window.CY_SUPABASE_CONFIG||{};
const active=typeof config.url==='string'&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url)
 &&typeof config.publishableKey==='string'&&config.publishableKey.trim().length>20;
let client=null,account=null,mode='signin',syncTimer=null,syncInFlight=false,loadedUser=null,initializing=false;
function setMessage(message,isError){
 const node=$('cyAccountMessage');node.hidden=!message;node.textContent=message||'';
 node.classList.toggle('cy-auth-error',Boolean(isError));
}
function setMode(value){
 mode=value;
 $('cySignInTab').setAttribute('aria-selected',String(mode==='signin'));
 $('cyRegisterTab').setAttribute('aria-selected',String(mode==='signup'));
 $('cyAccountSubmit').textContent=mode==='signin'?'Sign in to universe':'Create explorer account';
 $('cyAuthPassword').autocomplete=mode==='signin'?'current-password':'new-password';
 setMessage('',false);
}
function showGate(){ $('cyAccountGate').hidden=false;$('cyAccountBar').hidden=true; }
function showGame(user){
 $('cyAccountGate').hidden=true;$('cyAccountBar').hidden=false;
 $('cyAccountEmail').textContent=(user.email||'Explorer').slice(0,80);
}
function parseSave(raw){try{let obj=JSON.parse(raw||'{}');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};}catch(e){return {};}}
function cloneRecord(record){
 if(!record||typeof record!=='object'||Array.isArray(record))return null;
 const n=Number.isInteger(record.count)?Math.min(Math.max(record.count,0),10):0;
 if(!n)return null;
 return {count:n,name:String(record.name||'Unnamed planet').slice(0,80),
  system:String(record.system||'Unknown star system').slice(0,100),
  discoveries:Array.isArray(record.discoveries)?record.discoveries.slice(0,n).map(x=>({
   name:String(x.name||'Unknown discovery').slice(0,100),
   type:String(x.type||'Survey').slice(0,70),
   icon:String(x.icon||'✦').slice(0,6),
   rarity:String(x.rarity||'Common').slice(0,30),
   description:String(x.description||'').slice(0,450)
  })) : [] };
}
function sanitized(doc){
 const out={};let n=0;
 if(doc&&typeof doc==='object'&&!Array.isArray(doc))for(const [k,rec] of Object.entries(doc)){
  if(n>=1400)break;if(k.length>130)continue;
  const v=cloneRecord(rec);if(v){out[k]=v;n++;}
 }return out;
}
function merge(a,b){const combined=sanitized(a);for(const [k,v] of Object.entries(sanitized(b))){if(!combined[k]||v.count>combined[k].count)combined[k]=v;}return combined;}
function applyLocal(doc){localStorage.setItem(CURRENT,JSON.stringify(sanitized(doc)));}
async function fetchCloud(){
 const {data,error}=await client.from('explorer_saves').select('journal').eq('user_id',account.id).maybeSingle();
 if(error)throw error;
 return data?sanitized(data.journal):null;
}
async function writeCloud(doc){
 const {error}=await client.from('explorer_saves').upsert({user_id:account.id,journal:sanitized(doc),updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)throw error;
}
async function signInReady(user){
 if(!user)return;
 if(initializing)return;
 if(loadedUser===user.id){showGame(user);return;}
 initializing=true;
 $('cyAccountStatus').textContent='Loading cloud save…';
 try{
  account=user;
  const cloud=await fetchCloud();
  if(cloud===null){
   applyLocal({});await writeCloud({});
  }else applyLocal(cloud);
  loadedUser=user.id;
  showGame(user);
  $('cyAccountStatus').textContent='Cloud save ready';
  $('cyImportOld').hidden=!Object.keys(parseSave(localStorage.getItem(OLD))).length;
 }catch(e){
  account=null;loadedUser=null;showGate();
  setMessage('Cloud save could not load: '+e.message+'. Sign-in is paused until this is resolved.',true);
 }finally{initializing=false;}
}
async function attemptSubmit(e){
 e.preventDefault();
 if(!client)return;
 const email=$('cyAuthEmail').value.trim(),password=$('cyAuthPassword').value;
 if(!email||password.length<6){setMessage('Enter a valid email and a password of at least six characters.',true);return;}
 $('cyAccountSubmit').disabled=true;setMessage('Connecting securely…',false);
 try{
  const args={email,password};
  const res=mode==='signup'
   ?await client.auth.signUp({...args,options:{emailRedirectTo:location.origin+location.pathname}})
   :await client.auth.signInWithPassword(args);
  if(res.error)throw res.error;
  if(mode==='signup'&&!res.data.session)setMessage('Check your email to confirm your new account, then sign in.',false);
  else if(res.data.user)await signInReady(res.data.user);
 }catch(err){setMessage(err.message||'Authentication failed.',true);}
 finally{$('cyAccountSubmit').disabled=false;}
}
async function googleSignIn(){
 if(!client)return;
 try{
  setMessage('Opening Google sign-in…',false);
  const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
  if(error)throw error;
 }catch(e){setMessage(e.message,true);}
}
function queueSync(){
 if(!account||!loadedUser||initializing)return;
 if(syncTimer)clearTimeout(syncTimer);
 $('cyAccountStatus').textContent='Saving…';
 syncTimer=setTimeout(syncNow,850);
}
async function syncNow(){
 syncTimer=null;
 if(!account||!loadedUser||syncInFlight)return;
 syncInFlight=true;
 try{
  const local=sanitized(parseSave(localStorage.getItem(CURRENT)));
  const cloud=await fetchCloud();
  const final=merge(cloud||{},local);
  await writeCloud(final);
  // Merge rather than replace; no progress can be lost on another device.
  if(JSON.stringify(local)!==JSON.stringify(final))applyLocal(final);
  $('cyAccountStatus').textContent='Cloud saved';
 }catch(err){$('cyAccountStatus').textContent='Sync failed — retry later';console.warn(err);}
 finally{syncInFlight=false;}
}
async function signOut(){
 if(!client)return;
 if(syncTimer){clearTimeout(syncTimer);syncTimer=null;await syncNow();}
 const {error}=await client.auth.signOut();
 if(error){alert(error.message);return;}
 account=null;loadedUser=null;
 localStorage.removeItem(CURRENT);showGate();
}
async function importOld(){
 if(!account)return;
 const existing=parseSave(localStorage.getItem(OLD));
 if(!Object.keys(existing).length)return;
 if(!confirm('Import your V15 browser discoveries into this signed-in account? Your V15 save will remain untouched.'))return;
 const combined=merge(parseSave(localStorage.getItem(CURRENT)),existing);
 applyLocal(combined);
 await syncNow();
 $('cyImportOld').hidden=true;
 alert('Existing discoveries imported. Reload the galaxy view to see them in the journal.');
}
function init(){
 $('cySignInTab').onclick=()=>setMode('signin');$('cyRegisterTab').onclick=()=>setMode('signup');
 $('cyAccountForm').addEventListener('submit',attemptSubmit);
 $('cyGoogleButton').onclick=googleSignIn;
 $('cyLogout').onclick=signOut;
 $('cyImportOld').onclick=importOld;
 setMode('signin');showGate();
 if(!active){
  $('cyAuthFormContent').hidden=true;$('cyGoogleButton').hidden=true;
  setMessage('V16 account preview. Sign-in is not active until you connect a Supabase project. Your public V15 game remains available.',false);
  $('cySetupNote').hidden=false;return;
 }
 if(!window.supabase||typeof window.supabase.createClient!=='function'){
  $('cyAuthFormContent').hidden=true;$('cyGoogleButton').hidden=true;
  setMessage('The authentication library did not load. Check your connection.',true);return;
 }
 client=window.supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'){loadedUser=null;account=null;localStorage.removeItem(CURRENT);showGate();}
  if(session?.user&&event!=='TOKEN_REFRESHED')setTimeout(()=>signInReady(session.user),0);
 });
 client.auth.getUser().then(({data,error})=>{
  if(error&&!data?.user){setMessage('Sign in to begin your expedition.',false);return;}
  if(data?.user)signInReady(data.user);
 });
}
window.addEventListener('storage',e=>{
 if(e.key===CURRENT&&e.newValue!==e.oldValue)queueSync();
});
document.addEventListener('DOMContentLoaded',init);
})();
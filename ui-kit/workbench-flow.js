/* Local drafts and consistent entry/confirmation feedback. No server upload. */
window.WorkbenchFlow={
 async connect(adapter){
  const host=document.querySelector('.left-panel,.shot-panel');
  const banner=document.createElement('section');banner.className='draft-status';banner.setAttribute('aria-live','polite');
  banner.innerHTML='<span data-draft-message></span><div data-draft-actions hidden><button type="button" class="text-button" data-draft-resume hidden>重新載入草稿</button><button type="button" class="text-button" data-draft-new>重新開始</button></div>';host.append(banner);
  const message=banner.querySelector('[data-draft-message]'),actions=banner.querySelector('[data-draft-actions]'),retry=banner.querySelector('[data-draft-resume]'),restart=banner.querySelector('[data-draft-new]');
  let db,ready=false,restoring=false,timer,saved=null,closed=false;
  const key=adapter.key+(new URLSearchParams(location.search).get('demo')==='1'?'-demo':'');
  const transaction=(mode,fn)=>new Promise((resolve,reject)=>{const tx=db.transaction('drafts',mode),q=fn(tx.objectStore('drafts'));tx.oncomplete=()=>resolve(q?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
  const setStatus=text=>{message.textContent=text};
  const save=async()=>{if(!ready||restoring||closed||!db||!adapter.hasWork())return;try{await transaction('readwrite',s=>s.put({key,updated:Date.now(),value:adapter.snapshot()}));setStatus('草稿已儲存在此瀏覽器');actions.hidden=false}catch{setStatus('草稿無法保存，請保留此頁並完成製作。')}};
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(save,350)};
  const changed=document.createElement('section');changed.className='context-change';changed.hidden=true;changed.innerHTML='<span></span><button type="button" class="text-button">已確認沿用設定</button>';const stage=document.querySelector('#stageActions,#productStageActions');stage?.before(changed);
  changed.querySelector('button').onclick=()=>{changed.hidden=true;adapter.clearChange?.();schedule()};
  const flag=message=>{changed.querySelector('span').textContent=message;changed.hidden=false;adapter.setChange?.(message);schedule()};
  const discard=async()=>{closed=true;clearTimeout(timer);if(db)await transaction('readwrite',s=>s.delete(key))};
  const api={schedule,flag,flush:save,discard};adapter.bind?.(api);
  restart.onclick=async()=>{restart.disabled=true;try{await discard();location.reload()}catch{closed=false;restart.disabled=false;setStatus('無法重新開始，原有草稿仍保留；請稍後再試。')}};
  const restoreSaved=async()=>{
   if(restoring||!saved)return;restoring=true;retry.disabled=true;
   try{await adapter.restore(structuredClone(saved.value));ready=true;retry.hidden=true;setStatus('已自動恢復上次草稿，可直接繼續操作');if(saved.value.changeMessage)flag(saved.value.changeMessage)}
   catch{ready=false;retry.hidden=false;setStatus('上次草稿未能載入，原稿仍保留。可重試或重新開始；目前操作暫不會自動保存。')}
   finally{restoring=false;retry.disabled=false;actions.hidden=false;if(ready)schedule()}
  };
  retry.onclick=restoreSaved;
  document.addEventListener('click',()=>{schedule();queueMicrotask(save)});document.addEventListener('input',schedule);document.addEventListener('change',schedule);
  window.addEventListener('pagehide',save);window.addEventListener('beforeunload',save);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
  try{
   db=await new Promise((resolve,reject)=>{const q=indexedDB.open('studio-workbench-drafts',1);q.onupgradeneeded=()=>q.result.createObjectStore('drafts',{keyPath:'key'});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
   saved=await transaction('readonly',s=>s.get(key));
   if(saved)await restoreSaved();
   else{ready=true;setStatus('設定會自動保存於此瀏覽器');schedule()}
  }catch{setStatus('此瀏覽器無法保存草稿，關閉頁面前請完成製作。')}
  // Draft handling never intercepts page clicks or keyboard actions.
  return api;
 }
};

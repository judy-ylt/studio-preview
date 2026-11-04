/* Short, contextual help for portrait and illustration. No form values or statuses are changed. */
(()=>{
 const portrait=location.pathname.includes('/portrait/');
 const messages=portrait?[
  '只決定人物與服裝範例，不限制上傳照片。',
  '選清晰正面照，可上傳或使用下方照片。',
  '選擇服裝與整體風格，可左右滑動看更多。',
  '選純色或場景背景，可左右滑動看更多。',
  '選擇姿勢，可左右滑動看更多。',
  '選單一比例或全部尺寸。目前為範例構圖，未套用你的照片。',
  '目前為示範圖，未套用你的照片與姿勢；下載含 DEMO。'
 ]:[
  '選清晰人物照，或使用下方範例。',
  '「像本人」保留辨識度；「更有風格」變化較大。',
  '情緒決定表情，可與動作自由搭配。',
  '選擇人物動作，可與情緒自由搭配。',
  '點文字輸入，最多 16 字；拖曳把手移動。',
  '文字與位置已套用；人物仍是範例，未套用照片、情緒及動作。'
 ];
 let current=null,pinned=false;
 const popup=document.createElement('div');popup.id='studioConciseHelp';popup.className='studio-help-popover';popup.hidden=true;popup.setAttribute('role','tooltip');document.body.append(popup);
 function close(){popup.hidden=true;if(current){current.setAttribute('aria-expanded','false');current.removeAttribute('aria-describedby')}current=null;pinned=false}
 function show(button){if(current!==button)close();current=button;popup.textContent=button.dataset.studioHelp;popup.hidden=false;button.setAttribute('aria-expanded','true');button.setAttribute('aria-describedby',popup.id);const r=button.getBoundingClientRect(),b=popup.getBoundingClientRect();popup.style.left=Math.max(12,Math.min(innerWidth-b.width-12,r.left))+'px';const below=r.bottom+8;popup.style.top=Math.max(12,Math.min(innerHeight-b.height-12,below+b.height<=innerHeight-12?below:r.top-b.height-8))+'px'}
 function button(text,label){const b=document.createElement('button');b.type='button';b.className='studio-help';b.textContent='?';b.dataset.studioHelp=text;b.setAttribute('aria-label',label+'說明');b.setAttribute('aria-expanded','false');b.onmouseenter=()=>show(b);b.onmouseleave=()=>{if(!pinned&&document.activeElement!==b)close()};b.onfocus=()=>show(b);b.onblur=close;b.onclick=()=>{if(current===b&&pinned)close();else{show(b);pinned=true}};return b}
 function enhance(){
  close();const h=document.querySelector('#main h1');if(!h)return;
  // These are explanatory paragraphs, never validation, loading or result error messages.
  document.querySelectorAll('#main .reference-direction-note,#main .prototype-note,#main .result-note,#main .subtle-note,.summary .session-note,.summary .cloud-hint').forEach(e=>e.remove());
  if(!portrait)document.querySelectorAll('.text-side>p.hint').forEach(e=>e.remove());
  if(!state.busy&&messages[state.step]&&!h.querySelector('.studio-help'))h.append(button(messages[state.step],h.textContent));
  const panel=document.querySelector('#regenPanel');if(panel){panel.querySelectorAll('p.hint').forEach(e=>e.remove());const p=panel.querySelector('p');if(p){p.textContent='哪裡不滿意？';p.append(button('選一個原因。示範模式不扣點。','重新生成'))}}
 }
 document.addEventListener('click',e=>{if(!e.target.closest('.studio-help'))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('scroll',close,true);window.addEventListener('resize',close);
 const original=render;render=function(...args){const out=original.apply(this,args);enhance();return out};enhance();
})();

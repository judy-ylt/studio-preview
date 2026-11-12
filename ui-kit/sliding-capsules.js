/* Shared category and tool capsules. Selection remains owned by each workbench. */
(()=>{
 const selector='body[data-station="portrait"] #stage .filters, .editor-tabs, #backgroundCategories';
 const previous=new Map();
 function sync(){document.querySelectorAll(selector).forEach((group,index)=>{
  const buttons=[...group.children].filter(el=>el.tagName==='BUTTON');if(!buttons.length)return;
  const key=group.id||group.className.replace(/ capsule-nav/g,'')+index;
  const selected=buttons.find(b=>b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true')||buttons[0];
  const active=buttons.indexOf(selected),old=previous.get(key);group.classList.add('capsule-nav');group.style.setProperty('--capsule-count',buttons.length);
  if(!group.querySelector('.capsule-slider')){const slider=document.createElement('span');slider.className='capsule-slider';slider.setAttribute('aria-hidden','true');group.prepend(slider);group.style.setProperty('--capsule-index',old??active)}
  if(old!==active){requestAnimationFrame(()=>group.style.setProperty('--capsule-index',active));previous.set(key,active)}else group.style.setProperty('--capsule-index',active);
 });}
 const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>requestAnimationFrame(sync));sync();
})();

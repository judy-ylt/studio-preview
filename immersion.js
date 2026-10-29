/* Add tactile feedback without replacing the original navigation or scene physics. */
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const selector='.style-card,.bg-card,.gender-card,.card,.direction';
 let pending=null;
 document.addEventListener('click',event=>{
  const card=event.target.closest(selector);if(!card||reduce.matches)return;
  const peers=[...card.parentElement.children].filter(el=>el.matches(selector));
  pending={index:peers.indexOf(card),kind:card.classList.contains('card')?'.card':card.classList.contains('bg-card')?'.bg-card':card.classList.contains('gender-card')?'.gender-card':card.classList.contains('direction')?'.direction':'.style-card'};
  requestAnimationFrame(()=>{
   if(!pending)return;const item=pending;pending=null;
   const cards=[...document.querySelectorAll('#main '+item.kind)];
   const target=cards[item.index];if(!target)return;
   target.animate([{scale:'.98'},{scale:'1.018',offset:.55},{scale:'1'}],{duration:320,easing:'cubic-bezier(.2,.7,.3,1)'});
   const stamp=target.querySelector('.mood-art,.check');
   if(stamp)stamp.animate([{scale:'1.15',opacity:.55},{scale:'.97',opacity:1,offset:.65},{scale:'1'}],{duration:330,easing:'ease-out'});
  });
 },true);
 const prepare=()=>{
 document.querySelectorAll('.history-grid .history-photo img').forEach(img=>{
  const fit=()=>{if(img.naturalWidth&&img.naturalHeight)img.closest('.history-photo').style.setProperty('--photo-ratio',img.naturalWidth/img.naturalHeight)};
  if(!img.dataset.frameFit){img.dataset.frameFit='true';img.addEventListener('load',fit)}
  fit();
 });
 document.querySelectorAll('.cards').forEach(track=>{
  if(track.dataset.paperKeys)return;track.dataset.paperKeys='true';
  if(!track.hasAttribute('tabindex'))track.tabIndex=0;
  track.addEventListener('keydown',event=>{
   if(event.target!==track||!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();track.scrollBy({left:(event.key==='ArrowRight'?1:-1)*track.clientWidth*.65,behavior:reduce.matches?'instant':'smooth'});
  });
 });
 };
 prepare();const main=document.querySelector('#main');if(main)new MutationObserver(prepare).observe(main,{childList:true,subtree:true});
})();

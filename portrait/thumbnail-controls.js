// Icon buttons and slider share the same discrete thumbnail size setting.
(()=>{
 function sync(control){
  const slider=control.querySelector('.thumbnail-slider');
  control.querySelector('[data-density-step="-1"]').disabled=Number(slider.value)<=Number(slider.min);
  control.querySelector('[data-density-step="1"]').disabled=Number(slider.value)>=Number(slider.max);
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-density-step]');if(!button)return;
  const control=button.closest('.thumbnail-control'),slider=control.querySelector('.thumbnail-slider');
  slider.value=Math.max(Number(slider.min),Math.min(Number(slider.max),Number(slider.value)+Number(button.dataset.densityStep)));
  slider.dispatchEvent(new Event('input',{bubbles:true}));sync(control);
 });
 document.addEventListener('input',event=>{if(event.target.matches('.thumbnail-slider'))sync(event.target.closest('.thumbnail-control'))});
 const update=()=>document.querySelectorAll('.thumbnail-control').forEach(sync);
 new MutationObserver(update).observe(document.querySelector('main'),{childList:true,subtree:true});update();
})();

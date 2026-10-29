(()=>{
 let shutterBusy=false;
 window.preparePortraitFraming=()=>{
  document.body.classList.toggle('portrait-framing',state.step===5&&!state.busy);
  if(state.step===5&&!state.busy){const host=document.querySelector('.output-confirmation');if(host&&!host.querySelector('.portrait-viewfinder')){const finder=document.createElement('div');finder.className='portrait-viewfinder';finder.innerHTML='<canvas class="portrait-finder-canvas" role="img" aria-label="示範人物自然延伸構圖"></canvas><span>範例取景・'+state.ratio+'</span>';host.prepend(finder);updateFinder()}}
  if(state.step===6)shutterBusy=false;
 };
 function updateFinder(){const finder=document.querySelector('.portrait-viewfinder');if(!finder)return;const [a,b]=state.ratio.split(':').map(Number);const scale=Math.min(Math.min(580,innerWidth-48)/a,Math.min(420,innerHeight*.46)/b);finder.style.width=Math.round(a*scale)+'px';finder.style.height=Math.round(b*scale)+'px';finder.querySelector('span').textContent='示範人物構圖・'+state.ratio;renderPortraitComposition(finder.querySelector('canvas'),state.ratio)}
 window.addEventListener('resize',updateFinder);
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-ratio]'))requestAnimationFrame(updateFinder);
  if(e.target.closest('#next')&&state.step===5&&!state.busy&&!shutterBusy){shutterBusy=true;const shutter=document.createElement('div');shutter.className='portrait-shutter';document.body.append(shutter);setTimeout(()=>shutter.remove(),450)}
 },true);
 const main=document.querySelector('#main');
 new MutationObserver(window.preparePortraitFraming).observe(main,{childList:true,subtree:true});
 window.preparePortraitFraming();
})();

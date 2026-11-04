/* 11/3 style and pose cards hung from a gallery rail (motion modelled on Framer "Hanging Team"; own implementation).
   Straight picture rail, pendulum swing pushed by the cursor, 3D tilt toward the cursor, soft light on the paper.
   Only runs when clean-scene.css is active; reduced-motion keeps the cards still. */
(()=>{
 const scene=document.getElementById('sceneTheme');
 if(!scene||scene.disabled)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const SVG='http://www.w3.org/2000/svg',CORD_Y=12,SAG=0;
 const rest=[-1.2,.9,-.5,1.3,-.8,.6,-1.1];
 let track=null,cards=[],raf=0,ptr=null;

 function setup(){
  const t=document.querySelector('main:is([data-step="1"],[data-step="3"]) .cards');
  if(t===track&&t&&t.querySelector('.hang'))return;
  track=t;cancelAnimationFrame(raf);cards=[];
  if(!t)return;
  t.classList.add('hang-track');
  [...t.querySelectorAll('.card')].forEach((el,i)=>{
   el.classList.add('hang');
   el.insertAdjacentHTML('afterbegin','<i class="hang-wire" aria-hidden="true"></i><i class="hang-shine" aria-hidden="true"></i>');
   cards.push({el,rest:el.classList.contains('selected')?0:rest[i%rest.length],a:0,v:0,rx:0,ry:0,trx:0,try:0,hover:0,th:0,pivot:0,half:0});
  });
  cards.forEach(c=>c.a=c.rest);
  layout();
  t.addEventListener('pointermove',onMove);t.addEventListener('pointerleave',()=>{ptr=null;cards.forEach(c=>{c.trx=c.try=0;c.th=0})});
  t.addEventListener('scroll',()=>{ptr=null},{passive:true});
  apply();if(!reduced)raf=requestAnimationFrame(tick);
 }

 /* The rail is drawn across the whole scroll width (SAG 0 = straight); each card's wire runs up to it. */
 function layout(){
  if(!track)return;
  const W=track.scrollWidth;let svg=track.querySelector('.hang-cord');
  if(!svg){svg=document.createElementNS(SVG,'svg');svg.setAttribute('class','hang-cord');svg.setAttribute('aria-hidden','true');track.prepend(svg)}
  svg.setAttribute('width',W);svg.setAttribute('height',CORD_Y+SAG+10);svg.style.width=W+'px';
  const xs=cards.map(c=>c.el.offsetLeft+c.el.offsetWidth/2);
  let d=`M0 ${CORD_Y-6}`,prev=0,dots='';
  xs.forEach(x=>{d+=` Q ${(prev+x)/2} ${CORD_Y+SAG} ${x} ${CORD_Y}`;prev=x;dots+=`<circle cx="${x}" cy="${CORD_Y}" r="3.2"/>`});
  d+=` Q ${(prev+W)/2} ${CORD_Y+SAG} ${W} ${CORD_Y-6}`;
  cards.forEach(c=>{
   const len=Math.max(12,c.el.offsetTop-CORD_Y);
   c.pivot=len;c.half=c.el.offsetHeight/2;c.el.style.setProperty('--string',len+'px');
  });
  svg.innerHTML=`<path d="${d}"/>${dots}`;
 }

 function onMove(e){
  if(e.pointerType==='touch')return;
  const now=performance.now(),p={x:e.clientX,y:e.clientY,t:now};
  const vx=ptr?(p.x-ptr.x)/Math.max(8,now-ptr.t):0;ptr=p;
  cards.forEach(c=>{
   const r=c.el.getBoundingClientRect(),inside=p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;
   if(inside){
    if(!c.th&&!reduced)c.v+=Math.max(-90,Math.min(90,vx*55));  // brushing into a card pushes it
    c.th=1;const mx=(p.x-r.left)/r.width,my=(p.y-r.top)/r.height;
    c.try=(mx-.5)*14;c.trx=(.5-my)*10;
    c.el.style.setProperty('--mx',(mx*100).toFixed(1)+'%');c.el.style.setProperty('--my',(my*100).toFixed(1)+'%');
   }else if(c.th){c.th=0;c.trx=c.try=0}
  });
 }

 function tick(){
  if(!track||!track.isConnected){cards=[];track=null;return}
  const dt=1/60;
  cards.forEach(c=>{
   const target=c.el.classList.contains('selected')?0:c.rest;
   const acc=-38*(c.a-target)-2.6*c.v;           // underdamped spring: a few soft swings, then rest
   c.v+=acc*dt;c.a+=c.v*dt;c.a=Math.max(-14,Math.min(14,c.a));
   c.rx+=(c.trx-c.rx)*.12;c.ry+=(c.try-c.ry)*.12;c.hover+=(c.th-c.hover)*.15;
  });
  apply();raf=requestAnimationFrame(tick);
 }

 function apply(){
  cards.forEach(c=>{
   const d=c.pivot+c.half,lift=c.hover*-6;
   c.el.style.setProperty('--hang-t',`rotate(${c.a.toFixed(2)}deg) translateY(${(d+lift).toFixed(1)}px) perspective(900px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) translateY(${(-d).toFixed(1)}px)`);
   c.el.style.setProperty('--shine',c.hover.toFixed(3));
  });
 }

 new MutationObserver(setup).observe(document.getElementById('main'),{childList:true,subtree:true});
 addEventListener('resize',()=>{layout();apply()});
 setup();
})();

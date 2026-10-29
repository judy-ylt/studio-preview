// Shared spring interaction for portrait, cartoon and product settings bubbles.
var studioBubbleFrame;
function startStudioBubblePhysics(){
 if(studioBubbleFrame)cancelAnimationFrame(studioBubbleFrame);
 const cloud=document.querySelector('.inspiration-cloud,#bubbles,aside#summary');
 if(!cloud||cloud.hidden||getComputedStyle(cloud).display==='none')return;
 const bubbles=[...cloud.querySelectorAll('.inspiration-bubble,.bubble')];
 bubbles.forEach(el=>el.style.transform='');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 // One spring simulation owns all positions: no competing CSS or GSAP tweens.
 const bodies=bubbles.map((el,i)=>({el,i,x:0,y:0,vx:0,vy:0,ax:el.offsetLeft+el.offsetWidth/2,ay:el.offsetTop+el.offsetHeight/2,r:Math.min(el.offsetWidth,el.offsetHeight)*.46,person:el.matches('.bubble-person,.person,.bubble-product')}));
 let pointer=null,last=0;
 cloud.onpointermove=e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;const rect=cloud.getBoundingClientRect();pointer={x:e.clientX-rect.left,y:e.clientY-rect.top}};
 cloud.onpointerleave=cloud.onpointercancel=()=>pointer=null;
 function frame(time){
  if(!cloud.isConnected)return;
  const dt=last?Math.min((time-last)/1000,.025):.016;last=time;
  for(const b of bodies){
   let tx=0,ty=0,near=false;
   if(pointer){
    const dx=pointer.x-b.ax,dy=pointer.y-b.ay,d=Math.hypot(dx,dy),reach=b.r+48;
    if(d<reach){near=true;const limit=b.person?3:8,weight=Math.pow(1-d/reach,1.2),pull=Math.min(limit,d*.18)*weight;
     if(d>.01){tx=dx/d*pull;ty=dy/d*pull}
    }
   }
   const stiffness=near?78:62,damping=near?14:9;
   b.vx+=((tx-b.x)*stiffness-b.vx*damping)*dt;
   b.vy+=((ty-b.y)*stiffness-b.vy*damping)*dt;
  }
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j],dx=b.ax+b.x-a.ax-a.x,dy=b.ay+b.y-a.ay-a.y,d=Math.hypot(dx,dy);
   const base=Math.hypot(b.ax-a.ax,b.ay-a.ay),touch=Math.min(a.r+b.r,base-1);
   if(d<touch&&d>.01){const nx=dx/d,ny=dy/d,approach=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    const impulse=(touch-d)*24*dt+Math.max(0,-approach)*.25;
    a.vx-=nx*impulse;a.vy-=ny*impulse;b.vx+=nx*impulse;b.vy+=ny*impulse;
   }
  }
  for(const b of bodies){
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   const max=b.person?4:10,d=Math.hypot(b.x,b.y);
   if(d>max){b.x*=max/d;b.y*=max/d;b.vx*=.5;b.vy*=.5}
   if(!pointer&&Math.hypot(b.x,b.y,b.vx,b.vy)<.025){b.x=b.y=b.vx=b.vy=0}
   b.el.style.transform=`translate3d(${b.x}px,${b.y}px,0)`;
  }
  studioBubbleFrame=requestAnimationFrame(frame);
 }
 studioBubbleFrame=requestAnimationFrame(frame);
}
if(typeof bubblePhysicsFrame!=='undefined')cancelAnimationFrame(bubblePhysicsFrame);
if(typeof physics!=='undefined')cancelAnimationFrame(physics);
if(typeof startBubblePhysics==='function')startBubblePhysics=startStudioBubblePhysics;
if(typeof startPhysics==='function')startPhysics=startStudioBubblePhysics;
let studioBubbleRefresh;
new MutationObserver(()=>{cancelAnimationFrame(studioBubbleRefresh);studioBubbleRefresh=requestAnimationFrame(startStudioBubblePhysics)}).observe(document.querySelector('main'),{childList:true,subtree:true});
window.addEventListener('resize',startStudioBubblePhysics);
startStudioBubblePhysics();

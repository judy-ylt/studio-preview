/* Illustrative relighting of a reference mug, not an AI result of the uploaded product. */
const lightStudies={
 soft:{name:'柔亮均勻',note:'大面積柔光，陰影淡而柔，清楚呈現杯身。',shade:.08,blur:35,dx:0,dy:22,tint:'#fffdf6',filter:'brightness(1.07) saturate(.9)'},
 window:{name:'自然晨光',note:'左上方窗光照入，杯身與檯面留下柔和斜影。',shade:.27,blur:21,dx:160,dy:40,tint:'#fff4d6',filter:'brightness(1.03) saturate(.94)'},
 warm:{name:'溫暖夕光',note:'低角度暖光，影子拉長，呈現溫暖的傍晚氣氛。',shade:.35,blur:16,dx:260,dy:65,tint:'#ffca87',filter:'sepia(.18) saturate(1.2) brightness(1.02)'},
 side:{name:'側光立體',note:'光從左側照入，杯身右側較暗，凸顯輪廓與質地。',shade:.52,blur:13,dx:180,dy:20,tint:'#fffbef',filter:'contrast(1.12)'},
 dramatic:{name:'明暗對比',note:'集中光束搭配深色陰影，明暗分界更鮮明。',shade:.72,blur:8,dx:210,dy:40,tint:'#fff2d8',filter:'contrast(1.23) brightness(.93)'},
 cool:{name:'清冷明亮',note:'偏冷的柔光，背景明亮，呈現清爽乾淨的感覺。',shade:.14,blur:29,dx:65,dy:25,tint:'#dcefff',filter:'brightness(1.09) saturate(.76)'}
};
let studyMug;
function loadStudyMug(){return studyMug||(studyMug=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{studyMug=null;reject(new Error('mug'))};im.src='assets/sample-mug-clean.webp'}))}
async function drawLightStudy(canvas,override){
 const light=override||state.light,p=lightStudies[light]||lightStudies.soft;
 const version=(canvas._studyVersion||0)+1;canvas._studyVersion=version;
 let mug,material;try{[mug,material]=await Promise.all([loadStudyMug(),state.surface==='none'?null:getMaterial(state.surface)])}catch{toast('範例馬克杯載入失敗，請重新整理');return}
 if(!canvas.isConnected||canvas._studyVersion!==version)return;
 const [a,b]=state.ratio.split(':').map(Number);canvas.width=Math.round(1200*a/Math.max(a,b));canvas.height=Math.round(1200*b/Math.max(a,b));
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,horizon=h*.72;
 c.fillStyle=backgroundColor();c.fillRect(0,0,w,h);
 if(material){c.drawImage(material,0,0,material.width,material.height,0,horizon,w,h-horizon)}
 const bg=c.createLinearGradient(0,0,w,h*.4);bg.addColorStop(0,p.tint+'88');bg.addColorStop(1,light==='dramatic'?'#181c2580':'#27221d'+Math.round(p.shade*95).toString(16).padStart(2,'0'));c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(light==='window'||light==='warm'){
  // Large feathered light pools, without window-frame bands or hard edges.
  const halo=c.createRadialGradient(-w*.08,h*.12,0,w*.06,h*.25,w*1.15);
  halo.addColorStop(0,light==='warm'?'#ffd29a80':'#fff8df75');
  halo.addColorStop(.45,light==='warm'?'#ffdcaf30':'#fffbe528');
  halo.addColorStop(1,light==='warm'?'#ffdcaf00':'#fffbe500');
  c.fillStyle=halo;c.fillRect(0,0,w,h);
 }

 if(state.step===4){
  const ratio=state.box.w/state.box.h;
  const bh=Math.min(h*.85,h*state.scale/100),bw=Math.min(w*.88,bh*ratio),boxH=bw/ratio;
  const bx=Math.max(w*.03,Math.min(w-bw-w*.03,w*state.x/100-bw/2));
  const by=Math.max(h*.03,Math.min(h-boxH-h*.03,h*state.y/100-boxH/2));
  c.fillStyle='#ffffff18';c.fillRect(bx,by,bw,boxH);
  c.strokeStyle='#315f78';c.lineWidth=Math.max(2,w*.002);c.setLineDash([w*.012,w*.008]);c.strokeRect(bx,by,bw,boxH);c.setLineDash([]);
  c.font='500 '+Math.max(18,w*.025)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#315568';c.fillText('商品位置',bx+bw/2,by+boxH/2);
  canvas.dataset.ready='true';canvas.setAttribute('aria-label','商品構圖虛線範圍示意');return;
 }
 const f=Math.min(w*.65/mug.width,h*(state.scale/100)/mug.height),mw=mug.width*f,mh=mug.height*f;
 const cx=state.position==='left'?w*.3:state.position==='right'?w*.7:w*.5;
 const cy=state.step===3?h*.57:h*state.y/100,x=Math.max(w*.03,Math.min(w-mw-w*.03,cx-mw/2)),y=Math.max(h*.03,Math.min(h-mh-h*.03,cy-mh/2));
 const base=y+mh*.95;
 c.save();c.filter='blur('+p.blur*w/1200+'px)';c.translate(x+mw*.46,base);c.rotate(.12);c.fillStyle='#33271d'+Math.round((.12+p.shade*.35)*255).toString(16).padStart(2,'0');c.beginPath();c.ellipse(p.dx*w/2400,p.dy*h/2400,mw*.34+p.dx*w/2400,mh*.045+p.dy*h/4000,0,0,Math.PI*2);c.fill();c.restore();
 const layer=document.createElement('canvas');layer.width=mug.width;layer.height=mug.height;const g=layer.getContext('2d');g.filter=p.filter;g.drawImage(mug,0,0);g.filter='none';g.globalCompositeOperation='source-atop';
 const shade=g.createLinearGradient(0,0,mug.width,0);shade.addColorStop(0,p.tint+'33');shade.addColorStop(.35,'#ffffff06');shade.addColorStop(1,'rgba(18,23,30,'+p.shade+')');g.fillStyle=shade;g.fillRect(0,0,layer.width,layer.height);
 if(light==='warm'||light==='cool'){g.globalAlpha=.12;g.fillStyle=p.tint;g.fillRect(0,0,layer.width,layer.height)}
 c.drawImage(layer,x,y,mw,mh);canvas.dataset.ready='true';canvas.setAttribute('aria-label','範例馬克杯光感示意：'+p.name);
 const note=document.querySelector('.light-study-note');if(note)note.textContent=p.name+'｜'+p.note;
}
function prepareLightStudy(){
 const canvas=document.querySelector('#preview');if(!canvas||state.direction!=='replace'||![3,4].includes(state.step))return;
 const holder=canvas.parentElement;holder.classList.add('light-study-holder');
 if(!holder.querySelector('.light-study-label')){const badge=document.createElement('span');badge.className='light-study-label';badge.textContent=state.step===4?'虛線框為商品位置與大小示意':'光感示意，實際效果依商品而異';holder.append(badge)}
 if(state.step===3){
  const buttons=[...document.querySelectorAll('[data-choice="light"]')];if(!buttons.length)return;
  if(!document.querySelector('.light-study-note')){const note=document.createElement('p');note.className='light-study-note';note.setAttribute('aria-live','polite');note.textContent=lightStudies[state.light].name+'｜'+lightStudies[state.light].note;buttons[0].parentElement.after(note)}
  buttons.forEach(button=>{if(button.dataset.studyBound)return;button.dataset.studyBound='true';button.title=lightStudies[button.dataset.value].note;

  });
 }
}
document.addEventListener('DOMContentLoaded',()=>{prepareLightStudy();new MutationObserver(prepareLightStudy).observe(document.querySelector('#main'),{childList:true,subtree:true})});

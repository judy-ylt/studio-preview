const $=s=>document.querySelector(s);
// Navigation is a persistent sibling of the moving studio scene.
document.body.append(document.querySelector('.bottom'));
const labels=['拍攝對象','上傳照片','選擇風格','選擇背景','選擇姿勢','選擇輸出尺寸'];
const titles=['這次，想呈現哪一面的你？','從一張真實的你開始','找到你的形象風格','讓背景，襯托你的專業','選擇自然的鏡頭姿態','最後確認，準備好入鏡','你的形象，準備就緒'];
const subtitles=['選擇服裝與人物範例的參考方向，不限制你上傳的照片。','上傳一張清晰正面照，也可以先使用範例體驗。','從完整的形象範例出發，選一個最像你的方向。','用乾淨的光線與色調，讓視線回到人物。','選擇適合你的姿態與鏡頭構圖。','確認本次拍攝設定，選擇圖片的輸出比例。','查看示範成品，或回到設定嘗試另一種可能。'];
const styles=[{name:'求職履歷',en:'THE PROFESSIONAL',cat:'專業',id:0},{name:'主管形象',en:'MODERN EXECUTIVE',cat:'專業',id:1},{name:'團隊介紹',en:'NATURAL LIGHT',cat:'自然',id:2},{name:'創作者形象',en:'MONOCHROME',cat:'創意',id:3},{name:'個人品牌',en:'SOFT EDITORIAL',cat:'自然',id:4},{name:'作品集形象',en:'THE CREATIVE',cat:'創意',id:5}];
const backgrounds=[{name:'百搭專業',en:'SOFT GREY',color:'#d6d9de'},{name:'簡潔明亮',en:'PURE WHITE',color:'#f5f5f3'},{name:'溫暖親和',en:'WARM SAND',color:'#d8c8b5'},{name:'清爽理性',en:'AIRY BLUE',color:'#bfd8ef'},{name:'沉穩正式',en:'CHARCOAL',color:'#4e5560'},{name:'自然生活',en:'MORNING LIGHT',color:'linear-gradient(115deg,#e7e3d8 0%,#faf7ef 45%,#c7d1cf 100%)'},{name:'日光人像',color:'#e6e9e5',image:'assets/styling-room.webp',note:'自然、通透｜個人品牌與生活分享'},{name:'極簡棚拍',color:'#e5edf3',image:'assets/backdrop-room.webp',note:'簡潔、專注｜企業介紹與正式提案'},{name:'工作日常',color:'#dfe5eb',image:'assets/monitor-room.webp',note:'理性、沉靜｜創作者與專業分享'}];
const poses=[{name:'正面半身',sub:'沉穩、自信的第一印象',id:0},{name:'自然側身',sub:'保留一點輕鬆的距離',id:4},{name:'近距離特寫',sub:'把焦點留給你的眼神',id:2},{name:'雙手交抱',sub:'俐落有自信的專業姿態',id:1},{name:'輕鬆坐姿',sub:'放鬆肩膀，展現親和感',id:4},{name:'微側回眸',sub:'轉向鏡頭的自然瞬間',id:2},{name:'單手輕托下巴',sub:'沉靜、從容的思考感',id:3},{name:'自然站姿',sub:'舒展身形，保持輕鬆',id:5}];
const ratios=['1:1','3:4','4:3','16:9','9:16'];
const styleNotes=['適合履歷、企業介紹與正式提案','適合主管介紹與商務簡報','適合團隊介紹與親和的個人品牌','適合個性化投影片與創作者介紹','適合個人故事與溫和的品牌介紹','適合作品集、創意提案與自由工作者'];
const poseCategories=['半身','半身','特寫','半身','坐姿','半身','特寫','全身'];
function categoryMenu(key,options){return `<div class="toolbar category-toolbar"><div class="pills">${options.map(name=>`<button class="pill ${state[key]===name?'active':''}" data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${name}" aria-pressed="${state[key]===name}">${name}</button>`).join('')}</div></div>`}
const styleTags=[['正式','專業'],['俐落','自信'],['自然','親切'],['黑白','個性'],['柔和','親和'],['創意','自在']];
const backgroundTags=[['淺灰','中性'],['純白','清爽'],['米杏','柔和'],['淺藍','科技'],['深灰','低調'],['柔光','放鬆'],['窗邊','自然'],['棚景','專注'],['空間','生活感']];
const poseTags=[['正面','半身'],['側身','自然'],['特寫','聚焦'],['交抱','俐落'],['坐姿','輕鬆'],['回眸','自然'],['托下巴','沉靜'],['站姿','舒展']];
function tags(items){return `<span class="card-tags">${items.map(text=>`<span>${text}</span>`).join('')}</span>`}
const backgroundNotes=['安靜、中性｜履歷與專業簡報','乾淨、明亮｜產品與品牌介紹','溫和、親近｜自我介紹與團隊簡報','清爽、理性｜科技與提案簡報','沉穩、專注｜主管與商務形象','柔和、自然｜生活與創作分享'];
function outputSize(r){const [a,b]=r.split(':').map(Number);return `${Math.round(1600*a/Math.max(a,b))} × ${Math.round(1600*b/Math.max(a,b))} px`}

backgrounds.push(...portraitSceneEntries);
backgroundTags.push(...portraitSceneEntries.map(scene=>scene.tags));
const state={step:0,gender:'',photo:null,photoName:'',style:null,bg:null,pose:null,ratio:'3:4',filter:'全部',bgFilter:'全部',poseFilter:'全部',busy:false,result:false,variation:0,completed:0,historyView:'comfortable',historyColumns:2,historyId:null};
const historyPhotoIds=[2,3,4,5,8,9,10,11];
const asset=id=>`assets/portrait-${id}.jpg`;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function selected(v,target){return v===target?' selected':''}
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function setChoice(key,value){if(key==='gender'&&value!==state.gender&&state.photoName==='範例照片'){state.photo=asset(value==='男性'?1:0)}if(key==='ratio'){state.ratio=value;document.querySelectorAll('[data-ratio]').forEach(el=>{const active=el.dataset.ratio===value;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active))});$('.output-size').textContent=`${value}（${outputSize(value)} · PNG）`;return}const scroll=['style','pose','bg'].includes(key)?$('#styleCarousel')?.scrollLeft:0;state[key]=value;render();if(['style','pose','bg'].includes(key)&&$('#styleCarousel'))$('#styleCarousel').scrollLeft=scroll||0}
function canNext(){return [!!state.gender,!!state.photo,state.style!==null,state.bg!==null,state.pose!==null,true,true][state.step]&&!state.busy}
function navigate(step){if(state.busy)return;if(step>state.completed)return;state.step=step;render();window.scrollTo({top:0,behavior:'smooth'})}
function previewSrc(){return state.photo||(state.gender?asset(state.gender==='女性'?0:1):null)}
function renderSummary(){
 const chosen={person:!!state.photo,style:state.style!==null,background:state.bg!==null,pose:state.pose!==null};
 const entries=[['person',1,'人物',state.photo?'已選照片':'尚未選擇'],['style',2,'風格',styles[state.style]?.name||'選擇風格'],['background',3,'背景',backgrounds[state.bg]?.name||'選擇背景'],['pose',4,'姿勢',poses[state.pose]?.name||'選擇姿勢']];
 $('#mini').innerHTML=`<div class="inspiration-cloud">${entries.map(([kind,step,title,value],i)=>`<button class="inspiration-bubble bubble-${kind} ${chosen[kind]?'is-chosen':'is-empty'}" style="--delay:${i*.15}s;--float-delay:${-i*1.7}s" data-bubble-step="${step}" ${step>state.completed||state.busy?'disabled':''} aria-label="調整${title}：${esc(value)}">${kind==='person'&&previewSrc()?`<img class="person-bubble-photo" src="${previewSrc()}" alt="已選人物照片">`:''}<span class="bubble-kicker">${title}</span><strong>${esc(value)}</strong></button>`).join('')}</div>`;
 $('#summary').innerHTML='';
 document.querySelectorAll('[data-bubble-step]').forEach(el=>el.onclick=()=>navigate(+el.dataset.bubbleStep));
 animateInspiration();
 startBubblePhysics();
}
var previousBubbles;
function animateInspiration(){
 // Selection is expressed through a quiet fill change in place.
 // Pointer physics supplies the only pronounced motion.
}
var bubblePhysicsFrame;
function startBubblePhysics(){
 if(bubblePhysicsFrame)cancelAnimationFrame(bubblePhysicsFrame);
 const cloud=$('.inspiration-cloud');
 if(!cloud||state.step<2)return;
 const bubbles=[...cloud.querySelectorAll('.inspiration-bubble')];
 bubbles.forEach(el=>el.style.transform='');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 // One spring simulation owns all positions: no competing CSS or GSAP tweens.
 const bodies=bubbles.map((el,i)=>({el,i,x:0,y:0,vx:0,vy:0,ax:el.offsetLeft+el.offsetWidth/2,ay:el.offsetTop+el.offsetHeight/2,r:Math.min(el.offsetWidth,el.offsetHeight)*.46,person:el.classList.contains('bubble-person')}));
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
  bubblePhysicsFrame=requestAnimationFrame(frame);
 }
 bubblePhysicsFrame=requestAnimationFrame(frame);
}
var liquidFrame;
function renderStepChain(){
 if(liquidFrame)cancelAnimationFrame(liquidFrame);
 const nav=$('#steps'),target=Math.min(state.step,5)*100;
 const start=displayedStep===undefined?target:Math.min(displayedStep,5)*100;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 nav.insertAdjacentHTML('afterbegin',`<svg class="organic-chain liquid-map" viewBox="-50 0 600 70" preserveAspectRatio="none" aria-hidden="true">${labels.map((_,i)=>`<circle class="liquid-base-node" cx="${i*100}" cy="35" r="4" fill="${i*100<target?'#555':'#c8c9c6'}"/>`).join('')}<path class="liquid-body" fill="#202321"/></svg>`);
 const path=nav.querySelector('.liquid-body');
 function paint(t){
  const flow=t*t*(3-2*t),center=start+(target-start)*flow;
  const low=Math.max(0,center-100),high=Math.min(500,center+100);
  const nodes=[{x:low,r:4},{x:center,r:8},{x:high,r:4}];
  const top=[],bottom=[];
  for(let i=0;i<=400;i++){
   const x=low-4+(high-low+8)*i/400;
   let r=.55;
   for(const n of nodes)r=Math.max(r,.55+(n.r-.55)*Math.exp(-Math.pow((x-n.x)/17,2)));
   if(x<low)r=Math.sqrt(Math.max(0,16-(x-low)**2));
   if(x>high)r=Math.sqrt(Math.max(0,16-(x-high)**2));
   top.push(`${x},${35-r}`);bottom.push(`${x},${35+r}`);
  }
  nav.querySelectorAll('.liquid-base-node').forEach((node,i)=>node.setAttribute('opacity',Math.abs(i*100-center)<=100.1?'0':'1'));
  path.setAttribute('d',`M${top.join(' L')} L${bottom.reverse().join(' L')}Z`);
 }
 if(reduced||start===target){paint(1);return}
 let began;
 function frame(time){if(!nav.isConnected)return;began??=time;const t=Math.min(1,(time-began)/600);paint(t);if(t<1)liquidFrame=requestAnimationFrame(frame)}
 paint(0);liquidFrame=requestAnimationFrame(frame);
}
var displayedStep;
function captureTravel(){
 const app=$('.app');if(displayedStep===undefined||displayedStep===state.step||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
 document.querySelectorAll('.departing-scene').forEach(el=>el.remove());
 const copy=app.cloneNode(true),layer=copy.querySelector('.scene-layer'),source=app.querySelector('.scene-layer');
 if(layer&&source){const cs=getComputedStyle(source);layer.style.backgroundImage=cs.backgroundImage;layer.style.backgroundSize=cs.backgroundSize;layer.style.backgroundPosition=cs.backgroundPosition}
 copy.querySelector('.summary')?.remove();copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));copy.classList.add('departing-scene');copy.inert=true;copy.setAttribute('aria-hidden','true');return {copy,direction:state.step>displayedStep?-1:1};
}
function runTravel(travel){
 displayedStep=state.step;if(!travel)return;
 const app=$('.app'),{copy,direction}=travel;document.body.append(copy);
 const opts={duration:750,easing:'cubic-bezier(.22,.68,.2,1)',fill:'both'};
 const leave=copy.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${direction*18}vw)`}],opts);
 const enter=app.querySelector('main').animate([{opacity:0,transform:`translateX(${-direction*18}vw)`},{opacity:1,transform:'translateX(0)'}],opts);
 leave.finished.then(()=>copy.remove()).catch(()=>copy.remove());enter.finished.then(()=>enter.cancel()).catch(()=>{});
}
var studioWorldPosition,studioWorldAnimation;
function updateStudioWorld(){
 let world=document.querySelector('.studio-world');
 if(!world){world=document.createElement('div');world.className='studio-world';world.setAttribute('aria-hidden','true');document.body.prepend(world)}
 document.body.classList.add('continuous-studio');
 document.body.classList.remove('inside-studio','pose-stage-active');
 if(!world.querySelector('.studio-panorama'))world.innerHTML='<img class="studio-panorama" src="assets/studio-continuous-v2.webp" alt="">';
 const target=Math.min(state.step,5)/5*100;
 if(studioWorldPosition===target)return;
 studioWorldAnimation?.cancel();
 world.querySelector('img').style.objectPosition=target+'% center';
 studioWorldPosition=target;
}
function render(){const travel=captureTravel();updateStudioWorld();const app=document.querySelector('.app');app.dataset.scene=['entry','preparation','styling','backdrops','shooting','review','review'][state.step];document.querySelector('.app').classList.toggle('has-inspiration',state.step>=2&&state.step!==6);document.querySelector('.summary').hidden=state.step<2||state.step===6;document.querySelector('.workspace').classList.toggle('studio-workspace',(state.step===2||state.step===4));const previousStep=app.dataset.previousStep===undefined?state.step:Number(app.dataset.previousStep);app.style.setProperty('--travel',state.step>=previousStep?'28px':'-28px');app.dataset.previousStep=state.step;const sceneLayer=document.createElement('div');sceneLayer.className='scene-layer';sceneLayer.setAttribute('aria-hidden','true');app.querySelector('.scene-layer')?.remove();app.prepend(sceneLayer);state.completed=Math.max(state.completed,Math.min(state.step,5));$('#steps').innerHTML=['人物','照片','風格','背景','姿勢','尺寸'].map((label,i)=>`<button aria-label="${label}" title="${label}" class="step ${i===Math.min(state.step,5)?'active':i<state.step?'done':''}" data-nav="${i}" ${i>state.completed||state.busy?'disabled':''} ${i===Math.min(state.step,5)?'aria-current="step"':''}><span class="step-number">${i<state.step?'✓':String(i+1).padStart(2,'0')}</span><span>${label}</span></button>`).join('');$('#steps').dataset.current=Math.min(state.step,5);$('#steps').style.setProperty('--active-index',Math.min(state.step,5));$('#steps').style.setProperty('--progress',`${Math.min(state.step,5)/5*100}%`);renderSummary();$('#back').hidden=state.step===0||state.step===6;$('#next').hidden=state.step===6;$('#back').disabled=state.busy;$('#next').disabled=!canNext();$('#next').textContent=state.step===5?'開始製作':state.step===6?'重新開始':'下一步';$('#footnote').textContent=state.step===5?'示範模式 · 不消耗點數':state.step===6?'示範成品 · 尚未接入 AI 生成':`STEP ${String(state.step+1).padStart(2,'0')} / 06`;$('#main').innerHTML=`<div class="page-top"><div><h1>${state.step===6?'示範照片完成':state.step===0?'選擇人物參考方向':labels[state.step]}</h1></div></div><div class="content" id="content"></div>`;
const c=$('#content');if(state.busy)c.innerHTML=`<div class="processing" role="status"><div class="spinner"></div><h2>正在準備示範形象照</h2><p>整理拍攝設定、光線與輸出構圖⋯</p><div class="progress"><span></span></div><p>示範流程不會上傳你的照片</p></div>`;else switch(state.step){case 0:c.innerHTML=`<div class="gender-grid">${[['女性',0,'FEMALE'],['男性',1,'MALE']].map(([name,id,en])=>`<button class="gender-card${selected(state.gender,name)}" data-gender="${name}" aria-pressed="${state.gender===name}"><span class="profile-silhouette" role="img" aria-label="${name}光影輪廓" style="background-position:${id*100}% center"></span><span class="overlay"><strong>${name}</strong></span></button>`).join('')}</div>`;break;
case 1:c.innerHTML=`<div class="upload-layout"><div><div class="dropzone" id="dropzone">${state.photo?`<div><img class="upload-preview" src="${state.photo}" alt="已選取的原始照片"><p>${esc(state.photoName)}</p><button class="secondary" id="replace">更換照片</button></div>`:`<div><span class="upload-icon">⇧</span><h3>拖曳照片到這裡</h3><p>JPG、PNG 或 WebP，最大 15 MB</p><button class="primary" id="chooseFile">選擇照片</button><p>或 <button class="text-btn" id="sample">使用範例照片</button></p></div>`}</div><input id="file" type="file" accept="image/jpeg,image/png,image/webp" hidden><p id="uploadError" class="error" role="alert"></p></div><section class="photo-library"><div class="library-header"><div><h3>曾上傳的照片</h3><span>${historyPhotoIds.length} 張照片 · 示範紀錄</span></div><div class="thumbnail-control" role="group" aria-label="調整縮圖大小"><button type="button" class="thumbnail-icon small-grid" data-density-step="-1" aria-label="縮小縮圖" title="縮小縮圖"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></button><input class="thumbnail-slider" type="range" min="0" max="3" step="1" value="${5-state.historyColumns}" style="--slider-progress:${(5-state.historyColumns)/3*100}%" aria-label="縮圖大小" aria-valuetext="每排 ${state.historyColumns} 張"><button type="button" class="thumbnail-icon large-grid" data-density-step="1" aria-label="放大縮圖" title="放大縮圖"><i></i><i></i><i></i><i></i></button></div></div><div class="history-grid" style="--history-columns:${state.historyColumns}">${historyPhotoIds.map((i,index)=>`<button class="history-photo ${state.historyId===i?'selected':''}" data-history-id="${i}" aria-label="選用歷史照片 ${String(index+1).padStart(2,'0')}" aria-pressed="${state.historyId===i}"><img src="${asset(i%6)}" alt="歷史人像 ${index+1}" style="${i>=6?'object-position:60% 35%;transform:scale(1.12)':''}"><span class="history-caption">${i<6?'10 / 06':'10 / 03'}</span></button>`).join('')}</div></section></div>`;break;
case 2:c.innerHTML=`<div class="toolbar"><div class="pills">${['全部','專業','自然','創意'].map(x=>`<button class="pill ${state.filter===x?'active':''}" data-filter="${x}" aria-pressed="${state.filter===x}">${x}</button>`).join('')}</div><span class="count" style="padding:8px 0">${styles.filter(s=>state.filter==='全部'||s.cat===state.filter).length} 種風格</span></div><div class="studio-scene"><img class="studio-set" src="assets/studio-set.webp" alt="柔光燈、背景紙與高腳椅組成的攝影棚佈景"><div class="style-carousel" id="styleCarousel" tabindex="0" aria-label="風格輪播，可左右拖曳或使用方向鍵">${styles.map((s,i)=>state.filter!=='全部'&&s.cat!==state.filter?'':`<button class="style-card${selected(state.style,i)}" data-style="${i}" aria-pressed="${state.style===i}"><canvas class="portrait" data-style-preview="${s.id}" data-sheet="${styleSheetSource()}" role="img" aria-label="${state.gender}・${s.name}風格示意"></canvas><span class="overlay"><strong>${s.name}</strong>${tags(styleTags[i])}</span></button>`).join('')}</div><div class="carousel-controls"><button class="carousel-prev" aria-label="上一組風格">‹</button><button class="carousel-next" aria-label="下一組風格">›</button></div></div>`;break;
case 3:c.innerHTML=`${categoryMenu('bgFilter',['全部','純色','場景'])}<div class="swatch-book" id="styleCarousel" tabindex="0" aria-label="背景樣本冊，可左右拖曳或使用方向鍵">${[0,6,2,7,3,8,1,4,5,...portraitSceneEntries.map((_,i)=>i+9)].filter(i=>state.bgFilter==='全部'||(state.bgFilter==='場景')===!!backgrounds[i].image).map(i=>{const b=backgrounds[i];return `<button class="bg-card${selected(state.bg,i)}" data-bg="${i}" aria-pressed="${state.bg===i}" style="--card-angle:${[-2,1,-1,2,-1.5,1.3,-2,1,-1][i%9]}deg"><span class="bg-swatch" style="background:${b.color}">${b.sceneTile!==undefined?`<canvas class="scene-card-image" data-scene-tile="${b.sceneTile}" role="img" aria-label="${b.name}場景示意"></canvas>`:b.image?`<img src="${b.image}" alt="${b.name}場景示意">`:''}</span><span class="bg-label"><small>${b.image?'場景背景':'純色色票'}</small><strong>${b.name}</strong>${tags(backgroundTags[i])}</span></button>`}).join('')}</div><div class="carousel-controls swatch-controls"><button class="carousel-prev" aria-label="上一組背景">‹</button><button class="carousel-next" aria-label="下一組背景">›</button></div>`;break;
case 4:c.innerHTML=`${categoryMenu('poseFilter',['全部','半身','特寫','坐姿','全身'])}<div class="studio-scene pose-scene"><div class="style-carousel pose-carousel" id="styleCarousel" tabindex="0" aria-label="姿勢輪播，可左右拖曳或使用方向鍵">${poses.map((p,i)=>state.poseFilter!=='全部'&&poseCategories[i]!==state.poseFilter?'':`<button class="style-card pose-style-card${selected(state.pose,i)}" data-pose="${i}" aria-pressed="${state.pose===i}"><div class="pose-art" role="img" aria-label="${p.name}素描姿態示意" style="background-position:${(i%4)/3*100}% ${Math.floor(i/4)*100}%"></div><span class="overlay"><strong>${p.name}</strong>${tags(poseTags[i])}</span></button>`).join('')}</div><div class="carousel-controls"><button class="carousel-prev" aria-label="上一組姿勢">‹</button><button class="carousel-next" aria-label="下一組姿勢">›</button></div></div>`;break;
case 5:c.innerHTML=`<section class="output-confirmation"><div class="ratio-grid">${ratios.map(r=>`<button class="ratio-btn${selected(state.ratio,r)}" data-ratio="${r}" aria-pressed="${state.ratio===r}"><span class="ratio-shape" style="aspect-ratio:${r.replace(':','/')};width:${76*Number(r.split(':')[0])/Math.max(...r.split(':').map(Number))}px;height:${76*Number(r.split(':')[1])/Math.max(...r.split(':').map(Number))}px"></span><strong>${r}</strong><small>(${outputSize(r)} · PNG)</small></button>`).join('')}</div><p class="output-size" aria-live="polite">${state.ratio}（${outputSize(state.ratio)} · PNG）</p><p class="prototype-note">示範人物構圖，直式呈現更多身形；尚未依上傳照片延伸或套用姿勢。</p></section>`;break;
case 6:c.innerHTML=`<div class="result-layout"><div><div class="result-frame"><canvas id="resultCanvas" aria-label="示範形象照預覽"></canvas></div></div><div class="result-info"><p>${styles[state.style]?.name} / ${backgrounds[state.bg]?.name}<br>${poses[state.pose]?.name} / ${state.ratio}</p><div class="demo-note">此為範例人物的背景與比例示意，尚未依上傳照片生成或套用姿勢。下載檔案含 DEMO 標記。</div><div class="result-actions"><button class="primary" id="download">下載圖片</button><button class="secondary" id="regenerate">重新生成</button></div><div class="result-links"><button id="adjust">調整設定</button><button id="restart">重新開始</button></div></div></div>`;drawResult();break;}
if(state.step===5&&!state.busy){$('.ratio-grid').classList.add('output-ratios')}
$('.page-top').classList.add('step-arrival');c.classList.add('step-arrival');renderStepChain();
bind();drawStylePreviews();drawSceneCards();bindStyleCarousel();fitRatioPreview();runTravel(travel)}
function bind(){const slider=document.querySelector('.thumbnail-slider');if(slider)slider.oninput=()=>{state.historyColumns=5-Number(slider.value);const grid=document.querySelector('.history-grid');grid.style.setProperty('--history-columns',state.historyColumns);slider.setAttribute('aria-valuetext','每排 '+state.historyColumns+' 張');slider.style.setProperty('--slider-progress',Number(slider.value)/3*100+'%');if(typeof sizePhotoLibrary==='function')sizePhotoLibrary()};document.querySelectorAll('[data-history-view]').forEach(el=>el.onclick=()=>{state.historyView=el.dataset.historyView;render()});document.querySelectorAll('[data-history-id]').forEach(el=>el.onclick=()=>{if(state.photo?.startsWith('blob:'))URL.revokeObjectURL(state.photo);state.historyId=+el.dataset.historyId;state.photo=asset(state.historyId%6);state.photoName=`歷史照片 ${String(historyPhotoIds.indexOf(state.historyId)+1).padStart(2,'0')}（示範）`;render()});document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=()=>navigate(+el.dataset.nav));for(const key of ['gender','style','bg','pose','ratio','filter','bgFilter','poseFilter'])document.querySelectorAll(`[data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`).forEach(el=>el.onclick=()=>setChoice(key,['style','bg','pose'].includes(key)?+el.dataset[key]:el.dataset[key]));if(state.step===1){const file=$('#file');const choose=()=>file.click();if($('#chooseFile'))$('#chooseFile').onclick=choose;if($('#replace'))$('#replace').onclick=choose;file.onchange=()=>loadPhoto(file.files[0]);for(const id of ['sample','sampleSide'])if($('#'+id))$('#'+id).onclick=()=>{if(state.photo?.startsWith('blob:'))URL.revokeObjectURL(state.photo);state.photo=asset(state.gender==='男性'?1:0);state.photoName='範例照片';state.historyId=null;render()};const zone=$('#dropzone');zone.ondragover=e=>{e.preventDefault();zone.classList.add('dragging')};zone.ondragleave=()=>zone.classList.remove('dragging');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('dragging');loadPhoto(e.dataTransfer.files[0])}}if($('#download'))$('#download').onclick=()=>{const c=$('#resultCanvas');if(!c.dataset.ready)return notify('圖片準備中，請稍候');c.toBlob(blob=>{if(!blob)return notify('下載失敗，請再試一次');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`portrait-demo-${state.ratio.replace(':','x')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('示範圖片已下載')},'image/png')};if($('#regenerate'))$('#regenerate').onclick=()=>{state.variation++;generate()};if($('#restart'))$('#restart').onclick=()=>$('#next').onclick();if($('#adjust'))$('#adjust').onclick=()=>navigate(2)}
function loadPhoto(file){if(!file)return;const error=$('#uploadError');if(!['image/jpeg','image/png','image/webp'].includes(file.type)){error.textContent='請選擇 JPG、PNG 或 WebP 圖片。';return}if(file.size>15*1024*1024){error.textContent='圖片超過 15 MB，請先縮小檔案。';return}const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{if(state.photo?.startsWith('blob:'))URL.revokeObjectURL(state.photo);state.photo=url;state.photoName=file.name;state.historyId=null;render();if(im.width<800||im.height<800)notify('照片已載入；建議使用至少 800 × 800 px 的照片')};im.onerror=()=>{URL.revokeObjectURL(url);error.textContent='無法讀取這張圖片，請選擇其他檔案。'};im.src=url}
function generate(){state.step=5;state.busy=true;render();setTimeout(()=>{state.busy=false;state.step=6;state.result=true;render();window.scrollTo({top:0,behavior:'smooth'})},2400)}
async function drawResult(){const canvas=$('#resultCanvas');if(!canvas)return;const [a,b]=state.ratio.split(':').map(Number);canvas.parentElement.style.width=Math.min(canvas.parentElement.parentElement.clientWidth,Math.min(innerHeight*.52,500)*a/b+20)+'px';if(!await renderPortraitComposition(canvas,state.ratio,1600,true))return;const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(15,30,50,.48)';ctx.fillRect(0,canvas.height-55,canvas.width,55);ctx.fillStyle='white';ctx.font='20px sans-serif';ctx.fillText('DEMO / PORTRAIT STUDIO',25,canvas.height-20);canvas.dataset.ready='true'}

$('#back').onclick=()=>navigate(Math.max(0,state.step-1));$('#next').onclick=()=>{if(!canNext())return;if(state.step===5)return generate();if(state.step===6){if(state.photo?.startsWith('blob:'))URL.revokeObjectURL(state.photo);Object.assign(state,{step:0,gender:'',photo:null,photoName:'',style:null,bg:null,pose:null,ratio:'3:4',filter:'全部',bgFilter:'全部',poseFilter:'全部',busy:false,result:false,variation:0,completed:0,historyId:null});render();window.scrollTo({top:0});return}state.step++;render();window.scrollTo({top:0,behavior:'smooth'})};$('#closeHelp').onclick=$('#gotIt').onclick=()=>$('#helpDialog').close();render();
if(document.modelContext?.registerTool){const abort=new AbortController();const register=t=>{try{Promise.resolve(document.modelContext.registerTool(t,{signal:abort.signal})).catch(()=>{})}catch{}};register({name:'read_portrait_session',description:'Read current prototype step and selected settings. Does not include photo data.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({step:state.step,gender:state.gender,hasPhoto:!!state.photo,style:styles[state.style]?.name??null,background:backgrounds[state.bg]?.name??null,pose:poses[state.pose]?.name??null,ratio:state.ratio,demo:true})});register({name:'configure_portrait_session',description:'Set a visible portrait setting for the current step. Does not generate images or upload photos.',inputSchema:{type:'object',properties:{setting:{type:'string',enum:['gender','style','bg','pose','ratio','filter','bgFilter','poseFilter']},value:{type:'string'}},required:['setting','value'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({setting,value})=>{if(state.busy)throw Error('Session is busy');const expected={gender:0,style:2,filter:2,bg:3,pose:4,ratio:5};if(expected[setting]!==state.step)throw Error('Navigate to the relevant step first');const valid={gender:['女性','男性'],style:styles.map((_,i)=>String(i)),bg:backgrounds.map((_,i)=>String(i)),pose:poses.map((_,i)=>String(i)),ratio:ratios,filter:['全部','專業','自然','創意']};if(!valid[setting]?.includes(value))throw Error('Invalid setting value');setChoice(setting,['style','bg','pose'].includes(setting)?+value:value);return{setting,value,step:state.step}}});window.addEventListener('pagehide',()=>abort.abort(),{once:true})}

function bindStyleCarousel(){
 const track=$('#styleCarousel');if(!track)return;
 let down=false,startX=0,startScroll=0,moved=false,overshoot=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cards=[...track.querySelectorAll('.style-card,.bg-card')];
 const recoil=()=>{const distance=overshoot;overshoot=0;cards.forEach(card=>{card.style.translate='';if(!reduced&&distance)card.animate([{translate:`${distance}px 0`},{translate:`${-distance*.1}px 0`,offset:.65},{translate:'0px 0'}],{duration:430,easing:'cubic-bezier(.2,.7,.25,1)'})})};
 track.onpointerdown=e=>{if(e.pointerType==='touch')return;if(e.button!==0)return;down=true;moved=false;startX=e.clientX;startScroll=track.scrollLeft};
 
 function release(e){if(!down)return;down=false;if(e&&track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);track.classList.remove('dragging');recoil()}
 track.onpointerup=release;track.onpointercancel=release;track.onlostpointercapture=release;
 track.onpointermove=e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5){if(!moved){track.setPointerCapture(e.pointerId);track.classList.add('dragging')}moved=true;const desired=startScroll-dx,max=track.scrollWidth-track.clientWidth;track.scrollLeft=desired;overshoot=reduced?0:Math.tanh((Math.max(0,Math.min(max,desired))-desired)/100)*22;cards.forEach(card=>card.style.translate=`${overshoot}px 0`);e.preventDefault()}};
 track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
 track.ondragstart=e=>e.preventDefault();
 const shift=dir=>{if((dir<0&&track.scrollLeft<=1)||(dir>0&&track.scrollLeft>=track.scrollWidth-track.clientWidth-1)){overshoot=-dir*12;recoil();return}track.scrollBy({left:dir*track.clientWidth*.55,behavior:reduced?'instant':'smooth'})};
 $('.carousel-prev').onclick=()=>shift(-1);$('.carousel-next').onclick=()=>shift(1);
 track.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();shift(e.key==='ArrowRight'?1:-1)}};
}

var ratioObserver;
function fitRatioPreview(){
 if(ratioObserver)ratioObserver.disconnect();
 const stage=document.querySelector('.ratio-preview-stage'),frame=document.querySelector('.ratio-live-frame');if(!stage||!frame)return;
 const fit=()=>{const [a,b]=state.ratio.split(':').map(Number),r=a/b;const height=Math.max(0,Math.min(stage.clientHeight-16,(stage.clientWidth-16)/r));frame.style.height=height+'px';frame.style.setProperty('height',height+'px','important');frame.style.width=height*r+'px'};
 fit();ratioObserver=new ResizeObserver(fit);ratioObserver.observe(stage);
}

// Independent scale leaves photo rotations and scene translation untouched.
const pressedButtons=new WeakMap();
document.addEventListener('pointerdown',event=>{
 const button=event.target.closest('button');
 if(!button||button.disabled||button.matches('.style-card,.gender-card,.inspiration-bubble,.step,.ratio-btn')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 pressedButtons.get(button)?.cancel();
 pressedButtons.set(button,button.animate([{scale:'1'},{scale:'.965'}],{duration:100,fill:'forwards',easing:'ease-out'}));
 const release=()=>{pressedButtons.get(button)?.cancel();if(button.isConnected)button.animate([{scale:'.965'},{scale:'1.025',offset:.6},{scale:'1'}],{duration:270,easing:'ease-out'});document.removeEventListener('pointerup',release);document.removeEventListener('pointercancel',release)};
 document.addEventListener('pointerup',release,{once:true});document.addEventListener('pointercancel',release,{once:true});
});

const accentThemes=[
 ['深藍','#004896','#2769ad','#dce8f5'],['橄欖','#546342','#73825e','#e1e7d9'],
 ['陶土','#805447','#a37464','#efe0d8'],['莓紫','#6b526c','#8a6d8c','#e9dfea'],
 ['暖金','#705b34','#927b4d','#eee5d2'],['石墨','#495158','#69747d','#e0e5e9']
];
const themePreview=document.createElement('details');themePreview.className='theme-preview';
themePreview.innerHTML='<summary>主色預覽</summary><div class="theme-options">'+accentThemes.map(([name,color],i)=>`<button data-theme="${i}" aria-label="${name}" title="${name}" style="--swatch:${color}"><span></span>${name}</button>`).join('')+'</div>';
// Palette preview removed from the product interface.
function setAccent(index){
 const theme=accentThemes[index]||accentThemes[0],root=document.documentElement;
 root.style.setProperty('--accent',theme[1]);root.style.setProperty('--accent-highlight',theme[2]);root.style.setProperty('--accent-soft',theme[3]);
 themePreview.querySelectorAll('[data-theme]').forEach(el=>el.setAttribute('aria-pressed',Number(el.dataset.theme)===index));
 try{localStorage.setItem('portrait-preview-theme',String(index))}catch{}
}
themePreview.addEventListener('click',e=>{const button=e.target.closest('[data-theme]');if(button)setAccent(Number(button.dataset.theme))});
let initialAccent=0;try{initialAccent=Number(localStorage.getItem('portrait-preview-theme')||0)}catch{}
setAccent(0);

const $=s=>document.querySelector(s);
const labels=['上傳照片','藝術風格','選擇情緒','選擇動作','加入文字','完成卡通照'];
const styles=[['水彩插畫','柔和・手繪'],['扁平插畫','簡潔・清爽'],['彩鉛手繪','自然・溫暖'],['黏土卡通','立體・可愛'],['漫畫線稿','鮮明・活潑'],['剪紙拼貼','趣味・層次'],['幾何噴繪','色塊・噴繪顆粒']];
const moods=[['開心','愉快・放鬆'],['傷心','低落・難過'],['生氣','不滿・抗議'],['喜歡','喜愛・心動'],['驚訝','意外・驚喜'],['想睡','疲倦・放空'],['得意','自信・滿足'],['疑惑','不解・好奇']];
const poses=['揮手打招呼','雙手歡呼','比讚','比耶','雙手抱胸','托腮思考','雙手捧臉','鞠躬致謝'];
const texts=['謝謝你','辛苦了','收到','加油','太棒了','早安','自訂文字','不要文字'];
const state={step:0,completed:0,photo:null,style:null,mood:null,pose:null,text:null,custom:'',font:'sans-serif',placement:'left',historyView:'comfortable',historyColumns:2};
const uploadedPhotos=[];const uploadedDates=new Map();
let photoUrl=null,previous=0,physics;const carouselOffsets={};
const fontFamily=()=>state.font==='cursive'?'Kaiti TC, STKaiti, KaiTi, cursive':state.font;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chosenText=()=>state.text===7?'':state.text===6?state.custom:state.text===null?'':texts[state.text];
const enabled=()=>state.step===0?!!state.photo:state.step===1?state.style!==null:state.step===2?state.mood!==null:state.step===3?state.pose!==null:state.step===4?state.text!==null&&(state.text!==6||state.custom.trim()!==''):true;
const bgStyle=i=>`background-position:${i%3/2*100}% ${Math.floor(i/3)*100}%`;
function card(content,name,tag,index,key){return `<button class="card ${state[key]===index?'selected':''}" data-choice="${key}" data-value="${index}" aria-pressed="${state[key]===index}"><span class="check">✓</span>${content}<div class="caption"><strong>${name}</strong>${tag?`<small>${tag}</small>`:''}</div></button>`}
function face(i){const mouths=['M32 58 Q50 80 68 58','M35 64 Q50 69 65 64','M50 60 a8 10 0 1 0 .1 0','M33 64 Q52 74 70 56','M36 68 Q49 61 63 66','M33 64 L67 64'];return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12 C12 12 10 87 50 90 C90 87 88 12 50 12 Z"/><path d="M29 43 L39 42 M61 42 L71 43 M50 46 L47 56 L53 56"/><path d="${mouths[i]}"/>${i===4?'<path d="M65 83 Q83 62 75 60 L68 73"/>':''}</svg>`}
function render(){
 const oldStage=$('#main').dataset.step,oldTrack=$('.cards');if(oldTrack)carouselOffsets[oldStage]=oldTrack.scrollLeft;
 const changed=previous!==state.step,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let departing=null;
 if(changed&&!reduced&&state.step!==4&&$('#stage')){
  document.querySelectorAll('.departing-work').forEach(el=>el.remove());
  const source=$('#stage'),r=source.getBoundingClientRect();departing=source.cloneNode(true);
  departing.removeAttribute('id');departing.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  departing.classList.add('departing-work');departing.inert=true;departing.setAttribute('aria-hidden','true');
  Object.assign(departing.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:'2'});
  document.body.append(departing);
 }
 document.body.dataset.step=state.step;updateSceneTools(state.step);
 const main=$('#main');main.dataset.step=state.step;main.innerHTML=`<h1>${state.step===0?'從一張照片，開始創作':labels[state.step]}</h1><section class="stage" id="stage"></section>`;
 const stage=$('#stage');
 if(state.step===0)stage.innerHTML=`<div class="upload upload-history"><div class="dropzone" id="dropzone">${state.photo?`<img src="${state.photo}" alt="已選人物照片"><button class="secondary" id="upload">更換照片</button>`:'<h2>上傳人物照片</h2><p>拖曳照片，或選擇 JPG、PNG、WebP<br>最大 15 MB</p><button class="primary" id="upload">選擇照片</button>'}<p id="error" role="alert"></p></div><div class="history-panel"><div class="history-header"><h2>曾上傳的照片</h2><div class="thumbnail-control" role="group" aria-label="調整縮圖大小"><button type="button" class="thumbnail-icon small-grid" data-density-step="-1" aria-label="縮小縮圖" title="縮小縮圖"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></button><input class="thumbnail-slider" type="range" min="0" max="3" step="1" value="${5-state.historyColumns}" style="--slider-progress:${(5-state.historyColumns)/3*100}%" aria-label="縮圖大小" aria-valuetext="每排 ${state.historyColumns} 張"><button type="button" class="thumbnail-icon large-grid" data-density-step="1" aria-label="放大縮圖" title="放大縮圖"><i></i><i></i><i></i><i></i></button></div></div><div class="history-grid" style="--history-columns:${state.historyColumns}">${[...uploadedPhotos,...Array.from({length:6},(_,i)=>'assets/history-'+i+'.jpg')].map((src,i)=>`<button class="history-photo ${state.photo===src?'selected':''}" data-history="${i}" data-src="${src}" aria-label="選擇${i<uploadedPhotos.length?'已上傳':'範例'}照片 ${i+1}"><img src="${src}" alt="${i<uploadedPhotos.length?'已上傳':'範例'}人物照片"><span class="check">✓</span><span class="history-date">${uploadedDates.get(src)||'10 / 06 · 範例'}</span></button>`).join('')}</div></div></div>`;
 if(state.step===1)stage.innerHTML=`<div class="cards" aria-label="藝術風格，可左右拖曳">${styles.map((s,i)=>card(`<div class="art ${i===6?'geometric-airbrush-art':''}" style="${i===6?'background-image:url(assets/geometric-airbrush-v5.webp);background-size:contain;background-position:center;background-repeat:no-repeat':bgStyle(i)}" role="img" aria-label="${s[0]}示意"></div>`,...s,i,'style')).join('')}</div>`;
 if(state.step===2)stage.innerHTML=`<div class="cards" aria-label="情緒選項，可左右拖曳">${moods.map((s,i)=>card(`<div class="art mood-art" style="background-position:${i%4/3*100}% ${Math.floor(i/4)*100}%" role="img" aria-label="${s[0]}印泥表情印章"></div>`,...s,i,'mood')).join('')}</div>`;
 if(state.step===3)stage.innerHTML=`<div class="cards" aria-label="動作素描，可左右拖曳">${poses.map((s,i)=>card(`<div class="art pose-art" style="background-position:${i%4/3*100}% ${Math.floor(i/4)*100}%;background-size:400% 200%" role="img" aria-label="${s}素描"></div>`,s,'',i,'pose')).join('')}</div>`;
 if(state.step===4)stage.innerHTML=`<div class="text-selection"><div class="text-grid">${texts.map((s,i)=>`<button class="text-card ${state.text===i?'selected':''}" data-choice="text" data-value="${i}" aria-pressed="${state.text===i}">${s}</button>`).join('')}</div><div class="text-settings">${state.text===6?'<input id="custom" maxlength="16" aria-label="自訂文字" placeholder="輸入文字，最多 16 字" value="'+esc(state.custom)+'">':''}</div></div>`;
 if(state.step===5)stage.innerHTML=`<div class="result"><div class="hanging-art"><div class="display-cord"></div><i class="wood-clip clip-left"></i><i class="wood-clip clip-right"></i><div class="print"><canvas class="sticker-canvas" aria-label="卡通照與人物旁文字"></canvas></div></div><div class="result-info"><h2>卡通風格預覽</h2><p>${styles[state.style][0]}・${moods[state.mood][0]}・${poses[state.pose]}</p><p class="hint">此為風格示例；尚未套用你的照片、情緒、動作與文字。</p><div class="result-actions"><button class="primary" id="download">下載示例</button><button class="secondary" id="regenerate">重新載入示例</button></div><div class="result-links"><button data-return="1">調整設定</button><button id="restart">重新開始</button></div><p class="result-status" id="resultStatus" role="status"></p></div></div>`;
 if(state.step>=1&&state.step<=3)stage.insertAdjacentHTML('beforeend','<div class="arrows"><button id="prevCards" aria-label="上一組">‹</button><button id="nextCards" aria-label="下一組">›</button></div>');
 $('#steps').innerHTML=labels.map((label,i)=>`<button data-nav="${i}" ${i>state.completed?'disabled':''} class="${i===state.step?'active':''}" ${i===state.step?'aria-current="step"':''}><strong>${i<state.step?'✓':String(i+1).padStart(2,'0')}</strong><span>${label}</span></button>`).join('');
 $('#back').hidden=state.step===0||state.step===5;$('#next').hidden=state.step===5;$('#next').disabled=!enabled();$('#next').textContent=state.step===5?'重新開始':state.step===4?'查看示例':'下一步';
 renderBubbles();bind();bindDrag();if($('.sticker-canvas'))drawSticker($('.sticker-canvas')).catch(()=>{$('#resultStatus').textContent='示例圖片載入失敗，請按重新載入示例。'});if($('.cards'))$('.cards').scrollLeft=carouselOffsets[state.step]||0;
 if(changed&&!reduced){
  const opts={duration:620,easing:'cubic-bezier(.2,.7,.2,1)'};
  if(departing){const exit=departing.animate([{opacity:1,transform:'translateY(0) rotate(0)'},{opacity:0,transform:'translateY(28px) rotate(1.5deg) scale(.97)'}],{...opts,fill:'forwards'});exit.finished.then(()=>departing.remove()).catch(()=>departing.remove())}
  stage.animate([{opacity:0,transform:'translateY(-22px) rotate(-.8deg) scale(1.025)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],opts);
  stage.querySelectorAll('.card,.text-card').forEach((card,i)=>card.animate([{opacity:0,translate:'0 -14px'},{opacity:1,translate:'0 0'}],{duration:550,delay:i*28,easing:opts.easing,fill:'backwards'}));
 }
 previous=state.step;
}
function go(step){state.step=step;state.completed=Math.max(state.completed,step);render()}
function renderBubbles(){
 const box=$('#bubbles');box.hidden=state.step===0||state.step===5;
 const entries=[['style',1,'風格',state.style===null?'選擇風格':styles[state.style][0]],['mood',2,'情緒',state.mood===null?'選擇情緒':moods[state.mood][0]],['pose',3,'動作',state.pose===null?'選擇動作':poses[state.pose]],['text',4,'文字',state.text===null?'選擇文字':state.text===7?'不要文字':chosenText()||'自訂文字']];
 box.innerHTML=`<button class="bubble person" data-nav="0" aria-label="更換人物照片"><img src="${state.photo||'assets/sample.jpg'}" alt="已選人物"><strong>人物照片</strong></button>`+entries.map(([key,step,label,value])=>`<button class="bubble bubble-${key} ${state[key]!==null?'chosen':''}" data-nav="${step}" ${step>state.completed?'disabled':''} aria-label="調整${label}：${esc(value)}"><small>${label}</small><strong>${esc(value)}</strong></button>`).join('');
 startPhysics();
}
function bind(){
 const slider=document.querySelector('.thumbnail-slider');if(slider)slider.oninput=()=>{state.historyColumns=5-Number(slider.value);const grid=document.querySelector('.history-grid');grid.style.setProperty('--history-columns',state.historyColumns);slider.setAttribute('aria-valuetext','每排 '+state.historyColumns+' 張');slider.style.setProperty('--slider-progress',Number(slider.value)/3*100+'%');if(typeof sizePhotoLibrary==='function')sizePhotoLibrary()};
 document.querySelectorAll('[data-history-view]').forEach(el=>el.onclick=()=>{state.historyView=el.dataset.historyView;render()});
 if($('#restart'))$('#restart').onclick=()=>$('#next').onclick();
 if($('#regenerate'))$('#regenerate').onclick=async()=>{const button=$('#regenerate');button.disabled=true;try{await drawSticker($('.sticker-canvas'));$('#resultStatus').textContent='示例已載入；尚未套用你的照片與其他設定。'}catch{$('#resultStatus').textContent='載入失敗，請再試一次。'}finally{button.disabled=false}};
 document.querySelectorAll('[data-choice]').forEach(el=>{el.onclick=()=>{state[el.dataset.choice]=Number(el.dataset.value);render()};if(el.dataset.choice==='style')el.onpointerenter=()=>updateSceneTools(1,Number(el.dataset.value))});
 if(state.step===1&&$('.cards'))$('.cards').onpointerleave=()=>updateSceneTools(1,state.style??0);
 document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=()=>go(Number(el.dataset.nav)));
 document.querySelectorAll('[data-return]').forEach(el=>el.onclick=()=>go(Number(el.dataset.return)));
 if($('#upload'))$('#upload').onclick=()=>$('#file').click();
 document.querySelectorAll('[data-history]').forEach(el=>el.onclick=()=>{state.photo=el.dataset.src;render()});
 if($('#sample'))$('#sample').onclick=()=>{state.photo='assets/sample.jpg';render()};
 if($('#custom'))$('#custom').oninput=e=>{state.custom=e.target.value;$('#next').disabled=!enabled();const textBubble=$('.bubble-text strong');if(textBubble)textBubble.textContent=chosenText()||'自訂文字';if($('.sticker-canvas'))drawSticker($('.sticker-canvas'))};
 if($('#font')){$('#font').value=state.font;$('#font').onchange=e=>{state.font=e.target.value;drawSticker($('.sticker-canvas'))}}
 document.querySelectorAll('[data-placement]').forEach(el=>el.onclick=()=>{state.placement=el.dataset.placement;document.querySelectorAll('[data-placement]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',b===el)});drawSticker($('.sticker-canvas'))});
 if($('#download'))$('#download').onclick=download;
 if($('#dropzone')){const zone=$('#dropzone');zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();loadPhoto(e.dataTransfer.files[0])}}
}
async function loadPhoto(file){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){$('#error').textContent='請選擇 15 MB 以內的 JPG、PNG 或 WebP';return}photoUrl=URL.createObjectURL(file);const candidate=photoUrl,im=new Image();try{im.src=candidate;await im.decode()}catch{URL.revokeObjectURL(candidate);$('#error').textContent='無法讀取這張圖片，請選擇其他檔案。';return}uploadedPhotos.unshift(photoUrl);uploadedDates.set(photoUrl,new Intl.DateTimeFormat('zh-TW',{month:'2-digit',day:'2-digit'}).format(new Date()));state.photo=photoUrl;render()}
$('#file').onchange=e=>loadPhoto(e.target.files[0]);
$('#back').onclick=()=>go(Math.max(0,state.step-1));
$('#next').onclick=()=>{if(!enabled())return;if(state.step===5){photoUrl=null;Object.keys(carouselOffsets).forEach(key=>delete carouselOffsets[key]);Object.assign(state,{step:0,completed:0,photo:null,style:null,mood:null,pose:null,text:null,custom:''});render()}else go(state.step+1)};
function bindDrag(){const track=$('.cards');if(!track)return;let down=false,moved=false,x=0,scroll=0;
 track.onpointerdown=e=>{if(e.pointerType==='touch'||e.button!==0)return;down=true;moved=false;x=e.clientX;scroll=track.scrollLeft};
 track.onpointermove=e=>{if(!down)return;const dx=e.clientX-x;if(Math.abs(dx)>5){if(!moved)track.setPointerCapture(e.pointerId);moved=true;track.classList.add('dragging');track.scrollLeft=scroll-dx;e.preventDefault()}};
 const end=e=>{down=false;track.classList.remove('dragging');if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);setTimeout(()=>moved=false,0)};track.onpointerup=end;track.onpointercancel=end;
 track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);track.ondragstart=e=>e.preventDefault();
 $('#prevCards').onclick=()=>track.scrollBy({left:-track.clientWidth*.6,behavior:'smooth'});$('#nextCards').onclick=()=>track.scrollBy({left:track.clientWidth*.6,behavior:'smooth'});
}
function startPhysics(){cancelAnimationFrame(physics);const box=$('#bubbles');if(box.hidden||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const bodies=[...box.children].map(el=>({el,x:0,y:0,vx:0,vy:0,ax:el.offsetLeft+el.offsetWidth/2,ay:el.offsetTop+el.offsetHeight/2}));let pointer=null,last=0;
 box.onpointermove=e=>{if(e.pointerType==='touch')return;const r=box.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top}};box.onpointerleave=()=>pointer=null;
 function frame(time){if(!bodies[0].el.isConnected)return;const dt=last?Math.min((time-last)/1000,.025):.016;last=time;
 for(const b of bodies){let tx=0,ty=0;if(pointer){const dx=pointer.x-b.ax,dy=pointer.y-b.ay,d=Math.hypot(dx,dy),reach=95;if(d<reach&&d>.01){const pull=Math.min(b.el.classList.contains('person')?3:7,d*.14)*(1-d/reach);tx=dx/d*pull;ty=dy/d*pull}}b.vx+=((tx-b.x)*65-b.vx*10)*dt;b.vy+=((ty-b.y)*65-b.vy*10)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.el.style.transform=`translate3d(${b.x}px,${b.y}px,0)`}physics=requestAnimationFrame(frame)}physics=requestAnimationFrame(frame);
}
async function drawSticker(canvas){
 if(!canvas)return;
 const image=new Image();
 await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('示例圖片載入失敗，請重新載入'));image.src=state.style===6?'assets/geometric-airbrush-v5.webp':'assets/finished-cartoon-v4.webp'});
 canvas.width=image.width;canvas.height=image.height;
 canvas.getContext('2d').drawImage(image,0,0);canvas.dataset.ready='true';
}

async function download(){
 const canvas=document.createElement('canvas');try{await drawSticker(canvas)}catch{$('#resultStatus').textContent='下載準備失敗，請重新載入示例後再試。';return}
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cartoon-demo.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)},'image/png');
}
const themes=[['深藍','#004896','#2769ad','#dce8f5'],['橄欖','#546342','#73825e','#e1e7d9'],['陶土','#805447','#a37464','#efe0d8'],['莓紫','#6b526c','#8a6d8c','#e9dfea']];
$('#themes').innerHTML=themes.map((t,i)=>`<button data-theme="${i}" title="${t[0]}" aria-label="${t[0]}" style="background:${t[1]}"></button>`).join('');
document.querySelectorAll('[data-theme]').forEach(el=>el.onclick=()=>{const t=themes[Number(el.dataset.theme)];['--accent','--light','--soft'].forEach((key,i)=>document.documentElement.style.setProperty(key,t[i+1]))});
render();

function updateSceneTools(step,styleHint){
 const layer=$('.desk-tools');if(!layer)return;layer.hidden=step===0||step===5;if(step===0||step===5)return;
 const media=styleHint??state.style??0,key=step===1?'media-'+media:'step-'+step;
 if(layer.dataset.key===key)return;layer.dataset.key=key;layer.dataset.step=step;
 layer.querySelectorAll('.tool-set.outgoing').forEach(el=>el.remove());const old=layer.querySelector('.tool-set');if(old)old.classList.add('outgoing');layer.querySelector('img')?.remove();
 const next=document.createElement('div');next.className='tool-set';
 let asset='single-pencil-v1.webp',position='center',size='contain';
 if(step===1){asset='style-media-v1.webp';position=([2.17,50,97.83][media%3])+'% '+([4.17,95.83][Math.floor(media/3)])+'%';size='330% 220%'}
 if(step===1&&media===6){asset='airbrush-tool-v1.webp';position='center';size='contain'}
 if(step===2)asset='round-craft-stamp-v2.webp';
 if(step===3)asset='pencil-eraser-v1.webp';
 if(step===4||step===5){asset='step-tools-v1.webp';position=(step%3/2*100)+'% '+(Math.floor(step/3)*100)+'%';size='300% 200%'}
 next.style.backgroundImage='url("assets/'+asset+'")';next.style.backgroundPosition=position;next.style.backgroundSize=size;layer.append(next);
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){old?.remove();return}
 if(old){const leave=old.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:220,fill:'forwards',easing:'ease-in'});leave.finished.then(()=>old.remove()).catch(()=>old.remove())}
 next.animate([{opacity:0,transform:'translateY(-16px) rotate(-1deg) scale(1.025)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],{duration:550,delay:old?100:0,fill:'backwards',easing:'cubic-bezier(.2,.7,.2,1)'});
}

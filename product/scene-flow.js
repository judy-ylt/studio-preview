/* Scene planning prototype. Background choices are real state; drawings are layout studies, not AI output. */
const scenePlan={mode:'replace',scene:0};
let sceneScope=null,sceneReturn=4,scenePreviewId=1;
function resetScenePlan(){Object.assign(scenePlan,{mode:'replace',scene:0});sceneScope=null;scenePreviewId=1;Object.assign(state,{sceneCategory:'全部',description:''})}
function shotBackground(s){return s.white&&s.typeName==='主圖'?{mode:'white',scene:0}:s.background||scenePlan}
function backgroundLabel(s){const b=shotBackground(s);return b.mode==='retain'?'保留原背景':b.mode==='white'?'純白背景':sceneLibrary[b.scene].name}
function retainReason(s){
 if(['尺寸感','使用情境','包裝合照'].includes(s.typeName))return '這張需要重新安排情境';
 if(s.angle!=='front')return '原照無法直接變更拍攝角度';
 return '';
}
function sceneConflicts(){return seriesShots.filter(s=>shotBackground(s).mode==='retain'&&retainReason(s))}
function sceneArrangement(s){
 const b=shotBackground(s);if(b.mode==='retain'&&retainReason(s))return retainReason(s);if(b.mode==='retain')return s.kind==='detail'?'沿用原照，裁切指定細節':'沿用這張參考照的背景';
 if(s.kind==='detail')return '延續光線與色調，近拍'+(s.focus==='其他'?s.focusText:s.focus||'商品細節');
 if(s.typeName==='尺寸感')return s.hold==='旁邊放日常物品'?'搭配日常物品，呈現大小':(s.hold||'單手拿著')+'，呈現大小';
 if(s.typeName==='使用情境')return '依用途安排：'+(s.product?.usage==='其他'?s.product.usageText:s.product?.usage||'使用中的商品');
 if(s.typeName==='包裝合照')return '同風格安排商品與外盒';
 if(b.mode==='white')return '純白背景展示商品';
 return s.angle==='top'?'同風格桌面，俯視平拍':'同風格展示商品';
}
function useShotBackground(s){const b=shotBackground(s);state.scene=b.scene??scenePlan.scene;state.direction=b.mode==='retain'?'retain':'replace'}
function openShotScene(id,back=4){sceneScope=id;scenePreviewId=id;activeShotId=id;sceneReturn=back;wizardGo(3)}
function chooseBackground(mode,id=scenePlan.scene){const b={mode,scene:id};if(sceneScope){const s=seriesShots.find(s=>s.id===sceneScope);if(s)s.background=b}else Object.assign(scenePlan,b);render()}
function sceneConflictHTML(bad=sceneConflicts()){return bad.length?`<div class="scene-conflicts" role="status"><strong>有 ${bad.length} 張需要調整背景或拍攝需求</strong>${bad.map(s=>`<div><span>${shotName(s)}：${retainReason(s)}</span><button class="text-btn" data-resolve-scene="${s.id}">這張改用新場景</button><button class="text-btn" data-resolve-brief="${s.id}">修改拍攝需求</button></div>`).join('')}</div>`:''}
function bindSceneResolutions(){document.querySelectorAll('[data-resolve-scene]').forEach(b=>b.onclick=()=>openShotScene(Number(b.dataset.resolveScene),3));document.querySelectorAll('[data-resolve-brief]').forEach(b=>b.onclick=()=>{activeShotId=Number(b.dataset.resolveBrief);sceneScope=null;wizardGo(1)})}
function renderScenePicker(){
 const target=seriesShots.find(s=>s.id===sceneScope),sample=target||seriesShots.find(s=>s.id===scenePreviewId)||seriesShots[0],choice=target?shotBackground(target):scenePlan;
 $('h1').textContent=target?'替'+shotName(target)+'選背景':'選擇這組照片的背景';
 $('#stage').innerHTML=`${sceneConflictHTML(target?sceneConflicts().filter(s=>s.id===target.id):sceneConflicts())}<div class="scene-picker-layout needs-scene-layout"><section class="scene-library"><div class="scene-scope"><span>${target?'只套用這張':'整組預設・各張依需求安排'}</span>${target?'<button id="inheritScene" class="text-btn">沿用整組設定</button>':''}</div><div class="scene-library-head"><div class="scene-tabs" role="group" aria-label="場景分類">${['全部','簡約','材質','自然','創意'].map(n=>`<button data-plan-category="${n}" class="${state.sceneCategory===n?'active':''}" aria-pressed="${state.sceneCategory===n}">${n}</button>`).join('')}</div></div><div class="scene-grid"><button class="scene-card original-scene ${choice.mode==='retain'?'selected':''}" data-background-mode="retain" aria-pressed="${choice.mode==='retain'}">${photoVisual(sample.source)}<span>保留原背景</span></button>${sceneLibrary.filter(s=>state.sceneCategory==='全部'||s.category===state.sceneCategory).map(s=>`<button class="scene-card ${choice.mode==='replace'&&choice.scene===s.id?'selected':''}" data-plan-scene="${s.id}" aria-pressed="${choice.mode==='replace'&&choice.scene===s.id}">${sceneVisual(s.id)}<span>${s.name}</span></button>`).join('')}</div></section><aside class="scene-settings needs-preview"><h2>${target?'這張的安排':'各張佈置'}</h2>${!target?`<div class="plan-shot-tabs" role="group" aria-label="查看各張佈置">${seriesShots.map(s=>`<button data-plan-preview="${s.id}" aria-pressed="${sample.id===s.id}" class="${sample.id===s.id?'selected':''}">${shotName(s)}</button>`).join('')}</div>`:''}<canvas id="needsScenePreview" aria-label="${shotName(sample)}佈置示意"></canvas><div class="plan-preview-caption"><strong>${backgroundLabel(sample)}</strong><span>佈置示意</span></div><p class="plan-arrangement">${esc(sceneArrangement(sample))}</p>${shotBackground(sample).mode==='white'?'<span class="plan-individual">依拍攝需求指定純白背景</span>':sample.background&&!target?'<span class="plan-individual">這張已個別設定</span>':''}${!target&&seriesShots.some(s=>s.background)?'<button id="resetSceneOverrides" class="text-btn">全部改用整組設定</button>':''}<details class="extra-requirements" ${state.description?'open':''}><summary>其他需求（選填）</summary><div class="field"><label class="sr-only" for="planDescription">其他拍攝需求</label><textarea id="planDescription" maxlength="300" placeholder="例如：不要植物">${esc(state.description)}</textarea></div></details></aside></div>`;
 document.querySelectorAll('[data-plan-scene]').forEach(b=>b.onclick=()=>chooseBackground('replace',Number(b.dataset.planScene)));
 $('[data-background-mode]') .onclick=()=>chooseBackground('retain');
 document.querySelectorAll('[data-plan-category]').forEach(b=>b.onclick=()=>{state.sceneCategory=b.dataset.planCategory;render()});
 document.querySelectorAll('[data-plan-preview]').forEach(b=>b.onclick=()=>{scenePreviewId=Number(b.dataset.planPreview);render()});
 if(target&&choice.mode==='white'){document.querySelectorAll('[data-plan-scene],[data-background-mode]').forEach(b=>b.disabled=true);$('.scene-scope').insertAdjacentHTML('beforeend','<span>主圖已指定純白背景，請到拍攝需求修改</span>')}
 if($('#inheritScene'))$('#inheritScene').onclick=()=>{delete target.background;render()};
 if($('#resetSceneOverrides'))$('#resetSceneOverrides').onclick=()=>{seriesShots.forEach(s=>delete s.background);render()};
 $('#planDescription').oninput=e=>state.description=e.target.value;
 bindSceneResolutions();activeShotId=sample.id;applySeriesShot();drawNeedsPreview($('#needsScenePreview'),sample);
 $('#next').textContent=target?'套用這張':'安排構圖';
 const relevant=target?sceneConflicts().filter(s=>s.id===target.id):sceneConflicts();$('#next').disabled=!!relevant.length;
 $('#next').onclick=()=>{if(relevant.length)return;const back=target?sceneReturn:4;sceneScope=null;wizardGo(back)};
 if(target)$('#back').onclick=()=>{const back=sceneReturn;sceneScope=null;wizardGo(back)};
}
function decorateComposition(){const s=seriesShot(),b=shotBackground(s),panel=$('.control-panel');$('.composition-summary')?.remove();panel.insertAdjacentHTML('beforeend',`<div class="shot-background-summary"><strong>${backgroundLabel(s)}</strong><p>${esc(sceneArrangement(s))}</p><button class="text-btn" id="changeShotScene" ${b.mode==='white'?'disabled':''}>${b.mode==='white'?'由拍攝需求指定':'這張換背景'}</button>${s.background?'<button class="text-btn" id="restoreGroupScene">沿用整組設定</button>':''}</div>`);$('#changeShotScene').onclick=()=>openShotScene(s.id);if($('#restoreGroupScene'))$('#restoreGroupScene').onclick=()=>{delete s.background;render()};
 if(s.kind==='detail'){$('.composition-layout').dataset.detail='true';$('#preview').setAttribute('aria-label','特寫範圍參考，待生成')}
 if(b.mode==='retain'){panel.querySelector('h3:nth-child(2)').textContent='照片位置';document.querySelector('[aria-label="商品大小"]').setAttribute('aria-label','照片大小');panel.querySelectorAll('.range-label')[2].firstChild.textContent='照片大小';}
 if(sceneConflicts().some(x=>x.id===s.id)){$('#stage').insertAdjacentHTML('afterbegin',sceneConflictHTML());bindSceneResolutions()}
}
/* Schematic arrangements deliberately avoid passing the pedestal off as a hand/usage result. */
async function drawNeedsPreview(canvas,s){
 if(!canvas)return;const b=shotBackground(s);if(b.mode==='retain'){if(s.kind==='detail')return paintDetailReference(canvas,s);return draw(canvas)}
 if(s.kind==='detail')return paintDetailReference(canvas,s);
 if(!['尺寸感','使用情境','包裝合照'].includes(s.typeName)&&b.mode!=='white')return draw(canvas);
 const [a,d]=state.ratio.split(':').map(Number);canvas.width=Math.round(1600*a/Math.max(a,d));canvas.height=Math.round(1600*d/Math.max(a,d));const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.fillStyle=b.mode==='white'?'#fff':'#eee9df';c.fillRect(0,0,w,h);
 if(b.mode!=='white'){try{const im=await scenePlate(),r=sceneRect(b.scene,im.width,im.height,state.angle);if(!canvas.isConnected)return;c.save();c.filter='blur(18px)';c.drawImage(im,r.x,r.y,r.w,r.h*.36,-30,-30,w+60,h+60);c.restore()}catch{}}
 const p=placement(w,h);
 c.save();c.fillStyle='#b4aea3';c.strokeStyle='#777b76';c.lineWidth=w*.004;
 if(s.typeName==='包裝合照'){c.fillStyle='#e0dacd';c.fillRect(p.x+p.w*.7,p.y-p.h*.2,p.w*.8,p.h*1.2);c.strokeRect(p.x+p.w*.7,p.y-p.h*.2,p.w*.8,p.h*1.2)}
 if(['尺寸感','使用情境'].includes(s.typeName)){
  if(s.hold==='旁邊放日常物品'){c.fillStyle='#f7f5ef';c.fillRect(p.x+p.w*1.4,p.y+p.h*.15,p.w*.55,p.h*.85);c.strokeRect(p.x+p.w*1.4,p.y+p.h*.15,p.w*.55,p.h*.85)}
  else{
   c.fillStyle='#d2bca8';c.strokeStyle='#ad927c';c.lineWidth=w*.003;
   // Palm and wrist, with four separate fingers behind the product.
   c.beginPath();c.roundRect(p.x-p.w*.22,p.y+p.h*.47,p.w*1.35,p.h*.62,p.w*.35);c.fill();c.stroke();
   for(let i=0;i<4;i++){c.beginPath();c.roundRect(p.x-p.w*.2+i*p.w*.29,p.y+p.h*(.18+Math.abs(i-1.5)*.06),p.w*.27,p.h*.65,p.w*.13);c.fill();c.stroke()}
   c.beginPath();c.moveTo(p.x+p.w*.06,p.y+p.h);c.lineTo(p.x-p.w*.05,h);c.lineTo(p.x+p.w*1.12,h);c.lineTo(p.x+p.w*.92,p.y+p.h);c.closePath();c.fill();
  }
 }
 drawProductProxy(c,p);
 if(s.typeName==='尺寸感'){const x=Math.max(w*.06,p.x-p.w*.65);c.strokeStyle='#52635d';c.fillStyle='#344c57';c.lineWidth=w*.003;c.beginPath();c.moveTo(x,p.y);c.lineTo(x,p.y+p.h);c.moveTo(x-w*.015,p.y);c.lineTo(x+w*.015,p.y);c.moveTo(x-w*.015,p.y+p.h);c.lineTo(x+w*.015,p.y+p.h);c.stroke();c.font=Math.round(w*.033)+'px sans-serif';c.textAlign='center';c.fillText((s.product?.h||'')+' cm',x,p.y-h*.025)}
 c.restore();canvas.dataset.ready='true';syncCompositionTarget();
}
const sceneBaseDraw=draw;
draw=async function(canvas=$('#preview')){const s=seriesShots?.find(s=>s.id===activeShotId);if(!s)return sceneBaseDraw(canvas);const b=shotBackground(s);if(s.kind==='detail'||(b.mode!=='retain'&&(b.mode==='white'||['尺寸感','使用情境','包裝合照'].includes(s.typeName))))return drawNeedsPreview(canvas,s);return sceneBaseDraw(canvas)};

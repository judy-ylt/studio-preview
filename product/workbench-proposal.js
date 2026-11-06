/* Independent interaction study: no AI requests, payments or uploads to a server. */
(()=>{
const $=s=>document.querySelector(s);
/* Cutout study: samples use pre-made transparent images; a real build would create these once per upload. */
const cutouts={"sample-main":{"src":"assets/cutouts/main.webp","box":[0.3692,0.0821,0.2584,0.7855]},"sample-library-0":{"src":"assets/cutouts/library-0.webp","box":[0.3962,0.1363,0.2238,0.71]},"sample-library-1":{"src":"assets/cutouts/library-1.webp","box":[0.3825,0.1325,0.2275,0.7188]},"sample-library-2":{"src":"assets/cutouts/library-2.webp","box":[0.4138,0.14,0.1938,0.7037]},"sample-library-3":{"src":"assets/cutouts/library-3.webp","box":[0.4062,0.1263,0.2288,0.7275]},"sample-library-4":{"src":"assets/cutouts/library-4.webp","box":[0.3375,0.4025,0.4088,0.355]},"sample-library-5":{"src":"assets/cutouts/library-5.webp","box":[0.3488,0.16,0.2787,0.6425]},"sample-library-6":{"src":"assets/cutouts/library-6.webp","box":[0.32,0.3262,0.5725,0.4675]},"sample-library-7":{"src":"assets/cutouts/library-7.webp","box":[0.2238,0.2375,0.5913,0.5537]}};
const sceneGrounds={"front":[0.814,0.814,0.773,0.814,0.814,0.766,0.762,0.74,0.762,0.766,0.793,0.797,0.797,0.793,0.758,0.64,0.699,0.684,0.695,0.68],"three":[0.807,0.8,0.792,0.804,0.8,0.776,0.773,0.769,0.769,0.766,0.793,0.785,0.797,0.789,0.781,0.64,0.739,0.684,0.725,0.721],"low":[0.823,0.823,0.706,0.823,0.819,0.788,0.754,0.742,0.78,0.757,0.8,0.804,0.777,0.747,0.762,0.64,0.721,0.629,0.691,0.64]};
const exampleSheets={front:'scenes-front-v1',three:'scene-library-v1',top:'scenes-top-v1',low:'scenes-low-v1'};
const detailFocus={'瓶蓋':.2,'標籤':.66,'質地':.88,'其他':.5};
const backgrounds=[{id:'original',name:'保留原背景',color:'#eeeae0'},{id:'white',name:'純白背景',color:'#fff',scene:0,anchor:.9},{id:'sand',name:'暖沙紙景',color:'#e8dbc4',scene:1,anchor:.91},{id:'stone',name:'洞石層次',color:'#d7dbd8',scene:6,anchor:.79},{id:'sage',name:'植感綠意',color:'#d6dfcc',scene:11,anchor:.9},{id:'dark',name:'深色聚光',color:'#343b38',scene:2,anchor:.77},{id:'linen',name:'木桌亞麻',color:'#ded1ba',scene:5,anchor:.91},{id:'marble',name:'白色大理石',color:'#eee',scene:7,anchor:.82},{id:'rose',name:'玫瑰弧面',color:'#d9a7a0',scene:4,anchor:.9}];
function sceneCell(i,w=1402,h=1122,angle='front'){const xs=[0,280,561,841,1122,1402],ys={front:[0,272,545,810,1122],three:[0,273,545,814,1122],top:[0,274,552,815,1122],low:[0,273,545,814,1122]}[angle]||[0,272,545,810,1122],col=i%5,row=Math.floor(i/5),size=Math.min(xs[col+1]-xs[col],ys[row+1]-ys[row])-8;return{x:(xs[col]+(xs[col+1]-xs[col]-size)/2)*w/1402,y:(ys[row]+(ys[row+1]-ys[row]-size)/2)*h/1122,w:size*w/1402,h:size*h/1122}}
function swatch(b){if(b.id==='original'){const src=shots.length?shotRef(current())?.src||source:source;return src?`background-image:url('${src}')`:'';}if(b.plate)return `background-image:url('assets/natural-${b.plate}-${shots.length?current().angle:'front'}-v1.webp');background-size:cover;background-position:center`;const angle=shots.length?current().angle:'front',r=sceneCell(b.scene,1402,1122,angle);return `background-image:url('assets/scene-plates-${angle==='three'?'v1':angle+'-v1'}.png');background-size:${1402/r.w*100}% ${1122/r.h*100}%;background-position:${r.x/(1402-r.w)*100}% ${r.y/(1122-r.h)*100}%`}

let started=false,shootNotes='',backgroundCategory='全部',pendingReferenceShot=null,replacingMain=false;
let generationRun=0,lastResults=[],detailIndex=0;
let source=null,mode=null,active='front',groupBackground='sand',ratio='1:1',tab='brief',shots=[],imageCache=new Map(),objectURLs=[],renderId=0,toastTimer;
const current=()=>shots.find(s=>s.id===active);
const bgOf=s=>s.type==='front'&&s.white?'white':s.background||groupBackground;
const ratioOf=s=>bgOf(s)==='original'?'原照尺寸':ratio;
const bgName=s=>backgrounds.find(b=>b.id===bgOf(s)).name;
const chosen=()=>shots.filter(s=>s.included);
const toast=t=>{$('#status').textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#status').textContent='',3200)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function image(src){if(!imageCache.has(src))imageCache.set(src,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src}));return imageCache.get(src)}
function fresh(id,name){return{id,type:id,name,included:['front','three','detail','lifestyle'].includes(id),background:null,reference:null,referenceId:null,x:50,y:50,scale:90,angle:['three','pack','lifestyle'].includes(id)?'three':id==='top'?'top':'front',side:'left',focus:'',focusOther:'',hold:'單手拿著',people:'只出現手',keepText:true,white:false}}
const product={name:'',category:'',description:'',h:'',w:'',usage:'',usageOther:''};
const types=[['front','主圖'],['three','斜側'],['back','背面'],['side','側面'],['top','俯視平拍'],['detail','局部特寫'],['pack','包裝合照'],['lifestyle','使用情境'],['size','尺寸感']];
const usages={'保養品':['塗在手背','擦在臉上','按壓或滴出'],'食品飲料':['拿在手上','倒進杯盤','正在享用'],'3C 電子':['握在手上操作','戴在身上','放在桌上使用'],'居家用品':['擺在空間裡','正在使用'],'服飾配件':['穿戴在身上','拿在手上'],'其他':['拿在手上']};
let shotSeq=0;
const options=(list,value)=>list.map(v=>`<option value="${esc(Array.isArray(v)?v[0]:v)}" ${value===(Array.isArray(v)?v[0]:v)?'selected':''}>${esc(Array.isArray(v)?v[1]:v)}</option>`).join('');

const allSceneNames=['柔白無縫','暖沙紙景','深色聚光','灰階幾何','玫瑰弧面','木桌亞麻','洞石層次','白色大理石','深灰岩面','清水模展台','窗影留白','植感綠意','柔緞布景','霧透壓克力','鏡面金屬','懸浮展台','紙藝拱門','水波映光','緞帶慶典','動感斜線'];
const allSceneGroups=['簡約','簡約','簡約','簡約','簡約','材質','材質','材質','材質','材質','自然','自然','材質','材質','材質','創意','創意','自然','創意','創意'];
allSceneNames.forEach((name,i)=>{const found=backgrounds.find(b=>b.scene===i);if(found)found.category=allSceneGroups[i];else backgrounds.push({id:'scene-'+i,name,scene:i,color:'#eee9df',anchor:.88,category:allSceneGroups[i]})});
backgrounds.push({id:'forest',name:'森林苔石',category:'自然',plate:'forest',color:'#d9dfd3',anchor:.83},{id:'flowers',name:'花叢花園',category:'自然',plate:'flowers',color:'#eae0de',anchor:.81});
const references=new WorkbenchReferences({message:toast,change:()=>{if(started)render()},pick:r=>{if(!started){start(r.src,false,r.name,r);return}if(pendingReferenceShot){const target=shots.find(s=>s.id===pendingReferenceShot);if(target)target.referenceId=r.id;pendingReferenceShot=null}else if(requiredSide(current())===r.side)current().referenceId=r.id;render()}});
const requiredSide=s=>({back:'背面',side:'側面',pack:'包裝'}[s?.type]);
function shotRef(s){const refs=references.refs(),need=requiredSide(s),explicit=refs.find(r=>r.id===s.referenceId);if(explicit)return !need||explicit.side===need?explicit:null;const side=need||(s.angle==='three'?'側面':'正面');return refs.find(r=>r.side===side)||(need?null:refs.find(r=>r.side==='正面')||refs[0])}
function actualReference(s){const r=shotRef(s);return r&&(r.id!=='sample-main'||r.box.edited)?r.src:null}
function conflicts(s){if(bgOf(s)!=='original')return [];if(['size','lifestyle','pack'].includes(s.type))return ['這張需要新情境，請換背景或拍攝類型'];if(s.angle!=='front')return ['原背景不能直接變更角度，請換背景或改正面'];return []}
function allIssues(s){return [...missingBrief(s),...conflicts(s)]}
function selectedIssues(){return chosen().flatMap(s=>allIssues(s).map(text=>({id:s.id,name:s.name,text})))}
function requestReference(){const target=current()?.id||null;pendingReferenceShot=null;references.openPicker({onUpload:()=>pendingReferenceShot=target,select:r=>{const shot=shots.find(s=>s.id===target);if(references.selected.includes(r.id)){if(shot)shot.referenceId=r.id;render()}else{pendingReferenceShot=target;if(!references.choose(r.id))pendingReferenceShot=null}}})}
function pickMain(replace=false){replacingMain=replace;references.openPicker({input:'#photoFile',select:r=>{if(replace&&started){const oldId=references.selected[0];references.selected=references.selected.filter(id=>id!==r.id);references.selected[0]=r.id;shots.forEach(s=>{if(s.referenceId===oldId)s.referenceId=r.id});pendingReferenceShot=null;render();toast('已更換商品照片，拍攝設定保留')}else start(r.src,false,r.name,r);replacingMain=false}})}
function renderProposal(){
 $('#proposalBadge').textContent=mode==='sample'?'範例資料':'自行填寫';$('#productSummary').textContent=product.description||'可選填已確認的商品特色。';const nameInput=$('#inlineProductName');if(nameInput&&document.activeElement!==nameInput)nameInput.value=product.name;
 $('#previewState').textContent=bgOf(current())==='original'?'原照預覽':status(current());
 $('#previewNote').textContent='';
}

function briefRows(s){const rows=[['拍攝類型',s.name],['角度',{front:'正面',three:'斜側',top:'俯拍',low:'低角度'}[s.angle]]];if(s.angle==='three')rows.push(['朝向',s.side==='left'?'朝左':'朝右']);if(s.type==='back')rows.push(['保留標籤',s.keepText?'開啟':'關閉']);if(s.type==='detail')rows.push(['特寫重點',(s.focus==='其他'?s.focusOther:s.focus)||'待補充']);if(s.type==='size'){rows.push(['高度',product.h?product.h+' 公分':'待補充']);if(product.w)rows.push(['寬度',product.w+' 公分']);rows.push(['呈現',s.hold])}if(s.type==='lifestyle')rows.push(['商品類別',product.category||'待確認'],['用法',product.usage==='其他'?product.usageOther:product.usage||'待選擇'],['人物',s.people]);const ref=shotRef(s);rows.push(['商品照片',ref?ref.side:'待補充']);return rows}
function missingBrief(s){const m=[],ref=shotRef(s),need=requiredSide(s);if(!ref)m.push((need?(need==='包裝'?'外盒':need):'商品')+'照片');else if(need&&ref.side!==need)m.push((need==='包裝'?'外盒':need)+'照片');if(s.type==='size'){if(!Number.isFinite(Number(product.h))||!(Number(product.h)>0))m.push('商品高度');if(product.w&&(!Number.isFinite(Number(product.w))||!(Number(product.w)>0)))m.push('有效寬度')}if(s.type==='detail'&&(!s.focus||s.focus==='其他'&&!s.focusOther.trim()))m.push('特寫重點');if(s.type==='lifestyle'){if(!product.category)m.push('商品類別');if(!product.usage||(product.usage==='其他'&&!product.usageOther.trim()))m.push('使用方式')}return m}
function refreshNeeds(){
 for(const s of shots){const b=document.querySelector(`[data-fix-needs="${s.id}"]`);if(!b)continue;const missing=missingBrief(s),conflict=conflicts(s);b.textContent=missing.length?'待補：'+missing.join('、'):conflict.length?'待調整：背景與需求衝突':'';b.hidden=!b.textContent;b.setAttribute('aria-label',s.name+'，'+b.textContent+'，前往修正')}
 const s=current();if(!s)return;
 for(const el of document.querySelectorAll('#shotBrief [aria-required="true"],#shotBrief [data-product="w"]')){
  let invalid=!el.value.trim();if(el.dataset.product==='h'||el.dataset.product==='w')invalid=el.value!==''?!(Number.isFinite(Number(el.value))&&Number(el.value)>0):el.dataset.product==='h';
  if(el.id==='shotReference'){const ref=shotRef(s),need=requiredSide(s);invalid=!ref||!!(need&&ref.side!==need)}
  el.setAttribute('aria-invalid',String(invalid));
 }
}
function briefSpecs(s){return '<dl class="proposal-specs">'+briefRows(s).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v||'待補充')}</dd></div>`).join('')+'</dl>'}
function renderBrief(){
 const s=current();let html=`<label>拍攝類型<select data-brief="type">${options(types,s.type)}</select></label><label>拍攝角度<select data-brief="angle">${options([['front','正面'],['three','斜側'],['top','俯拍'],['low','低角度']],s.angle)}</select></label>`;
 if(s.angle==='three')html+=`<label>朝向<select data-brief="side">${options([['left','朝左'],['right','朝右']],s.side)}</select></label>`;
 
 if(s.type==='back')html+=`<label class="toggle-field"><input type="checkbox" data-brief="keepText" ${s.keepText?'checked':''}>保留原標籤文字</label>`;

 if(s.type==='detail')html+=`<label>特寫重點<span class="required-mark">必填</span><select required aria-required="true" data-brief="focus"><option value="">請選擇</option>${options(['瓶蓋','標籤','質地','其他'],s.focus)}</select></label>${s.focus==='其他'?`<label>想拍哪個細節？<span class="required-mark">必填</span><input required aria-required="true" data-brief="focusOther" value="${esc(s.focusOther)}" maxlength="80"></label>`:''}`;
 if(s.type==='size')html+=`<div class="dimension-fields"><label>商品高度（公分）<span class="required-mark">必填</span><input required aria-required="true" type="number" min="0.1" max="10000" step="any" data-product="h" value="${esc(product.h)}" placeholder="請填實際高度"></label><label>寬度（選填）<input type="number" min="0.1" max="10000" step="any" data-product="w" value="${esc(product.w)}" placeholder="公分"></label></div><label>呈現方式<select data-brief="hold">${options(['單手拿著','放在掌心','旁邊放日常物品'],s.hold)}</select></label>`;
 if(s.type==='lifestyle')html+=`<label>商品類別<span class="required-mark">必填</span><select required aria-required="true" data-product="category"><option value="">請選擇</option>${options(Object.keys(usages),product.category)}</select></label><label>使用方式<span class="required-mark">必填</span><select required aria-required="true" data-product="usage"><option value="">請選擇</option>${options([...(usages[product.category]||[]),'其他'],product.usage)}</select></label>${product.usage==='其他'?`<label>使用方式補充<span class="required-mark">必填</span><input required aria-required="true" data-product="usageOther" value="${esc(product.usageOther)}" maxlength="100"></label>`:''}<label>出現的人<select data-brief="people">${options(['只出現手','不露臉','露臉'],s.people)}</select></label>`;

 const r=shotRef(s),need=requiredSide(s),refLabel=need?(need==='包裝'?'外盒':need)+'照片':'商品照片';html+=`<div class="brief-reference"><h3>${refLabel}<span class="required-mark">必填</span></h3>${r?`<img src="${esc(r.src)}" alt="這張的商品照片">`:''}<label>使用哪張<select id="shotReference" aria-required="true"><option value="">依面向自動選擇</option>${options(references.refs().map(r=>[r.id,r.side+'・'+r.name]),s.referenceId)}</select></label><div class="reference-actions"><button id="briefEditReference" class="text-button" ${r?'':'disabled'}>框選商品</button><button id="briefSupplement" class="text-button">＋ 加入${refLabel}</button></div></div>`;
 html+=`<p class="brief-validation" role="status">${missingBrief(s).length?'待補：'+missingBrief(s).map(esc).join('、'):conflicts(s).map(esc).join('；')}</p>`;if(conflicts(s).length)html+='<button id="resolveBackground" class="secondary full">這張改用新背景</button>';$('#shotBrief').innerHTML=html;
 $('#shotReference').onchange=e=>{s.referenceId=e.target.value||null;render()};$('#briefEditReference').onclick=()=>references.open(shotRef(s).id);if($('#resolveBackground'))$('#resolveBackground').onclick=()=>{s.background='sand';render()};

 document.querySelectorAll('[data-brief]').forEach(el=>{const key=el.dataset.brief;el.onchange=()=>{s[key]=el.type==='checkbox'?el.checked:el.value;if(key==='type'){s.name=types.find(t=>t[0]===s.type)[1];s.angle=s.type==='top'?'top':['three','lifestyle','pack'].includes(s.type)?'three':'front'}render()};if(el.tagName==='INPUT'&&el.type!=='checkbox')el.oninput=()=>{s[key]=el.value;refreshNeeds();updateTotal()}});
 document.querySelectorAll('[data-product]').forEach(el=>{const key=el.dataset.product;el.oninput=()=>{product[key]=el.value;if(key==='h'||key==='w')paintAll();refreshNeeds();updateTotal()};el.onchange=()=>{product[key]=el.value;if(key==='category'){product.usage='';product.usageOther=''}render()}});
 $('#briefSupplement').onclick=requestReference;refreshNeeds();
}
function openAddDialog(){$('#addOptions').innerHTML=types.map(([id,name])=>`<button data-add-type="${id}"><strong>${name}</strong><span>${{front:'商品完整外觀',three:'看清商品立體感',back:'標籤與背面',side:'厚度與側邊',top:'從上往下拍',detail:'放大指定細節',pack:'商品與外盒',lifestyle:'使用中的樣子',size:'手拿或比例物'}[id]}</span>${{back:'必填：背面照片',side:'必填：側面照片',pack:'必填：外盒照片',size:'必填：商品高度',lifestyle:'必填：商品類別、使用方式'}[id]?`<small>${{back:'必填：背面照片',side:'必填：側面照片',pack:'必填：外盒照片',size:'必填：商品高度',lifestyle:'必填：商品類別、使用方式'}[id]}</small>`:''}</button>`).join('');document.querySelectorAll('[data-add-type]').forEach(b=>b.onclick=()=>{const type=b.dataset.addType,s=fresh(type,types.find(x=>x[0]===type)[1]);s.id='added-'+(++shotSeq);s.included=true;shots.push(s);active=s.id;$('#addDialog').close();openTab('brief');render();const panel=$('.shot-panel');if(panel.scrollHeight>panel.clientHeight)panel.scrollTop=panel.scrollHeight});$('#addDialog').showModal()}
$('#editProduct').onclick=()=>{$('#productName').value=product.name;$('#productDescription').value=product.description;$('#productDialog').showModal()};
$('#saveProduct').onclick=()=>{product.name=$('#productName').value.trim();product.description=$('#productDescription').value.trim();$('#productDialog').close();render()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());

function renderSource(ref){
 $('#sourceArea').innerHTML=`<div class="source-loaded"><img src="${esc(ref.src)}" alt="商品照片"><div><label class="inline-name-label" for="inlineProductName">商品名稱</label><input id="inlineProductName" class="inline-product-name" value="${esc(product.name)}" placeholder="輸入商品名稱" maxlength="60" title="商品名稱，提供生成時參考"><button class="text-button" id="replacePhoto">更換商品照片</button></div></div>`;
 $('#inlineProductName').oninput=e=>product.name=e.target.value;
 $('#replacePhoto').onclick=()=>pickMain(true);
}
function start(src,prefill,name,record){started=true;references.reset(record?.id||'sample-main');shootNotes='';$('#shootNotes').value='';lastResults=[];$('#lastResults').hidden=true;Object.assign(product,{name:prefill?'FORM BOTANICAL SERUM':'',category:prefill?'保養品':'',description:prefill?'琥珀色玻璃滴管瓶，金色瓶蓋與淺色標籤。':'',h:'',w:'',usage:prefill?'按壓或滴出':'',usageOther:''});$('#proposalControls').disabled=false;source=src;mode=prefill?'sample':'custom';active='front';groupBackground=prefill?'sand':'original';ratio='1:1';shots=[fresh('front','主圖')];$('#emptyState').hidden=true;$('#preview').hidden=false;$('#ratioLabel').hidden=false;$('#editControls').disabled=false;$('#startOver').hidden=false;$('#addTop').disabled=false;renderSource({src});openTab('brief');render()}
function status(s){if(bgOf(s)==='original')return'原照預覽';const ref=shotRef(s);return ref&&!cutouts[ref.id]?'尚未去背・位置示意':'位置示意・光影由 AI 完成'}
function exampleStyle(b,angle){const r=sceneCell(b.scene,1402,1122,angle);return `background-image:url('assets/${exampleSheets[angle]}.png');background-size:${1402/r.w*100}% ${1122/r.h*100}%;background-position:${r.x/(1402-r.w)*100}% ${r.y/(1122-r.h)*100}%`}
function renderExample(){const s=current(),b=backgrounds.find(x=>x.id===bgOf(s)),has=b.scene!==undefined;$('#sceneExampleOpen').hidden=!has;if(!has)return;$('#sceneExampleLarge').style.cssText=exampleStyle(b,s.angle);$('#sceneExampleTitle').textContent=b.name}
function groundLine(bg,s,w,h){const side=Math.max(w,h),g=bg.scene!==undefined?(sceneGrounds[s.angle]||sceneGrounds.front)[bg.scene]:bg.anchor;return (h-side)/2+g*side}
function paintShadow(c,cx,baseY,dw){for(const [rx,ry,alpha,shift] of [[.82,.13,.34,.07],[.54,.05,.62,.02]]){c.save();c.globalCompositeOperation='multiply';c.translate(cx+dw*shift,baseY);c.scale(1,ry/rx);const r=dw*rx,grad=c.createRadialGradient(0,0,0,0,0,r);grad.addColorStop(0,`rgba(38,28,20,${alpha})`);grad.addColorStop(1,'rgba(38,28,20,0)');c.fillStyle=grad;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.restore()}}
function render(){
 const primary=references.refs()[0];source=primary?.src||null;$('#sourceArea img')?.setAttribute('src',source||'');if(!primary)$('#sourceArea').innerHTML='<div class="source-placeholder">請加入商品照片</div>';else if(!$('#inlineProductName'))renderSource(primary);
 $('#shotList').innerHTML=shots.map(s=>`<div class="shot-item"><label><span class="sr-only">製作${s.name}</span><input type="checkbox" data-include="${s.id}" ${s.included?'checked':''}></label><button class="shot-select ${active===s.id?'active':''}" data-shot="${s.id}" aria-label="預覽${s.name}" aria-pressed="${active===s.id}"><canvas data-thumb="${s.id}" aria-hidden="true"></canvas></button><strong>${esc(s.name)}</strong><small>${status(s).split('・')[0]}</small><button class="shot-needs" data-fix-needs="${s.id}" hidden></button>${shots.length>1?`<button class="remove-shot" data-remove-shot="${s.id}" aria-label="移除${esc(s.name)}">移除</button>`:""}</div>`).join('');
 document.querySelectorAll('[data-fix-needs]').forEach(b=>b.onclick=()=>{active=b.dataset.fixNeeds;openTab('brief');render();const field=$('#shotBrief [aria-invalid="true"]');field?.focus()});
 document.querySelectorAll('[data-shot]').forEach(b=>b.onclick=()=>{active=b.dataset.shot;render()});document.querySelectorAll('[data-include]').forEach(b=>b.onchange=()=>{shots.find(s=>s.id===b.dataset.include).included=b.checked;render()});
 document.querySelectorAll('[data-remove-shot]').forEach(b=>b.onclick=()=>{const index=shots.findIndex(s=>s.id===b.dataset.removeShot);shots.splice(index,1);if(!current())active=shots[Math.min(index,shots.length-1)].id;render()});
 const s=current();$('#selectedCount').textContent='已選 '+chosen().length+' 張';$('#previewTitle').textContent=s.name;$('#settingsTitle').textContent=s.name+'的設定';$('#previewState').textContent=bgOf(s)==='original'?'原照預覽':status(s);$('#backgroundScope').textContent=s.type==='front'&&s.white?'需求指定純白':s.background?'只改這張':'與整組相同';$('#backgroundName').textContent=bgName(s);$('#inherit').hidden=!s.background;$('#ratioLabel').textContent=ratioOf(s);$('#composePanel').classList.toggle('photo-native',bgOf(s)==='original');
 $('#previewNote').textContent='';
 $('#backgrounds').innerHTML=backgrounds.slice(0,6).map(b=>`<button class="bg-choice" data-bg="${b.id}" aria-pressed="${bgOf(s)===b.id}" aria-label="${b.name}"><span style="background-color:${b.color};${swatch(b)}"></span><small>${b.name}</small></button>`).join('');
 document.querySelectorAll('#backgrounds [data-bg]').forEach(b=>b.onclick=()=>{s.background=b.dataset.bg;s.white=false;render()});

 document.querySelectorAll('[data-ratio]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ratio===ratio)));references.render();renderExample();updateTotal();renderProposal();renderBrief();paintAll();
}
function updateTotal(){const n=chosen().length;$('#orderCount').textContent='共 '+n+' 張';$('#orderCost').textContent=n*20+' 點';$('#orderBalance').textContent='製作後剩 '+(200-n*20)+' 點';$('#selectedCount').textContent='已選 '+n+' 張';$('#review').disabled=!n;const problems=selectedIssues();$('#orderIssues').textContent=problems.length?new Set(problems.map(p=>p.id)).size+' 張需補資料或調整設定':'';}
async function paint(canvas,s){
 const token=(canvas._paintToken||0)+1;canvas._paintToken=token;delete canvas.dataset.ready
 const edge=canvas.hasAttribute('data-thumb')||canvas.hasAttribute('data-film-thumb')?180:canvas.parentElement?.id==='generationThumbs'?1600:1000;const [a,b]=ratio.split(':').map(Number),w=Math.round(edge*a/Math.max(a,b)),h=Math.round(edge*b/Math.max(a,b));canvas.width=w;canvas.height=h;const c=canvas.getContext('2d'),bg=backgrounds.find(x=>x.id===bgOf(s)),ref=shotRef(s);c.fillStyle=bg.color;c.fillRect(0,0,w,h);
 if(bg.scene!==undefined||bg.plate){const plate=await image(bg.plate?`assets/natural-${bg.plate}-${s.angle}-v1.webp`:`assets/scene-plates-${s.angle==='three'?'v1':s.angle+'-v1'}.png`);if(canvas._paintToken!==token)return;if(plate&&canvas.isConnected){const r=bg.plate?{x:0,y:0,w:plate.width,h:plate.height}:sceneCell(bg.scene,plate.width,plate.height,s.angle),f=Math.max(w/r.w,h/r.h),dw=r.w*f,dh=r.h*f;c.drawImage(plate,r.x,r.y,r.w,r.h,(w-dw)/2,(h-dh)/2,dw,dh)}}
 if(!ref){if(canvas.id==='preview'){canvas._productBox=null;syncBounds()}c.fillStyle='#52675d';c.font='32px sans-serif';c.textAlign='center';c.fillText('請加入'+(requiredSide(s)==='包裝'?'外盒':requiredSide(s)||'商品')+'照片',w/2,h/2);return}
 const cut=bg.id!=='original'?cutouts[ref.id]:null,usePhoto=!cut;let im=await image(cut?cut.src:ref.src),cell=null;
 if(!im||!canvas.isConnected||canvas._paintToken!==token)return;
 let sx=cell?cell[0]*im.width/2:0,sy=cell?cell[1]*im.height/2:0,sw=cell?im.width/2:im.width,sh=cell?im.height/2:im.height;
 if(usePhoto&&(bg.id!=='original'||s.type==='detail')){sx=ref.box.x*im.width;sy=ref.box.y*im.height;sw=ref.box.w*im.width;sh=ref.box.h*im.height}
 if(cut){const [bx,by,bw,bh]=cut.box,edited=ref.box.edited?ref.box:{x:0,y:0,w:1,h:1},l=Math.max(bx,edited.x),t=Math.max(by,edited.y),r=Math.min(bx+bw,edited.x+edited.w),b=Math.min(by+bh,edited.y+edited.h);sx=l*im.width;sy=t*im.height;sw=Math.max(.05,r-l)*im.width;sh=Math.max(.05,b-t)*im.height}


 if(bg.id==='original'){const k=Math.min(1,edge/Math.max(sw,sh));canvas.width=Math.round(sw*k);canvas.height=Math.round(sh*k);c.drawImage(im,sx,sy,sw,sh,0,0,canvas.width,canvas.height);if(canvas.id==='preview'){canvas._productBox=null;syncBounds()}canvas.dataset.ready='true';return}
 const isolated=!!cut,standing=isolated&&s.type!=='detail'&&s.type!=='top',ground=standing?groundLine(bg,s,w,h):0;let fit=Math.min(w/sw,h/sh)*s.scale/100*(isolated?s.type==='detail'?2:.72:1);if(standing)fit=Math.min(fit,ground*.86/sh*s.scale/90);const dw=sw*fit,dh=sh*fit,x=(w-dw)/2+(s.x-50)*w/100,y=(standing?ground-dh:isolated&&s.type==='detail'?h/2-dh*(detailFocus[s.focus]??.5):(h-dh)/2)+(s.y-50)*h/100;
 if(standing)paintShadow(c,x+dw/2,y+dh*.985,dw);if(isolated&&s.type==='top'){c.shadowColor='rgba(38,28,20,.3)';c.shadowBlur=w*.035;c.shadowOffsetX=w*.012;c.shadowOffsetY=w*.016}c.drawImage(im,sx,sy,sw,sh,x,y,dw,dh);c.shadowColor='transparent';c.shadowBlur=c.shadowOffsetX=c.shadowOffsetY=0;if(!isolated&&bg.id!=='original'&&canvas.id==='preview'){c.save();c.strokeStyle='#ffffff';c.lineWidth=3;c.setLineDash([14,10]);c.strokeRect(x+2,y+2,dw-4,dh-4);c.restore()}if(canvas.id==='preview'){canvas._productBox={x:x/w,y:y/h,w:dw/w,h:dh/h,side:ref.side};syncBounds()}
 if(s.type==='size'&&product.h){c.save();c.filter='none';c.strokeStyle='#51614b';c.fillStyle='#344630';c.lineWidth=2;const lineX=x+dw*.22;c.beginPath();c.moveTo(lineX,y+dh*.05);c.lineTo(lineX,y+dh*.97);c.stroke();c.font='28px sans-serif';c.textAlign='center';c.fillText(product.h+' cm',lineX,y+dh*.02);c.restore()}c.filter='none';canvas.dataset.ready='true';
}
async function paintAll(){const token=++renderId;await paint($('#preview'),current());if(token!==renderId)return;for(const s of shots){const c=document.querySelector(`[data-thumb="${s.id}"]`);if(c)await paint(c,s);if(token!==renderId)return}}
function openTab(name){tab=name;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));for(const n of ['brief','background','compose'])$('#'+n+'Panel').hidden=n!==name;$('#preview').classList.toggle('can-position',name==='compose');$('#preview').tabIndex=name==='compose'?0:-1;syncBounds()}
async function load(file,reference=false){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type))return toast('請選擇 JPG、PNG 或 WebP 圖片');if(file.size>15*1024*1024)return toast('照片請小於 15 MB');await references.ready;if(reference&&references.selected.length>=4)return toast('最多 4 張商品照片，請先移除一張');try{const target=shots.find(s=>s.id===pendingReferenceShot),r=await references.addUpload(file,reference?requiredSide(target||current())||'正面':'正面');if(reference){references.choose(r.id)}else if(replacingMain&&started){const oldId=references.selected[0];if(oldId)references.selected.splice(0,1,r.id);else references.selected.push(r.id);shots.forEach(s=>{if(s.referenceId===oldId)s.referenceId=r.id});mode='custom';pendingReferenceShot=null;render();toast('已更換商品照片，拍攝設定保留')}else start(r.src,false,file.name,r);replacingMain=false;if(references.selected.includes(r.id)&&!references.dialog.open)await references.open(r.id)}catch{toast('照片無法讀取，請換一張')}}
$('#upload').onclick=()=>pickMain(false);$('#photoFile').oncancel=()=>replacingMain=false;$('#referenceFile').oncancel=()=>pendingReferenceShot=null;$('#photoFile').onchange=e=>{load(e.target.files[0]);e.target.value=''};$('#referenceFile').onchange=e=>{load(e.target.files[0],true);e.target.value=''};

$('#shootNotes').oninput=e=>shootNotes=e.target.value;
$('#startOver').onclick=()=>{objectURLs.forEach(URL.revokeObjectURL);const next=new URL(location.href);next.searchParams.delete('demo');location.href=next.href};
$('#addTop').onclick=openAddDialog;
$('#applyAll').onclick=()=>{groupBackground=bgOf(current());shots.forEach(s=>s.background=null);render();toast('全部照片已使用這個背景')};$('#inherit').onclick=()=>{current().background=null;render()};
$('#alignLeft').onclick=()=>{current().x=30;render()};$('#alignRight').onclick=()=>{current().x=70;render()};
$('#center').onclick=()=>{Object.assign(current(),{x:50,y:50});render()};
function syncBounds(){
 const canvas=$('#preview'),frame=$('#productBounds'),box=canvas._productBox,visible=started&&tab==='compose'&&!!box;
 frame.hidden=!visible;$('#canvasTools').hidden=!started||tab!=='compose'||bgOf(current())==='original';if(started)$('#scaleReadout').textContent=Math.round(current().scale)+'%';if(!visible)return;
 const rect=canvas.getBoundingClientRect(),host=$('#canvasSpace').getBoundingClientRect(),border=canvas.clientLeft,w=canvas.clientWidth,h=canvas.clientHeight;
 Object.assign(frame.style,{left:rect.left-host.left+border+box.x*w+'px',top:rect.top-host.top+canvas.clientTop+box.y*h+'px',width:box.w*w+'px',height:box.h*h+'px'});
 $('#boundsLabel').textContent='商品位置';
}
function resizeProduct(delta){if(!started)return;current().scale=Math.max(55,Math.min(125,current().scale+delta));paintAll()}
$('#zoomOut').onclick=()=>resizeProduct(-5);$('#zoomIn').onclick=()=>resizeProduct(5);
$('#resetComposition').onclick=()=>{Object.assign(current(),{x:50,y:50,scale:90});render()};
let positioning=null;
$('#productBounds').onpointerdown=e=>{if(tab!=='compose'||!started||e.button!==0)return;const rect=$('#preview').getBoundingClientRect(),box=$('#preview')._productBox;positioning={id:current().id,x:e.clientX,y:e.clientY,sx:current().x,sy:current().y,scale:current().scale,corner:e.target.dataset.corner,rect,box};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();e.currentTarget.focus()};
$('#productBounds').onpointermove=e=>{if(!positioning||current().id!==positioning.id)return;const p=positioning,s=current(),dx=e.clientX-p.x,dy=e.clientY-p.y;if(p.corner){const signX=p.corner.endsWith('r')?1:-1,signY=p.corner.startsWith('b')?1:-1,baseW=p.box.w*p.rect.width,baseH=p.box.h*p.rect.height,factor=1+(dx*signX*baseW+dy*signY*baseH)/(baseW*baseW+baseH*baseH);s.scale=Math.max(55,Math.min(125,p.scale*factor))}else{s.x=Math.max(20,Math.min(80,p.sx+dx/p.rect.width*100));s.y=Math.max(20,Math.min(80,p.sy+dy/p.rect.height*100))}paintAll()};
$('#productBounds').onpointerup=$('#productBounds').onpointercancel=()=>positioning=null;
function moveByKey(e){if(tab!=='compose'||!started||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const s=current(),delta=e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1,k=e.shiftKey?'scale':e.key==='ArrowLeft'||e.key==='ArrowRight'?'x':'y';s[k]=Math.max(k==='scale'?55:20,Math.min(k==='scale'?125:80,s[k]+delta));paintAll()}
$('#productBounds').onkeydown=$('#preview').onkeydown=moveByKey;
window.addEventListener('resize',syncBounds);new ResizeObserver(syncBounds).observe($('#canvasSpace'));
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openTab(b.dataset.tab));document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{ratio=b.dataset.ratio;render()});
$('#review').onclick=async()=>{const list=chosen(),issues=selectedIssues();$('#reviewIssues').innerHTML=issues.map(p=>`<div><span>${esc(p.name)}：${esc(p.text)}</span><button class="text-button" data-fix-shot="${p.id}">修改這張</button></div>`).join('');$('#reviewNotes').textContent=[product.name.trim()?'商品名稱：'+product.name.trim():'',product.description?'商品描述：'+product.description:'',shootNotes?'整組拍攝需求：'+shootNotes:''].filter(Boolean).join('\n');document.querySelectorAll('[data-fix-shot]').forEach(b=>b.onclick=()=>{$('#reviewDialog').close();active=b.dataset.fixShot;openTab('brief');render()});$('#reviewGrid').innerHTML=list.map(s=>`<article><canvas data-review="${s.id}" aria-label="${s.name}示意"></canvas><h3>${s.name}</h3><p>${bgName(s)}・${ratioOf(s)}<br>${status(s)}</p>${briefSpecs(s)}${missingBrief(s).length?`<p class="brief-validation">待補充：${missingBrief(s).join('、')}</p>`:''}<button class="text-button" data-edit="${s.id}">編輯這張</button></article>`).join('');$('#reviewTotal').textContent=`共 ${list.length} 張／${list.length*20} 點／製作後剩 ${200-list.length*20} 點`;$('#generateDemo').disabled=list.length>10||!!issues.length;$('#generateDemo').textContent=list.length>10?'點數不足':issues.length?'請先補齊資料與調整設定':'生成 '+list.length+' 張・'+list.length*20+' 點（示意）';$('#reviewDialog').showModal();document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{$('#reviewDialog').close();active=b.dataset.edit;render()});for(const s of list)await paint(document.querySelector(`[data-review="${s.id}"]`),s)};
$('#closeReview').onclick=$('#continueEdit').onclick=()=>$('#reviewDialog').close();
function renderBackgroundGallery(){const s=current();$('#backgroundCategories').innerHTML=['全部','簡約','材質','自然','創意'].map(cat=>`<button data-bg-category="${cat}" aria-pressed="${cat===backgroundCategory}">${cat}</button>`).join('');$('#backgroundGallery').innerHTML=backgrounds.filter(b=>b.id==='original'||backgroundCategory==='全部'||b.category===backgroundCategory).map(b=>`<button class="gallery-background" data-gallery-bg="${b.id}" aria-pressed="${bgOf(s)===b.id}"><span style="${swatch(b)}"></span><strong>${b.name}</strong></button>`).join('');document.querySelectorAll('[data-bg-category]').forEach(b=>b.onclick=()=>{backgroundCategory=b.dataset.bgCategory;renderBackgroundGallery()});document.querySelectorAll('[data-gallery-bg]').forEach(b=>b.onclick=()=>{s.background=b.dataset.galleryBg;s.white=false;$('#backgroundDialog').close();render()})}
$('#browseBackgrounds').onclick=()=>{const s=current();$('#backgroundDialogTitle').textContent='替'+s.name+'選背景';$('#backgroundDialogScope').textContent='只改這張・22 種場景與原背景';renderBackgroundGallery();$('#backgroundDialog').showModal()};$('#closeBackgrounds').onclick=()=>$('#backgroundDialog').close();

let helpButton=null,pinned=false;const bubble=$('#helpBubble');function hideHelp(){bubble.hidden=true;if(helpButton){helpButton.setAttribute('aria-expanded','false');helpButton.removeAttribute('aria-describedby')}helpButton=null;pinned=false}function showHelp(b){if(helpButton!==b)hideHelp();helpButton=b;bubble.textContent=b.dataset.help;bubble.hidden=false;b.setAttribute('aria-expanded','true');b.setAttribute('aria-describedby','helpBubble');const r=b.getBoundingClientRect(),size=bubble.getBoundingClientRect();bubble.style.left=Math.max(12,Math.min(innerWidth-size.width-12,r.left))+'px';bubble.style.top=Math.max(12,Math.min(innerHeight-size.height-12,r.bottom+8))+'px'}document.querySelectorAll('[data-help]').forEach(b=>{b.setAttribute('aria-expanded','false');b.onmouseenter=b.onfocus=()=>showHelp(b);b.onmouseleave=()=>{if(!pinned&&document.activeElement!==b)hideHelp()};b.onblur=hideHelp;b.onclick=()=>{if(helpButton===b&&pinned)hideHelp();else{showHelp(b);pinned=true}}});document.addEventListener('click',e=>{if(!e.target.closest('[data-help]'))hideHelp()});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideHelp()});document.addEventListener('scroll',hideHelp,true);window.addEventListener('resize',hideHelp);
$('#canvasSpace').ondragover=e=>e.preventDefault();$('#canvasSpace').ondrop=e=>{e.preventDefault();load(e.dataTransfer.files[0])};
if(new URLSearchParams(location.search).get('demo')==='1')references.ready.then(()=>start('assets/product-snapshot.png',true,'植萃保濕精華'));
else $('#shotList').innerHTML='<p class="empty-shot-list">加入商品照片後，即可新增拍攝。</p>';

// This local demo never sends a job or changes the credit balance.
function showResults(){
 $('#resultsSummary').textContent=`共 ${lastResults.length} 張／預估 ${lastResults.length*20} 點・本次為示意，剩餘仍為 200 點`;
 $('#resultsGrid').innerHTML=lastResults.map((r,i)=>`<article><button class="result-image" data-result="${i}" aria-label="查看${esc(r.name)}示意成果"><img src="${r.url}" alt="${esc(r.name)}示意成果"></button><h3>${esc(r.name)}</h3><p>${esc(r.background)}・${esc(r.ratio)}</p><div class="result-buttons"><a href="${r.url}" download="商拍示意-${i+1}.png">下載示意圖</a><button class="text-button" data-result-edit="${i}">調整這張</button></div></article>`).join('');
 document.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>{detailIndex=Number(b.dataset.result);const r=lastResults[detailIndex];$('#resultDetailTitle').textContent=r.name;$('#resultDetailImage').src=r.url;$('#resultDetailImage').alt=r.name+'示意成果';$('#downloadResult').href=r.url;$('#downloadResult').download='商拍示意-'+(detailIndex+1)+'.png';$('#resultDetailDialog').showModal()});
 document.querySelectorAll('[data-result-edit]').forEach(b=>b.onclick=()=>editGenerated(Number(b.dataset.resultEdit)));
 $('#resultsDialog').showModal();
}
function editGenerated(i){if(!shots.some(s=>s.id===lastResults[i].id)){toast('這張已不在製作清單，仍可查看與下載成果');return}$('#resultDetailDialog').close();$('#resultsDialog').close();active=lastResults[i].id;render();toast('調整後可再次確認並生成示意')}
$('#editResult').onclick=()=>editGenerated(detailIndex);
$('#closeResultDetail').onclick=()=>$('#resultDetailDialog').close();
$('#closeResults').onclick=$('#returnWorkbench').onclick=()=>$('#resultsDialog').close();
$('#lastResults').onclick=showResults;
$('#sceneExampleOpen').onclick=()=>$('#sceneExampleDialog').showModal();
$('#closeSceneExample').onclick=()=>$('#sceneExampleDialog').close();
function cancelPreparation(){generationRun++;$('#generationDialog').close();toast('已取消，沒有扣點')}
$('#cancelGeneration').onclick=cancelPreparation;
$('#generationDialog').addEventListener('cancel',e=>{e.preventDefault();cancelPreparation()});
$('#generateDemo').onclick=async()=>{
 const list=chosen().map(s=>({...s}));if(!list.length||list.length>10||selectedIssues().length)return;
 const run=++generationRun,batch=[];$('#reviewDialog').close();$('#generationProgress').max=list.length;$('#generationProgress').value=0;$('#generationStatus').textContent=`0／${list.length} 張`;$('#generationThumbs').replaceChildren();$('#generationDialog').showModal();
 try{
 for(let i=0;i<list.length;i++){
  if(run!==generationRun)return;
  const s=list[i],canvas=document.createElement('canvas');canvas.hidden=true;$('#generationThumbs').append(canvas);await paint(canvas,s);
  if(run!==generationRun){canvas.remove();return}
  if(canvas.dataset.ready!=='true')throw new Error('preview unavailable');
  const ctx=canvas.getContext('2d'),font=Math.max(14,Math.round(canvas.width*.022));ctx.font=font+'px sans-serif';const label='示意預覽・非 AI 生成';const labelWidth=ctx.measureText(label).width;ctx.fillStyle='#ffffffdf';ctx.fillRect(canvas.width-labelWidth-26,canvas.height-font-20,labelWidth+20,font+14);ctx.fillStyle='#354a40';ctx.textAlign='right';ctx.fillText(label,canvas.width-16,canvas.height-12);
  const url=canvas.toDataURL('image/png');batch.push({id:s.id,name:s.name,background:bgName(s),ratio:ratioOf(s),url,notes:shootNotes,product:{...product,name:product.name.trim()}});canvas.remove();const thumb=document.createElement('img');thumb.src=url;thumb.alt=s.name+'已準備';$('#generationThumbs').append(thumb);$('#generationProgress').value=i+1;$('#generationStatus').textContent=`${i+1}／${list.length} 張・${s.name}`;
  await new Promise(resolve=>setTimeout(resolve,650));
 }
 if(run!==generationRun)return;lastResults=batch;$('#lastResults').hidden=false;$('#generationDialog').close();showResults();
 }catch{if(run!==generationRun)return;$('#generationDialog').close();toast('示意照片無法準備，請返回確認後重試。沒有扣點')}
};

})();

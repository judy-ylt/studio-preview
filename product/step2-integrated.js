/* Approved step2-v2 UI, mounted in the original workflow. No sessionStorage bridge. */
const productStep2=(()=>{
const MARKUP="<div class=\"product-v2\"><div class=\"v2-workspace\">\n <section class=\"panel\" aria-labelledby=\"pTitle\">\n  <h2 id=\"pTitle\" class=\"name-title\"><label class=\"name-edit\"><input id=\"v2Name\" value=\"\" placeholder=\"輸入商品名稱\" aria-label=\"商品名稱（選填）\" maxlength=\"30\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"/><path d=\"M14 6l4 4\"/></svg></label><button type=\"button\" class=\"k-tip\" data-tip=\"最多 4 張，請包含需要拍攝的面向。\" aria-label=\"說明：最多 4 張，請包含需要拍攝的面向。\">?</button></h2>\n  <div class=\"scroll\">\n   <div class=\"ref-main\">\n    <div class=\"v2-stage\" id=\"v2Stage\"><div class=\"empty-reference\" id=\"emptyReference\"><span class=\"empty-reference-mark\" aria-hidden=\"true\">＋</span><button type=\"button\" class=\"k-btn k-btn--primary\" id=\"emptyUpload\">上傳商品照片</button></div><div class=\"box\" id=\"box\"><span>商品範圍</span><i id=\"grip\" aria-label=\"調整大小\"></i></div></div>\n    <div class=\"thumbs\" id=\"thumbs\"></div>\n   </div>\n   <p class=\"box-note\">已自動框出商品，拖曳框線可調整</p>\n   <div class=\"side-row\" id=\"sideRow\"></div>\n   <div class=\"library\" id=\"library\">\n    <div class=\"library-head\"><span>曾上傳的照片・已選 <b id=\"libCount\">0</b> / 4</span><button class=\"k-btn k-btn--secondary k-btn--sm\" id=\"upload\">上傳新照片</button></div>\n    <div class=\"lib-grid\" id=\"libGrid\"></div>\n   </div>\n  </div>\n </section>\n\n <section class=\"panel\" aria-labelledby=\"sTitle\">\n  <h2 id=\"sTitle\">要做哪幾張</h2>\n  <div class=\"scroll\">\n   <div class=\"shots\" id=\"shots\"></div>\n   <div class=\"quick\" id=\"quick\"><span><b>不知道拍什麼？</b></span><button class=\"k-btn k-btn--primary k-btn--sm\" id=\"quickBtn\">套用常用 4 張（主圖・斜側・背面・特寫）</button></div>\n   <button class=\"add-shot\" id=\"addShot\" style=\"margin-top:12px\">＋ 新增一張</button>\n  </div>\n  <div class=\"total\" aria-live=\"polite\">\n   <span class=\"count\" id=\"count\">共 1 張</span>\n   <span class=\"pts\"><b id=\"cost\">20 點</b><small id=\"left\">製作後剩 180 點</small></span>\n  </div>\n </section>\n</div><div class=\"sheet-bg\" id=\"sheetBg\" hidden><div class=\"sheet\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"sheetTitle\">\n <h3 id=\"sheetTitle\">要新增哪一種照片？</h3><p>選好之後還能調整。</p>\n <div class=\"presets\" id=\"presets\"></div>\n <div class=\"sheet-foot\"><button class=\"k-btn k-btn--ghost\" id=\"sheetClose\">取消</button></div>\n</div></div>\n\n<input type=\"file\" id=\"v2File\" accept=\"image/jpeg,image/png,image/webp\" hidden></div>";

const MAX_REFS=4,MAX_SHOTS=4;
const $=q=>document.querySelector(q);
const $$=q=>document.querySelectorAll('.product-v2 '+q);
const ic={
 front:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="8" y="7" width="8" height="13" rx="2"/><path d="M10 7V4h4v3"/></svg>',
 oblique:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 8l7-1.5V20L7 19z"/><path d="M14 6.5l3 1.5v11L14 20"/></svg>',
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="8" y="7" width="8" height="13" rx="2"/><path d="M10 11h4M10 14h4M10 17h2"/></svg>',
 side:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="10" y="7" width="4" height="13" rx="1.5"/></svg>',
 top:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="13" r="6"/><circle cx="12" cy="13" r="2"/><path d="M12 2v3"/></svg>',
 detail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l5 5"/></svg>',
 pack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/></svg>',
 hand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V6.5a1.5 1.5 0 013 0V12M11 11V5a1.5 1.5 0 013 0v6M14 11V6.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-.5a5 5 0 01-4.2-2.3L4 15.5a1.5 1.5 0 012.4-1.8L8 15"/></svg>',
 size:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="9" y="6" width="6" height="12" rx="1.5"/><path d="M4 6v12M3 6h2M3 18h2M20 9v6"/></svg>'};
/* Shot presets: what beginners recognise. need = which reference side the AI must see. */
const PRESETS=[
 {k:'主圖',ic:'front',desc:'商品完整正面，最常用的封面',angle:'正面'},
 {k:'斜側',ic:'oblique',desc:'約 45 度，看得出立體感',angle:'斜側'},
 {k:'背面',ic:'back',desc:'成分表、使用說明',angle:'正面',need:'背面'},
 {k:'側面',ic:'side',desc:'厚度與側邊設計',angle:'正面',need:'側面'},
 {k:'俯視平拍',ic:'top',desc:'從正上方，適合擺設構圖',angle:'俯拍'},
 {k:'局部特寫',ic:'detail',desc:'放大瓶蓋、質地或標籤',angle:'正面',focus:['瓶蓋','標籤','質地','其他'],multi:true},
 {k:'包裝合照',ic:'pack',desc:'外盒與商品放在一起',angle:'斜側',need:'包裝',exp:true},
 {k:'使用情境',ic:'hand',desc:'手拿或使用中的樣子',angle:'斜側',multi:true,exp:true},
 {k:'尺寸感',ic:'size',desc:'拿在手上，讓人知道大小',angle:'正面',exp:true}];
const SIDES=['正面','背面','側面','包裝','細節'];
/* Information the AI cannot see in a photo; asked only by the shot types that need it, stored once per product. */
const CATS=['保養品','食品飲料','3C 電子','居家用品','服飾配件','其他'];
const USAGE={'保養品':['塗在手背','擦在臉上','按壓或滴出'],'食品飲料':['拿在手上','倒進杯盤','正在享用'],'3C 電子':['握在手上操作','戴在身上','放在桌上使用'],'居家用品':['擺在空間裡','正在使用'],'服飾配件':['穿戴在身上','拿在手上'],'其他':['拿在手上']};
const P={cat:'',h:'',w:'',usage:'',usageText:''};
const ANGLES=['正面','斜側','俯拍','低角度'];
let lib=[],sourceSeq=0;
function sourceCSS(source){if(source.startsWith('atlas:')){const i=Number(source.split(':')[1]);return `background-image:url(assets/product-library-casual.png);background-position:${i%4/3*100}% ${Math.floor(i/4)*100}%;background-size:400% 200%`}return `background-image:url("${source}");background-size:contain;background-position:center`}
function ensureSource(source){let item=lib.find(r=>r.source===source);if(!item){item={id:'r'+(sourceSeq++),source,css:sourceCSS(source)};lib.push(item)}return item}
/* Auto-detected product box per library photo (prototype: hand-set values). */
const S={refs:[],cur:null,uploads:[],shots:[],seq:0,pendingSide:null};
let initialized=false;
const preset=k=>PRESETS.find(p=>p.k===k);
const newShot=k=>{const p=preset(k);return {id:++S.seq,k,angle:p.angle,side:'左',focus:p.focus?p.focus[0]:null,focusText:'',hold:'單手拿著',people:'只出現手',keepText:true,white:false}};
S.shots.push(newShot('主圖'));
const cssOf=id=>lib.find(x=>x.id===id)?.css||'';
const ref=id=>S.refs.find(r=>r.id===id);


/* Keep the range label inside the photo on all four edges, including narrow selections. */
let rangeLabelObserver;
function positionRangeLabel(){
 const stage=$('#v2Stage'),box=$('#box'),label=box?.querySelector('span');
 if(!stage||!box||box.hidden||!label||!stage.clientWidth||!stage.clientHeight)return;
 const pad=8,gap=6,W=stage.clientWidth,H=stage.clientHeight;
 label.style.maxWidth=Math.max(1,W-pad*2)+'px';
 const w=label.offsetWidth,h=label.offsetHeight,x=box.offsetLeft,y=box.offsetTop,bw=box.offsetWidth,bh=box.offsetHeight;
 const clampX=v=>Math.max(pad,Math.min(W-pad-w,v)),clampY=v=>Math.max(pad,Math.min(H-pad-h,v));
 // Align to the opposite corner if the preferred label end would hit a photo edge.
 const labelX=clampX(x+w>W-pad?x+bw-w:x);
 const candidates=[
  {side:'above',x:labelX,y:y-gap-h},
  {side:'below',x:labelX,y:y+bh+gap},
  {side:'right',x:x+bw+gap,y:clampY(y)},
  {side:'left',x:x-gap-w,y:clampY(y)}
 ];
 const fits=p=>p.x>=pad&&p.y>=pad&&p.x+w<=W-pad&&p.y+h<=H-pad;
 const chosen=candidates.find(fits)||{side:'inside',x:labelX,y:clampY(y+pad)};
 Object.assign(label.style,{left:(chosen.x-x-box.clientLeft)+'px',top:(chosen.y-y-box.clientTop)+'px'});
 label.dataset.placement=chosen.side;
}

function renderRefs(){
 const cur=ref(S.cur);
 $('#v2Stage').setAttribute('style',cur?cssOf(cur.id):'');$('#v2Stage').dataset.empty=String(!cur);$('#box').hidden=!cur;$('#emptyReference').hidden=!!cur;$('#thumbs').hidden=!S.refs.length;$('.ref-main').classList.toggle('is-empty',!S.refs.length);$('.box-note').hidden=!cur;$('#sideRow').hidden=!cur;
 if(cur)Object.assign($('#box').style,{left:cur.box.l+'%',top:cur.box.t+'%',width:cur.box.w+'%',height:cur.box.h+'%'});
 $('#thumbs').innerHTML=S.refs.map((r,i)=>`<button class="thumb" aria-current="${r.id===S.cur}" data-ref="${r.id}" style="${esc(cssOf(r.id))}" aria-label="參考照 ${i+1}，${r.side}"><span class="tag ${i===0?'main':''}">${r.side}</span><span class="x" role="button" data-del="${r.id}" aria-label="移除">✕</span></button>`).join('')+(S.refs.length<MAX_REFS?'<button class="add" id="addRef" aria-label="加入參考照">＋</button>':'');
 $('#sideRow').innerHTML=cur?`<span>這張拍到：</span>${SIDES.map(x=>`<button class="k-chip" aria-pressed="${cur.side===x}" data-side-tag="${x}">${x}</button>`).join('')}`:'';
 $('#libGrid').innerHTML=lib.map(x=>{const on=!!ref(x.id);return `<button class="lib" data-lib="${x.id}" aria-pressed="${on}" style="${esc(x.css)}" ${!on&&S.refs.length>=MAX_REFS?'disabled':''} aria-label="曾上傳的照片"></button>`}).join('');
 $('#libCount').textContent=S.refs.length;$('#upload').hidden=!S.refs.length;
 $$('[data-ref]').forEach(b=>b.onclick=e=>{if(e.target.dataset.del){S.refs=S.refs.filter(r=>r.id!==e.target.dataset.del);if(!ref(S.cur))S.cur=S.refs[0]?.id||null;renderAll();return}S.cur=b.dataset.ref;renderRefs()});
 $$('[data-side-tag]').forEach(b=>b.onclick=()=>{ref(S.cur).side=b.dataset.sideTag;renderAll()});
 const add=$('#addRef');if(add)add.onclick=()=>openLibrary();
 $$('[data-lib]').forEach(b=>b.onclick=()=>{const id=b.dataset.lib;if(ref(id)){S.refs=S.refs.filter(r=>r.id!==id);if(!ref(S.cur))S.cur=S.refs[0]?.id||null}else{S.refs.push({id,side:S.pendingSide||'正面',box:{...(lib.find(x=>x.id===id)?.box||{l:25,t:18,w:50,h:66})}});S.cur=id;S.pendingSide=null}renderAll()});
 positionRangeLabel();
}
function openLibrary(side){S.pendingSide=side||null;const L=$('#library');L.hidden=false;L.scrollIntoView({behavior:'smooth',block:'nearest'})}

function missingOf(s){const p=preset(s.k),m=[];
 if(p.need&&!S.refs.some(r=>r.side===p.need))m.push(p.need+'參考照');
 if(s.k==='尺寸感'&&!(+P.h>0))m.push('商品高度');
 if(s.k==='使用情境'){if(!P.cat)m.push('商品類別');else if(!P.usage||(P.usage==='其他'&&!P.usageText.trim()))m.push('使用方式')}
 if(s.k==='局部特寫'&&s.focus==='其他'&&!s.focusText.trim())m.push('想放大的位置');
 return m}
const chips=(list,cur,attr)=>list.map(v=>`<button class="k-chip" aria-pressed="${cur===v}" ${attr}="${v}">${v}</button>`).join('');
const NEED='<span class="need" aria-label="必填">*</span>';
const tip=t=>`<button type="button" class="k-tip" data-tip="${t}" aria-label="說明：${t}">?</button>`;
function reqBlock(s){
 if(s.k==='尺寸感')return `<div class="req">
  <div class="field-row"><span class="k-label">高度${NEED}${tip('填實際尺寸，協助呈現商品大小。')}</span><div class="k-field"><input inputmode="decimal" data-p="h" value="${esc(P.h)}" placeholder="10"></div><span class="unit">公分</span><span class="k-label" style="margin-left:8px">寬度</span><div class="k-field"><input inputmode="decimal" data-p="w" value="${esc(P.w)}" placeholder="可不填"></div><span class="unit">公分</span></div>
  <div class="field-row"><span class="k-label">呈現</span>${chips(['單手拿著','放在掌心','旁邊放日常物品'],s.hold,'data-hold')}</div></div>`;
 if(s.k==='使用情境')return `<div class="req">
  <div class="field-row"><span class="k-label">類別${NEED}${tip('選商品類別與用法，決定使用情境。')}</span>${chips(CATS,P.cat,'data-cat')}</div>
  ${P.cat?`<div class="field-row"><span class="k-label">使用方式${NEED}</span>${chips([...USAGE[P.cat],'其他'],P.usage,'data-usage')}</div>`:''}
  ${P.usage==='其他'?`<div class="field-row"><span class="k-label">描述${NEED}</span><div class="k-field wide"><input data-p="usageText" value="${esc(P.usageText)}" placeholder="例：噴在枕頭上"></div></div>`:''}
  <div class="field-row"><span class="k-label">出現的人</span>${chips(['只出現手','不露臉','露臉'],s.people,'data-people')}</div></div>`;
 if(s.k==='背面')return `<div class="req"><div class="field-row"><label class="k-switch" style="font-size:var(--k-t-meta)"><input type="checkbox" data-keep ${s.keepText?'checked':''}><span></span>保留原標籤文字</label>${tip('沿用參考照的標籤，避免文字變形。')}</div></div>`;
 if(s.k==='局部特寫'&&s.focus==='其他')return `<div class="req"><div class="field-row"><span class="k-label">位置${NEED}</span><div class="k-field wide"><input data-focustext value="${esc(s.focusText)}" placeholder="例：瓶身的金色壓紋"></div></div></div>`;
 if(s.k==='主圖')return `<div class="req" style="background:none;padding:0"><div class="field-row"><label class="k-switch" style="font-size:var(--k-t-meta)"><input type="checkbox" data-white ${s.white?'checked':''}><span></span>純白背景</label></div></div>`;
 return ''}
function renderShots(){
 $('#shots').innerHTML=S.shots.map((s,i)=>{const p=preset(s.k),missing=p.need&&!S.refs.some(r=>r.side===p.need);
 const miss=missingOf(s);return `<article class="shot ${miss.length?'todo':'done'}" data-shot="${s.id}">
  <div class="shot-head"><span class="shot-ic">${ic[p.ic]}</span><div><strong>${i===0?'主圖':(i+1)+'. '+s.k}</strong>${p.exp?'<span class="exp" title="效果還在調整，可能需要多試幾次">實驗中</span>':''}</div>${i?`<button class="k-btn k-btn--ghost k-btn--sm remove" data-remove="${s.id}">移除</button>`:''}</div>
  ${p.focus?`<div class="field-row"><span class="k-label">重點</span>${p.focus.map(f=>`<button class="k-chip" aria-pressed="${s.focus===f}" data-focus="${f}">${f}</button>`).join('')}</div>`:''}
  <div class="field-row"><span class="k-label">角度</span>${ANGLES.map(a=>`<button class="k-chip" aria-pressed="${s.angle===a}" data-angle="${a}">${a}${a===p.angle?' <small style="color:var(--k-ink-muted);font-weight:400">建議</small>':''}</button>`).join('')}</div>
  ${s.angle==='斜側'?`<div class="field-row"><span class="k-label">朝向</span><div class="k-seg" role="radiogroup" aria-label="朝向">${['左','右'].map(d=>`<button role="radio" aria-checked="${s.side===d}" data-dir="${d}">朝${d}</button>`).join('')}</div></div>`:''}
  ${reqBlock(s)}
  ${missing?`<div class="warn">缺少${p.need}參考照<button class="k-btn k-btn--secondary" data-need="${p.need}">加入${p.need}照片</button><button class="k-btn k-btn--ghost" data-swap="${s.id}">沒有，改成斜側</button></div>`:''}
 </article>`}).join('');
 $$('.shot').forEach(card=>{const s=S.shots.find(x=>x.id==card.dataset.shot);
  card.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>{s.angle=b.dataset.angle;renderShots()});
  card.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{s.focus=b.dataset.focus;renderShots()});
  card.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{s.side=b.dataset.dir;renderShots()});
  const r=card.querySelector('[data-remove]');if(r)r.onclick=()=>{S.shots=S.shots.filter(x=>x!==s);renderAll()};
  const n=card.querySelector('[data-need]');if(n)n.onclick=()=>openLibrary(n.dataset.need);
  const sw=card.querySelector('[data-swap]');if(sw)sw.onclick=()=>{s.k='斜側';s.angle='斜側';renderShots()};
  card.querySelectorAll('[data-hold]').forEach(b=>b.onclick=()=>{s.hold=b.dataset.hold;renderShots()});
  card.querySelectorAll('[data-people]').forEach(b=>b.onclick=()=>{s.people=b.dataset.people;renderShots()});
  card.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{P.cat=b.dataset.cat;P.usage='';renderShots()});
  card.querySelectorAll('[data-usage]').forEach(b=>b.onclick=()=>{P.usage=b.dataset.usage;renderShots()});
  const keep=card.querySelector('[data-keep]');if(keep)keep.onchange=()=>{s.keepText=keep.checked};
  const wh=card.querySelector('[data-white]');if(wh)wh.onchange=()=>{s.white=wh.checked};
  /* Typing must not re-render the card (that would drop focus); only the status line updates. */
  card.querySelectorAll('[data-p]').forEach(inp=>inp.oninput=()=>{P[inp.dataset.p]=inp.value;refreshStatus()});
  const ft=card.querySelector('[data-focustext]');if(ft)ft.oninput=()=>{s.focusText=ft.value;refreshStatus()};
 });
 $$('.k-seg').forEach(seg=>{const b=seg.querySelector('[aria-checked="true"]');if(b){seg.style.setProperty('--k-seg-x',b.offsetLeft+'px');seg.style.setProperty('--k-seg-w',b.offsetWidth+'px')}});
 const n=S.shots.length,cost=n*pointsPerShot;
 $('#count').textContent=`共 ${n} 張`;
 const c=$('#cost');if(c.textContent!==cost+' 點'){c.textContent=cost+' 點';c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}
 $('#left').textContent=`製作後剩 ${pointBalance-cost} 點`;
 $('#addShot').disabled=n>=MAX_SHOTS;$('#addShot').textContent=n>=MAX_SHOTS?'已達 4 張上限':`＋ 新增一張（還可加 ${MAX_SHOTS-n} 張）`;
 $('#quick').hidden=n>1;
 refreshStatus();
}
function refreshStatus(){
 const idx=S.shots.findIndex(s=>missingOf(s).length);
 $$('.shot').forEach(card=>{const s=S.shots.find(x=>x.id==card.dataset.shot);const m=missingOf(s).length;card.classList.toggle('todo',!!m);card.classList.toggle('done',!m)});
 $('#next').disabled=!S.refs.length||idx>-1;
 $('#nextHint').textContent=!S.refs.length?'先加入參考照':idx>-1?`${idx===0?'主圖':'第 '+(idx+1)+' 張'}還需要：${missingOf(S.shots[idx]).join('、')}`:'';
}
function renderPresets(){
 $('#presets').innerHTML=PRESETS.filter(p=>p.k!=='主圖').map(p=>{const used=!p.multi&&S.shots.some(s=>s.k===p.k);const need=p.need&&!S.refs.some(r=>r.side===p.need);
  return `<button class="preset" data-preset="${p.k}" ${used?'disabled':''}><span class="shot-ic">${ic[p.ic]}</span><b>${p.k}${used?'（已加入）':''}${p.exp?'<span class="exp">實驗中</span>':''}</b><small>${p.desc}</small>${need?`<em>需要${p.need}參考照</em>`:p.k==='尺寸感'?'<em>需填尺寸</em>':p.k==='使用情境'?'<em>需選類別與用法</em>':''}</button>`}).join('');
 $$('[data-preset]').forEach(b=>b.onclick=()=>{S.shots.push(newShot(b.dataset.preset));closeSheet();renderAll();$('#shots').lastElementChild.scrollIntoView({behavior:'smooth',block:'nearest'})});
}
const openSheet=()=>{renderPresets();$('#sheetBg').hidden=false;$('#presets button:not(:disabled)')?.focus()};
const closeSheet=()=>{$('#sheetBg').hidden=true;$('#addShot').focus()};
function renderAll(){renderRefs();renderShots()}

function bind(){
 $('#v2Name').value=state.name;$('#v2Name').oninput=e=>state.name=e.target.value;
 $('#addShot').onclick=()=>{if(S.shots.length<MAX_SHOTS)openSheet()};
 $('#sheetClose').onclick=closeSheet;$('#sheetBg').onclick=e=>{if(e.target.id==='sheetBg')closeSheet()};
 $('#sheetBg').onkeydown=e=>{if(e.key==='Escape'){closeSheet();return}if(e.key==='Tab'){const items=[...$('#sheetBg').querySelectorAll('button:not(:disabled)')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
 $('#quickBtn').onclick=()=>{S.shots=[S.shots[0],...['斜側','背面','局部特寫'].map(newShot)];renderAll()};
 $('#upload').onclick=$('#emptyUpload').onclick=()=>$('#v2File').click();
 $('#v2File').onchange=e=>{const f=e.target.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){toast('請選擇 JPG、PNG 或 WebP 圖片');return}const url=URL.createObjectURL(f),item=ensureSource(url);lib.splice(lib.indexOf(item),1);lib.unshift(item);if(S.refs.length<MAX_REFS){S.refs.push({id:item.id,side:S.pendingSide||'正面',box:{l:25,t:18,w:50,h:66}});S.cur=item.id;S.pendingSide=null}renderAll();e.target.value=''};
 bindBox();renderAll();
}

/* Product box: drag to move, corner to resize; saved on the current reference. */
function bindBox(){const box=$('#box'),st=$('#v2Stage');let d=null;
 box.tabIndex=0;box.setAttribute('role','group');box.setAttribute('aria-label','商品範圍，方向鍵移動，Shift 加方向鍵調整大小');
 rangeLabelObserver?.disconnect();rangeLabelObserver=new ResizeObserver(positionRangeLabel);rangeLabelObserver.observe(st);rangeLabelObserver.observe(box);rangeLabelObserver.observe(box.querySelector('span'));
 box.onpointerdown=e=>{e.preventDefault();const r=st.getBoundingClientRect(),b=ref(S.cur).box;d={mode:e.target.id==='grip'?'size':'move',x:e.clientX,y:e.clientY,r,...b};box.setPointerCapture(e.pointerId)};
 box.onpointermove=e=>{if(!d)return;const b=ref(S.cur).box,dx=(e.clientX-d.x)/d.r.width*100,dy=(e.clientY-d.y)/d.r.height*100;
  if(d.mode==='move'){b.l=Math.max(0,Math.min(100-d.w,d.l+dx));b.t=Math.max(0,Math.min(100-d.h,d.t+dy))}else{b.w=Math.max(12,Math.min(100-d.l,d.w+dx));b.h=Math.max(12,Math.min(100-d.t,d.h+dy))}
  Object.assign(box.style,{left:b.l+'%',top:b.t+'%',width:b.w+'%',height:b.h+'%'});positionRangeLabel()};
 box.onpointerup=box.onpointercancel=()=>{d=null};
 box.onkeydown=e=>{const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta||!ref(S.cur))return;e.preventDefault();const b=ref(S.cur).box;if(e.shiftKey){b.w=Math.max(12,Math.min(100-b.l,b.w+delta[0]));b.h=Math.max(12,Math.min(100-b.t,b.h+delta[1]))}else{b.l=Math.max(0,Math.min(100-b.w,b.l+delta[0]));b.t=Math.max(0,Math.min(100-b.h,b.t+delta[1]))}Object.assign(box.style,{left:b.l+'%',top:b.t+'%',width:b.w+'%',height:b.h+'%'});positionRangeLabel()};
}


function init(){if(initialized)return;initialized=true;for(const source of [...new Set([...state.photos,...gallery.map(g=>g.src)])])ensureSource(source);S.refs=[];S.cur=null;state.name='';}

function valid(){return S.refs.length>0&&S.shots.length>0&&S.shots.every(s=>!missingOf(s).length)}
function commit(){if(!valid())return false;const previous=new Map(seriesShots.map(s=>[s.id,s])),angles={'正面':'front','斜側':'three','俯拍':'top','低角度':'low'};
 const converted=S.shots.map(s=>{const required=preset(s.k).need,r=(required?S.refs.find(r=>r.side===required):S.refs[0]),source=lib.find(x=>x.id===r.id).source,old=previous.get(s.id),b=r.box;
 return {...s,id:s.id,source,referenceId:r.id,referenceSide:r.side,box:{x:b.l,y:b.t,w:b.w,h:b.h},kind:s.k==='局部特寫'?'detail':'full',face:s.k==='背面'?'back':'front',angle:angles[s.angle],x:old?.x??50,y:old?.y??57,scale:old?.scale??65,background:old?.background?{...old.background}:undefined,typeName:s.k,side:s.side,focus:s.focus,focusText:s.focusText,product:{...P},done:true};});
 seriesShots.splice(0,seriesShots.length,...converted);state.photos=S.refs.map(r=>lib.find(x=>x.id===r.id).source);if(!seriesShots.some(s=>s.id===activeShotId))activeShotId=seriesShots[0].id;applySeriesShot();wizardEditing=null;return true;
}
function reset(){S.refs=[];S.cur=null;S.shots=[];S.seq=0;S.pendingSide=null;S.shots.push(newShot('主圖'));Object.assign(P,{cat:'',h:'',w:'',usage:'',usageText:''});initialized=false;}
function specs(s){const rows=[['照片類型',s.typeName||s.k],['參考照',s.referenceSide],['角度',cameraOptions.find(a=>a[0]===s.angle)?.[1]]];if(s.angle==='three')rows.push(['朝向','朝'+s.side]);if(s.k==='局部特寫')rows.push(['重點',s.focus==='其他'?s.focusText:s.focus]);if(s.k==='尺寸感'){rows.push(['高度',s.product.h+' 公分']);if(s.product.w)rows.push(['寬度',s.product.w+' 公分']);rows.push(['呈現',s.hold])}if(s.k==='使用情境')rows.push(['商品類別',s.product.cat],['使用方式',s.product.usage==='其他'?s.product.usageText:s.product.usage],['出現的人',s.people]);if(s.k==='主圖')rows.push(['純白背景',s.white?'開啟':'關閉']);if(s.k==='背面')rows.push(['保留標籤',s.keepText?'開啟':'關閉']);return '<dl class="v2-specs">'+rows.filter(([,v])=>v).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')+'</dl>'}
return {html(){init();return MARKUP},bind,commit,valid,reset,specs};

})();

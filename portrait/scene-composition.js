/* Backgrounds are interchangeable; foreground identity is always fitted, never cropped. */
const portraitSceneEntries=[
 {name:'明亮辦公室',tags:['求職','企業介紹'],note:'履歷、LinkedIn 與企業團隊介紹',color:'#e5e5df'},
 {name:'主管會議室',tags:['主管','商務'],note:'主管簡介、商務提案與公司官網',color:'#d2cbc1'},
 {name:'專業書房',tags:['顧問','知識品牌'],note:'顧問、講師與知識型個人品牌',color:'#d6cdbd'},
 {name:'創意工作室',tags:['設計','創作者'],note:'設計師、創作者與作品集介紹',color:'#dfd9cf'},
 {name:'咖啡館窗邊',tags:['親和','個人品牌'],note:'自由工作者、社群介紹與個人品牌',color:'#e0d1be'},
 {name:'都會街景',tags:['都會','自由工作'],note:'自由工作者、創業者與編輯形象',color:'#d0d5d7'},
 {name:'綠意庭園',tags:['自然','溫暖'],note:'生活品牌、親和形象與自我介紹',color:'#ccd4c3'},
 {name:'演講會場',tags:['講者','活動介紹'],note:'講者簡介、活動頁與專業分享',color:'#c4c8cf'},
 {name:'品牌展示間',tags:['創業','品牌經營'],note:'品牌創辦人、主理人與品牌故事',color:'#ddd7cc'},
 {name:'藝文長廊',tags:['藝術','專業形象'],note:'藝術、文化工作者與個人專訪',color:'#e5e1d9'}
].map((entry,sceneTile)=>({...entry,image:'assets/portrait-scenes-atlas-v1.webp',sceneTile}));
portraitSceneEntries.push(...[{"name": "柔白弧形攝影棚", "image": "assets/portrait-scene-extra-01-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "暖米色亞麻棚景", "image": "assets/portrait-scene-extra-02-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "石灰灰泥牆", "image": "assets/portrait-scene-extra-03-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "深藍漸層棚景", "image": "assets/portrait-scene-extra-04-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "墨綠典雅牆", "image": "assets/portrait-scene-extra-05-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "陶土暖色拱廊", "image": "assets/portrait-scene-extra-06-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "落地窗辦公室", "image": "assets/portrait-scene-extra-07-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "木質共享辦公室", "image": "assets/portrait-scene-extra-08-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "現代圖書館", "image": "assets/portrait-scene-extra-09-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "黑白極簡藝廊", "image": "assets/portrait-scene-extra-10-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "明亮設計工坊", "image": "assets/portrait-scene-extra-11-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "植物玻璃溫室", "image": "assets/portrait-scene-extra-12-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "日式庭院長廊", "image": "assets/portrait-scene-extra-13-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "城市屋頂露台", "image": "assets/portrait-scene-extra-14-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "科技玻璃走廊", "image": "assets/portrait-scene-extra-15-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "溫暖咖啡書店", "image": "assets/portrait-scene-extra-16-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "音樂錄音工作室", "image": "assets/portrait-scene-extra-17-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "建築清水模空間", "image": "assets/portrait-scene-extra-18-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "海邊白牆露台", "image": "assets/portrait-scene-extra-19-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}, {"name": "精品旅館休憩廳", "image": "assets/portrait-scene-extra-20-v1.webp", "tags": ["形象", "場景"], "note": "新增形象照背景"}]);
const portraitImageCache={};
function portraitImage(src){return portraitImageCache[src]||(portraitImageCache[src]=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{delete portraitImageCache[src];reject(new Error(src))};im.src=src}))}
async function drawSceneCards(){
 const canvases=[...document.querySelectorAll('canvas[data-scene-tile]')];if(!canvases.length)return;
 let im;try{im=await portraitImage('assets/portrait-scenes-atlas-v1.webp')}catch{notify('情境圖片載入失敗，請重新整理');return}
 const sw=im.width/5,sh=im.height/2;
 for(const c of canvases){if(!c.isConnected)continue;const tile=Number(c.dataset.sceneTile);c.width=Math.round(sw);c.height=Math.round(sh);c.getContext('2d').drawImage(im,tile%5*sw,Math.floor(tile/5)*sh,sw,sh,0,0,c.width,c.height);c.dataset.ready='true'}
}
function coverPortraitBackground(ctx,im,sx,sy,sw,sh,w,h){const scale=Math.max(w/sw,h/sh),cw=w/scale,ch=h/scale;ctx.drawImage(im,sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,0,0,w,h)}
async function renderPortraitComposition(canvas,ratio,maxEdge=1280,variation=false){
 const token=(canvas._portraitVersion||0)+1;canvas._portraitVersion=token;
 const gender=state.gender==='男性'?'male':'female',bg=backgrounds[state.bg]||backgrounds[0];
 const tile=((state.style??0)+(variation?state.variation:0))%6;
 let person,scene;try{[person,scene]=await Promise.all([portraitImage('assets/portrait-'+gender+'-extended-v2.png'),bg.image?portraitImage(bg.image):Promise.resolve(null)])}catch{notify('人物或背景素材載入失敗，請重新整理');return false}
 if(!canvas.isConnected||canvas._portraitVersion!==token)return false;
 const [a,b]=ratio.split(':').map(Number);canvas.width=Math.round(maxEdge*a/Math.max(a,b));canvas.height=Math.round(maxEdge*b/Math.max(a,b));
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 if(scene){const sw=bg.sceneTile===undefined?scene.width:scene.width/5,sh=bg.sceneTile===undefined?scene.height:scene.height/2,sx=bg.sceneTile===undefined?0:bg.sceneTile%5*sw,sy=bg.sceneTile===undefined?0:Math.floor(bg.sceneTile/5)*sh;coverPortraitBackground(ctx,scene,sx,sy,sw,sh,w,h)}
 else{const colors=bg.color.match(/#[0-9a-f]{6}/gi)||['#e1e2de'];ctx.fillStyle=colors[0];ctx.fillRect(0,0,w,h);const light=ctx.createLinearGradient(0,0,w,h);light.addColorStop(0,colors.length>1?colors[1]:'#ffffff28');light.addColorStop(1,colors.length>2?colors[2]:'#172d3610');ctx.fillStyle=light;ctx.fillRect(0,0,w,h)}
 const sw=person.width/3,sh=person.height/2;
 // Keep the head near the top and reveal real generated torso/hips in tall frames.
 // Landscape and square frames crop the extended body naturally rather than moving a bust.
 const framing=Math.max(.98,Math.min(1.7,1.35*a/b));
 const centers={female:[326.5,262,230.5,306.5,258,236],male:[314,251.5,180.5,311.5,250,184]};
 const scale=h*framing/sh,pw=sw*scale,ph=sh*scale,x=w/2-centers[gender][tile]/512*sw*scale,y=h*.025;
 ctx.drawImage(person,tile%3*sw,Math.floor(tile/3)*sh,sw,sh,x,y,pw,ph);
 canvas.dataset.personFit='extended-top-anchored';canvas.dataset.personBounds=JSON.stringify({x,y,width:pw,height:ph,canvasWidth:w,canvasHeight:h});canvas.dataset.ratio=ratio;canvas.dataset.ready='true';return true;
}

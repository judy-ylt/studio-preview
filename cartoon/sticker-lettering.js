/* Dynamic sticker artwork: palettes belong to the illustration, not the app chrome. */
window.StickerLettering=(()=>{
 const chinese=t=>/[\u3400-\u9fff]/u.test(t),count=t=>Array.from(t.replace(/\s/g,'')).length;
 const choices=t=>chinese(t)&&count(t)<=6?['corner','vertical','shirt']:['corner','shirt'];
 const themes=[
  {name:'水彩感',ink:'#765141',accent:'#c87c56',pop:'#e2b563',paper:'#fff9ee',shade:'#c8a992'},
  {name:'扁平',ink:'#253e5b',accent:'#e76647',pop:'#f4bb42',paper:'#fffdf5',shade:'#c84d3f'},
  {name:'彩鉛感',ink:'#695047',accent:'#c96c4d',pop:'#769da8',paper:'#fff9e9',shade:'#b89c83'},
  {name:'黏土感',ink:'#704a3b',accent:'#c87957',pop:'#e7b85e',paper:'#fff2db',shade:'#aa6c4c'},
  {name:'漫畫',ink:'#222a38',accent:'#e25b48',pop:'#f3c856',paper:'#fffdf3',shade:'#222a38'},
  {name:'剪紙感',ink:'#35584e',accent:'#cf8065',pop:'#e3bb68',paper:'#fff3d8',shade:'#b69b7b'},
  {name:'幾何',ink:'#2c405a',accent:'#c9824c',pop:'#8b9967',paper:'#f5e9cf',shade:'#b7a783'}
 ];
 const family='"Yuanti TC", "Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", "PingFang TC", "Microsoft JhengHei", sans-serif';
 const fontFor=()=>family;
 const glyphCache=new Map(),personCache=new WeakMap();
 function resolve(text,layout='auto'){if(choices(text).includes(layout))return layout;return chinese(text)&&count(text)>=4&&count(text)<=6?'vertical':'corner'}
 function describe(text,layout){return {corner:'上揚大字',vertical:'直排跳字',shirt:'胸前大字'}[resolve(text,layout)]}
 function next(text,layout){const a=choices(text);return a[(a.indexOf(resolve(text,layout))+1)%a.length]}
 function theme(style){return themes[style]||themes[0]}
 function random(seed){let x=seed>>>0;return()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296}}
 function hash(text){return Array.from(text).reduce((a,c)=>(Math.imul(a,31)+c.codePointAt(0))|0,7)}
 function wrap(ctx,text,max){const tokens=text.match(/[A-Za-z0-9]+(?:['’][A-Za-z]+)?|\s+|[^\x00-\x7f]|./gu)||[],lines=[];let line='';for(const part of tokens){if(ctx.measureText(line+part).width<=max){line+=part;continue}if(line.trim()){lines.push(line.trim());line=''}for(const char of Array.from(part)){if(line&&ctx.measureText(line+char).width>max){lines.push(line.trim());line=''}line+=char}}if(line.trim())lines.push(line.trim());return lines}
 const palettes=[{id:'style',name:'跟隨畫風'},{id:'dark',name:'經典深色',ink:'#253e5b',outline:'#ffffff'},{id:'light',name:'亮白醒目',ink:'#ffffff',outline:'#253e5b'},{id:'warm',name:'活潑暖色',ink:'#df6545',outline:'#ffffff'}];
 const validColor=value=>/^#[0-9a-f]{6}$/i.test(value||'');
 function colors(item={},style=0){const p=palettes.find(p=>p.id===item.textPalette)||palettes[0];if(item.textPalette==='custom')return {ink:validColor(item.textInk)?item.textInk:theme(style).ink,outline:validColor(item.textOutline)?item.textOutline:'#ffffff'};return {ink:p.ink||theme(style).ink,outline:p.outline||'#ffffff'}}
 function sprite(char,size,ink,outline){
  const key=[char,size,ink,outline].join('|');if(glyphCache.has(key))return glyphCache.get(key);
  const edge=Math.ceil(size*3),cv=document.createElement('canvas');cv.width=cv.height=edge;const c=cv.getContext('2d'),x=edge/2,y=edge/2;c.font=`900 ${size}px ${family}`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  c.shadowColor='rgba(22,35,49,.2)';c.shadowBlur=3;c.shadowOffsetX=2;c.shadowOffsetY=5;c.strokeStyle=outline;c.lineWidth=size*.27;c.strokeText(char,x,y);c.shadowColor='transparent';c.fillStyle=ink;c.fillText(char,x,y);
  glyphCache.set(key,cv);if(glyphCache.size>350)glyphCache.delete(glyphCache.keys().next().value);return cv;
 }
 function mark(c,x,y,size,t,style,kind,turn){
  c.save();c.translate(x,y);c.rotate(turn);c.lineJoin='round';c.lineCap='round';c.fillStyle=t.pop;c.strokeStyle=t.ink;c.lineWidth=style===4?4:2;
  if(kind==='moon'){c.beginPath();c.arc(0,0,size*.7,.55,5.65);c.quadraticCurveTo(-size*.1,0,size*.59,size*.37);c.closePath();c.fill()}else if(kind==='bolt'){c.beginPath();c.moveTo(size*.15,-size);c.lineTo(-size*.65,size*.1);c.lineTo(-size*.05,size*.03);c.lineTo(-size*.2,size);c.lineTo(size*.65,-size*.2);c.lineTo(size*.05,-size*.1);c.closePath();c.fill();if(style===4)c.stroke()}else if(kind==='heart'){c.beginPath();c.moveTo(0,size*.55);c.bezierCurveTo(-size,-size*.05,-size*.65,-size,0,-size*.4);c.bezierCurveTo(size*.65,-size,size,-size*.05,0,size*.55);c.fill();if(style===4)c.stroke()}
  else if(style===3){c.beginPath();c.ellipse(0,0,size*.43,size*.6,0,0,Math.PI*2);c.fill();c.fillStyle=t.paper;c.beginPath();c.ellipse(-size*.12,-size*.2,size*.1,size*.18,.4,0,Math.PI*2);c.fill()}
  else if(style===6){c.beginPath();c.moveTo(-size*.7,size*.5);c.lineTo(0,-size);c.lineTo(size*.7,size*.5);c.closePath();c.fill();c.fillStyle=t.accent;c.beginPath();c.arc(size*.6,-size*.5,size*.24,0,Math.PI*2);c.fill()}else{if(style===0)c.globalAlpha=.7;c.beginPath();const points=style===5?10:8;for(let i=0;i<points;i++){const a=i*Math.PI*2/points,r=i%2?size*.25:size*(style===5?.9+Math.sin(i)*.12:1);c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();if(style===4)c.stroke()}
  if(style===2){c.globalAlpha=.5;c.translate(2,-2);c.stroke()}
  c.restore();
 }
 function decorate(ctx,text,{height=800,style=0,level='close',layout='auto'}={}){
  const t=theme(style),mode=resolve(text,layout),oy=(height-800)/2,kind=/晚安|睡|night|sleep/i.test(text)?'moon':/加油|衝|go|fight/i.test(text)?'bolt':/謝|愛|喜歡|辛苦|love|thank/i.test(text)?'heart':'star',bold=level==='bold';ctx.save();ctx.translate(0,oy);
  const positions=mode==='vertical'?[[682,126,26,.15],[235,160,18,-.2],[700,622,20,.3]]:[[94,422,22,-.2],[700,224,28,.2],[666,666,17,-.2]];
  positions.forEach(([x,y,n,a],i)=>mark(ctx,x,y,n*(bold?1.2:1),t,style,i===1?kind:'star',a));
  ctx.strokeStyle=t.accent;ctx.lineCap='round';ctx.lineWidth=style===2?3:5;
  if(style===0)ctx.globalAlpha=.6;
  const x=mode==='vertical'?650:88,y=mode==='vertical'?420:306;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*15,y+i*7);ctx.lineTo(x+9+i*17,y-22+i*5);ctx.stroke()}
  ctx.restore();
 }
 function personLayer(im){
  if(personCache.has(im))return personCache.get(im);const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0);const data=c.getImageData(0,0,im.width,im.height).data;let l=im.width,r=0,t=im.height,b=0;
  for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(data[(y*im.width+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
  if(r<=l||b<=t){l=t=0;r=im.width-1;b=im.height-1}const box={x:l,y:t,w:r-l+1,h:b-t+1};c.globalCompositeOperation='source-in';c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);const result={mask:cv,box};personCache.set(im,result);return result;
 }
 function drawCharacter(ctx,im,text,{height=800,style=0,level='close',layout='auto'}={}){
  const mode=resolve(text,layout),long=mode==='corner'&&count(text)>8,{mask,box}=personLayer(im),h=long?480:590,w=h*box.w/box.h,cx=mode==='vertical'?485:mode==='corner'?455:400,bottom=(height-800)/2+754,t=theme(style);
  ctx.save();ctx.translate(cx,bottom-h/2);ctx.rotate(mode==='vertical'?.035:mode==='corner'?.025:-.02);
  const white=document.createElement('canvas');white.width=mask.width;white.height=mask.height;const c=white.getContext('2d');c.drawImage(mask,0,0);c.globalCompositeOperation='source-in';c.fillStyle=t.paper;c.fillRect(0,0,white.width,white.height);
  const radius=style===0?7:style===5?12:10;ctx.shadowColor='rgba(55, 38, 25, .15)';ctx.shadowBlur=style===3?8:4;ctx.shadowOffsetY=4;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.drawImage(white,box.x,box.y,box.w,box.h,-w/2+Math.cos(a)*radius,-h/2+Math.sin(a)*radius,w,h)}ctx.shadowColor='transparent';ctx.drawImage(im,box.x,box.y,box.w,box.h,-w/2,-h/2,w,h);ctx.restore();
 }
 function paint(ctx,text,{width=800,height=800,layout='auto',style=0,level='close',textPalette='style',textInk,textOutline}={}){
  const mode=resolve(text,layout),t=theme(style),palette=colors({textPalette,textInk,textOutline},style),bold=false,n=count(text),emphasis=n>6?(text.match(/加油|快樂|謝謝|你好|收到|辛苦|OK|GO/i)?.[0]||''):'',oy=(height-800)/2;ctx.save();ctx.translate(0,oy);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  let size=mode==='vertical'?112:n<=3?156:n<=6?128:n<=10?112:96;const max=mode==='shirt'?530:640;let lines=[];
  if(mode==='vertical'){
   size=Math.min(120,535/n);ctx.translate(126,155);ctx.rotate(bold?-.12:-.07);
   Array.from(text.replace(/\s/g,'')).forEach((char,i)=>draw(char,Math.sin(i*1.8)*9,i*size*.98,size,i));
  }else{
   do{ctx.font=`900 ${size}px ${fontFor(style)}`;lines=wrap(ctx,text,max);if(lines.length<=2)break;size-=2}while(size>42);
   const measure=line=>Array.from(line).reduce((sum,ch)=>sum+ctx.measureText(ch).width*.92,0),lineHeight=size*1.02;
   const maxLine=Math.max(...lines.map(measure));const cx=mode==='shirt'?400:Math.max(115+maxLine/2,Math.min(width/2,360)),cy=mode==='shirt'?623:132+(lines.length-1)*lineHeight/2;
   ctx.translate(cx,cy);ctx.rotate(mode==='shirt'?-.095:bold?-.16:-.105);
   lines.forEach((line,row)=>{const chars=Array.from(line),total=measure(line);let x=-total/2;chars.forEach((char,i)=>{ctx.font=`900 ${size}px ${fontFor(style)}`;const advance=ctx.measureText(char).width*.92,beat=chars.length<=6?[1.05,.93,1.1,.97,1.04,.95][i%6]:1;draw(char,x+advance/2,(row-(lines.length-1)/2)*lineHeight+Math.sin(i*1.8)*size*.045,size*beat,i+row*7);x+=advance})});

  }
  ctx.restore();return mode;
  function draw(char,x,y,fontSize,i){if(!char.trim())return;const fs=Math.round(fontSize*(emphasis.includes(char)?1.08:1)),img=sprite(char,fs,palette.ink,palette.outline);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(i*2.1)*(bold?.075:.04));ctx.drawImage(img,-img.width/2,-img.height/2);ctx.restore()}
 }
 return {resolve,describe,next,paint,decorate,drawCharacter,palettes,colors,themeName:style=>theme(style).name};
})();

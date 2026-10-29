/* A fixed model per selected character type makes styling comparisons fair. */
const styleSheetCache={};
function styleSheetSource(){return 'assets/portrait-style-'+(state.gender==='男性'?'male':'female')+'-series.png'}
function loadStyleSheet(src){return styleSheetCache[src]||(styleSheetCache[src]=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{delete styleSheetCache[src];reject(new Error('Style examples unavailable'))};im.src=src}))}
async function drawStylePreviews(){
 if(!document.querySelector('canvas[data-style-preview]'))return;
 const src=styleSheetSource();let im;try{im=await loadStyleSheet(src)}catch{notify('風格示意照片載入失敗，請重新整理');return}
 document.querySelectorAll('canvas[data-style-preview]').forEach(canvas=>{
  if(!canvas.isConnected||canvas.dataset.sheet!==src)return;
  const id=Number(canvas.dataset.stylePreview),sw=im.width/3,sh=im.height/2;
  canvas.width=canvas.height=512;
  canvas.getContext('2d').drawImage(im,id%3*sw,Math.floor(id/3)*sh,sw,sh,0,0,512,512);
  canvas.dataset.ready='true';
 });
}

/* Independently generated outdoor plates. No runtime image generation requests. */
sceneLibrary.push(
 {id:20,name:'森林苔石',category:'自然',plate:'forest',prompt:'immersive real forest, mossy rocks, ferns and tall trees, dry stone placement ledge; adapt the environment scale to the uploaded product'},
 {id:21,name:'花叢花園',category:'自然',plate:'flowers',prompt:'immersive blooming garden of blush, ivory and lilac flowers, broad cream stone placement ledge; adapt the environment scale to the uploaded product'}
);
const naturalSceneCache={};
function naturalSceneSource(scene,angle){return 'assets/natural-'+sceneLibrary[scene].plate+'-'+angle+'-v1.webp'}
function loadNaturalPlate(scene,angle){const src=naturalSceneSource(scene,angle);return naturalSceneCache[src]||(naturalSceneCache[src]=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{delete naturalSceneCache[src];reject(new Error('自然場景載入失敗'))};im.src=src}))}
const originalSceneRect=sceneRect;
sceneRect=function(id,width=1402,height=1122,angle='three'){return sceneLibrary[id]?.plate?{x:0,y:0,w:width,h:height}:originalSceneRect(id,width,height,angle)};
const originalSceneVisual=sceneVisual;
sceneVisual=function(id,cls=''){if(!sceneLibrary[id]?.plate)return originalSceneVisual(id,cls);return `<span class="scene-swatch natural-swatch ${cls}" role="img" aria-label="${sceneLibrary[id].name}場景示意" style="background-image:url('${naturalSceneSource(id,state.angle)}');background-size:cover;background-position:center;filter:${sceneFilter()}"></span>`};
const originalScenePlate=scenePlate;
scenePlate=function(){return sceneLibrary[state.scene]?.plate?loadNaturalPlate(state.scene,state.angle):originalScenePlate()};
const originalDrawAnglePreview=drawAnglePreview;
drawAnglePreview=async function(){if(!sceneLibrary[state.scene]?.plate)return originalDrawAnglePreview();const canvas=document.querySelector('#anglePreview');if(!canvas)return;const scene=state.scene,angle=state.angle,request=(canvas._angleRequest||0)+1;canvas._angleRequest=request;
 try{const im=await loadNaturalPlate(scene,angle);if(!canvas.isConnected||canvas._angleRequest!==request)return;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.filter=sceneFilter();c.drawImage(im,0,0,canvas.width,canvas.height);c.filter='none';paintStudyCylinder(c,studyProjector(angle,canvas.width,canvas.height));canvas.dataset.ready='true';canvas.setAttribute('aria-label',sceneLibrary[scene].name+'・'+cameraOptions.find(a=>a[0]===angle)[1]+'場景參考，圓柱為位置示意');}catch{toast('自然場景載入失敗，請重新選擇')}
};

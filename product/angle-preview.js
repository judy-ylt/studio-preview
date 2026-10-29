/* Pre-generated photographic angle references. Switching angle or color never calls an AI API.
   The uploaded product is not reconstructed: the neutral cylinder is a scene reference only. */
const angleSceneAssets={three:'assets/scene-library-v1.webp',front:'assets/scenes-front-v1.webp',top:'assets/scenes-top-v1.webp',low:'assets/scenes-low-v1.webp'};
const angleSceneImages={};
function loadAngleScene(angle){if(!angleSceneImages[angle])angleSceneImages[angle]=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{delete angleSceneImages[angle];reject(new Error('angle image'))};im.src=angleSceneAssets[angle]||angleSceneAssets.three});return angleSceneImages[angle]}
async function drawAnglePreview(){const canvas=document.querySelector('#anglePreview');if(!canvas)return;const angle=state.angle,scene=state.scene,warmth=state.warmth,request=(canvas._angleRequest||0)+1;canvas._angleRequest=request;canvas.dataset.loading='true';
 try{const im=await loadAngleScene(angle);if(!canvas.isConnected||canvas._angleRequest!==request)return;const c=canvas.getContext('2d'),r=sceneRect(scene,im.width,im.height,angle);c.clearRect(0,0,canvas.width,canvas.height);c.filter=sceneFilter();c.drawImage(im,r.x,r.y,r.w,r.h,0,0,canvas.width,canvas.height);c.filter='none';canvas.dataset.ready='true';canvas.setAttribute('aria-label',cameraOptions.find(a=>a[0]===angle)[1]+'場景參考，'+toneLabel()+'，圓柱代表商品');delete canvas.dataset.loading;
 }catch{if(!canvas.isConnected||canvas._angleRequest!==request)return;delete canvas.dataset.loading;const c=canvas.getContext('2d');c.fillStyle='#f5f3ed';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#52676d';c.font='24px sans-serif';c.textAlign='center';c.fillText('預覽載入失敗，請重新選擇角度',canvas.width/2,canvas.height/2);canvas.setAttribute('aria-label','場景參考載入失敗')}
}
/* Only the draggable composition marker uses geometry. Cylindrical proportions stay fixed. */
function studyProjector(angle,w,h){const cameras={front:[0,1.05,7.5],three:[4,3,6.5],top:[0,8,.01],low:[2.8,.35,7.5]},eye=cameras[angle]||cameras.three,target=[0,.65,0],up=angle==='top'?[0,0,-1]:[0,1,0];
 const subtract=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),unit=a=>{const n=Math.hypot(...a);return a.map(v=>v/n)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const forward=unit(subtract(target,eye)),right=unit(cross(forward,up)),vertical=cross(right,forward),f=w*2.1;return{eye,project:p=>{const v=subtract(p,eye),z=dot(v,forward);return[w*.5+dot(v,right)*f/z,h*.52-dot(v,vertical)*f/z]},dot,subtract};
}
function paintStudyCylinder(c,view,r=.7,height=1.3){
 const ring=(radius,y,dx=0,dz=0)=>Array.from({length:129},(_,i)=>{const t=i/128*Math.PI*2;return[radius*Math.cos(t)+dx,y,radius*Math.sin(t)+dz]});
 const polygon=(points,fill,stroke=false)=>{c.beginPath();points.map(view.project).forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=fill;c.lineWidth=.8;c.stroke()}};
 // A soft cast shadow plus a tight contact shadow anchor the object to the surface.
 c.save();c.filter='blur(7px)';c.shadowColor='#31291e26';c.shadowBlur=18;polygon(ring(r*1.08,.001,.20,.15),'#31291e20');c.filter='blur(3px)';c.shadowBlur=5;polygon(ring(r*.95,.003,.02,.02),'#201d1938');c.restore();
 const sides=[],light=[-.64,.38,.69],count=256;
 for(let i=0;i<count;i++){
  const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2,m=(a+b)/2,normal=[Math.cos(m),0,Math.sin(m)],center=[r*Math.cos(m),height/2,r*Math.sin(m)];
  const toEye=view.subtract(view.eye,center);if(view.dot(normal,toEye)<=0)continue;
  const distance=Math.hypot(...toEye),eye=toEye.map(v=>v/distance),diffuse=Math.max(0,view.dot(normal,light));
  const half=light.map((v,j)=>v+eye[j]),hn=Math.hypot(...half),spec=Math.pow(Math.max(0,view.dot(normal,half.map(v=>v/hn))),28);
  const shade=Math.min(253,Math.round(148+99*Math.pow(diffuse,.7)+spec*18));
  const fill=`rgb(${shade},${Math.max(0,shade-3)},${Math.max(0,shade-11)})`;
  sides.push({distance,points:[[r*.985*Math.cos(a),0,r*.985*Math.sin(a)],[r*.985*Math.cos(b),0,r*.985*Math.sin(b)],[r*Math.cos(b),height*.975,r*Math.sin(b)],[r*Math.cos(a),height*.975,r*Math.sin(a)]],fill});
 }
 sides.sort((a,b)=>b.distance-a.distance).forEach(s=>polygon(s.points,s.fill,true));
 // The cap is projected by the same camera, never a stretched screen-space ellipse.
 if(view.eye[1]>height){
  const projected=ring(r,height).map(view.project),xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
  const cap=c.createRadialGradient(left+(right-left)*.28,top+(bottom-top)*.25,1,(left+right)/2,(top+bottom)/2,Math.max(right-left,bottom-top)*.7);
  cap.addColorStop(0,'#fffdf2');cap.addColorStop(.55,'#eee9da');cap.addColorStop(1,'#c9c1b0');
  polygon(ring(r,height*.975),'#b9b19f');polygon(ring(r*.985,height),cap);
  c.beginPath();ring(r*.985,height).map(view.project).forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.strokeStyle='#ffffff88';c.lineWidth=1.2;c.stroke();
 }
 // A curved darker rim makes the grounded lower edge readable at eye-level too.
 c.beginPath();let pen=false;for(let i=0;i<=256;i++){const t=i/256*Math.PI*2,p=[r*.985*Math.cos(t),.008,r*.985*Math.sin(t)];if(view.dot([Math.cos(t),0,Math.sin(t)],view.subtract(view.eye,p))>0){const point=view.project(p);if(pen)c.lineTo(...point);else c.moveTo(...point);pen=true}else pen=false}c.strokeStyle='#8f887a66';c.lineWidth=1;c.stroke();
}

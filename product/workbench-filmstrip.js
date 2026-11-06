/* Keeps the selected shot visible when the strip is wider than the preview, and moves the left step hint. */
(()=>{
const $=s=>document.querySelector(s),list=$('#shotList'),preview=$('#preview'),stepProduct=$('#stepProduct'),stepShots=$('#stepShots');
let last=null;
new MutationObserver(()=>{const selected=list.querySelector('.shot-select.active'),id=selected?.dataset.shot;if(!selected||id===last)return;last=id;const item=selected.closest('.shot-item'),left=item.offsetLeft-list.offsetLeft,right=left+item.offsetWidth;if(left<list.scrollLeft)list.scrollLeft=left;else if(right>list.scrollLeft+list.clientWidth)list.scrollLeft=right-list.clientWidth}).observe(list,{childList:true});
const syncSteps=()=>{const ready=!preview.hidden;stepProduct.toggleAttribute('aria-current',false);stepShots.toggleAttribute('aria-current',false);(ready?stepShots:stepProduct).setAttribute('aria-current','step');stepShots.disabled=!ready;$('#stepShotsHint').hidden=!ready};
new MutationObserver(syncSteps).observe(preview,{attributes:true,attributeFilter:['hidden']});syncSteps();
stepProduct.onclick=()=>{const name=$('#inlineProductName');if(name)name.focus();else $('#upload').click()};
stepShots.onclick=()=>$('#tab-brief').click();
})();

/* Keep the ROI label within the photo, including keyboard and resize changes. */
let roiLabelObserver;
function positionProductRangeLabel(){
 const area=document.querySelector('#selectionPhoto'),box=document.querySelector('#productBox'),label=box?.querySelector('span');if(!area||!box||!label)return;
 const gap=4,pad=3,h=label.offsetHeight,w=label.offsetWidth;
 const above=box.offsetTop,below=area.clientHeight-box.offsetTop-box.offsetHeight;
 let top,side;
 if(above>=h+gap){top=-h-gap;side='above';}
 else if(below>=h+gap){top=box.offsetHeight+gap;side='below';}
 else{top=above>=below?pad:Math.max(pad,box.clientHeight-h-pad);side='inside';}
 const absoluteLeft=Math.max(pad,Math.min(area.clientWidth-w-pad,box.offsetLeft));
 label.style.top=top+'px';label.style.left=(absoluteLeft-box.offsetLeft)+'px';label.dataset.side=side;
}
const bindSelectionBeforeLabel=bindSelection;
bindSelection=function(){
 bindSelectionBeforeLabel();roiLabelObserver?.disconnect();
 const area=document.querySelector('#selectionPhoto'),box=document.querySelector('#productBox');if(!area||!box)return;
 for(const event of ['pointermove','keydown'])box.addEventListener(event,positionProductRangeLabel);
 roiLabelObserver=new ResizeObserver(positionProductRangeLabel);roiLabelObserver.observe(area);roiLabelObserver.observe(box);
 positionProductRangeLabel();
};
window.addEventListener('resize',positionProductRangeLabel);
if(document.querySelector('#productBox'))bindSelection();

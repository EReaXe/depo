const bindings=new WeakMap();
export function sheetGestureAction({distance,expanded,height}){
  if(distance>Math.max(100,height*.35))return 'close';
  if(distance>80)return expanded?'collapse':'close';
  if(distance < -40)return 'expand';
  return 'reset';
}
export function attachSheetDrag(dialog,{close=()=>dialog.close()}={}){
  bindings.get(dialog)?.();
  let handle=dialog.querySelector('.sheetGrabber');
  if(!handle){
    const top=document.createElement('div');top.className='sheetTop';
    top.innerHTML='<button type="button" class="sheetGrabber"><span></span></button>';
    dialog.prepend(top);handle=top.firstElementChild;
  }
  const controller=new AbortController(),options={signal:controller.signal};
  let gesture=null,suppressClick=false;
  function reset(){dialog.style.removeProperty('height');dialog.style.removeProperty('transform');dialog.classList.remove('sheetDragging');gesture=null;}
  function expand(value){dialog.classList.toggle('expanded',value);handle.setAttribute('aria-expanded',String(value));handle.setAttribute('aria-label',value?'Paneli küçült':'Paneli genişlet');}
  function cleanup(){reset();controller.abort();bindings.delete(dialog);}
  bindings.set(dialog,cleanup);expand(dialog.classList.contains('expanded'));
  handle.addEventListener('click',e=>{if(suppressClick&&e.detail!==0){suppressClick=false;e.preventDefault();return;}expand(!dialog.classList.contains('expanded'));},options);
  handle.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    reset();suppressClick=false;
    gesture={id:e.pointerId,start:e.clientY,height:dialog.getBoundingClientRect().height,expanded:dialog.classList.contains('expanded'),distance:0};
    handle.setPointerCapture(e.pointerId);dialog.classList.add('sheetDragging');
  },options);
  handle.addEventListener('pointermove',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const dy=e.clientY-gesture.start;gesture.distance=dy;
    if(Math.abs(dy)>6)suppressClick=true;
    if(dy>=0){dialog.style.removeProperty('height');dialog.style.transform=`translateY(${dy}px)`;}
    else{dialog.style.transform='none';dialog.style.height=`${gesture.height-dy}px`;}
  },options);
  handle.addEventListener('pointerup',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const action=sheetGestureAction({distance:e.clientY-gesture.start,expanded:gesture.expanded,height:gesture.height});
    reset();
    if(action==='close')close();else if(action!=='reset')expand(action==='expand');
  },options);
  handle.addEventListener('pointercancel',()=>{suppressClick=true;reset();},options);
  handle.addEventListener('lostpointercapture',()=>{if(gesture){suppressClick=true;reset();}},options);
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog||!dialog.open)return;
    const rect=dialog.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close();
  },options);
  dialog.addEventListener('close',cleanup,{...options,once:true});
}

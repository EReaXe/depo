import test from 'node:test';
import assert from 'node:assert/strict';
import {attachSheetDrag,sheetGestureAction} from '../assets/js/ui/sheet-drag.js';
function fixture(close){
  const handle=new EventTarget(),dialog=new EventTarget(),classes=new Set();
  handle.setAttribute=(name,value)=>{handle[name]=value;};handle.setPointerCapture=()=>{};
  dialog.querySelector=()=>handle;dialog.getBoundingClientRect=()=>({height:600});
  dialog.style={removeProperty(name){delete this[name];}};
  dialog.classList={contains:name=>classes.has(name),add:name=>classes.add(name),remove:name=>classes.delete(name),toggle(name,value){if(value)classes.add(name);else classes.delete(name);}};
  attachSheetDrag(dialog,{close});
  const event=(type,y,extra={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{clientY:y,pointerId:1,isPrimary:true,button:0,detail:1,...extra});handle.dispatchEvent(e);};
  return {handle,dialog,event};
}
test('Panel hareketi: yukarı genişler, geniş panel önce küçülür, uzun aşağı hareket kapanır',()=>{
  assert.equal(sheetGestureAction({distance:-60,expanded:false,height:600}),'expand');
  assert.equal(sheetGestureAction({distance:90,expanded:true,height:600}),'collapse');
  assert.equal(sheetGestureAction({distance:90,expanded:false,height:600}),'close');
  assert.equal(sheetGestureAction({distance:250,expanded:true,height:600}),'close');
  assert.equal(sheetGestureAction({distance:5,expanded:false,height:600}),'reset');
});
test('Panel parmağı takip eder; sürükleme sonrasındaki click genişlemeyi geri almaz',()=>{
  const {handle,dialog,event}=fixture(()=>assert.fail('Kapanmamalı'));
  event('pointerdown',200);event('pointermove',130);assert.equal(dialog.style.height,'670px');
  event('pointerup',130);assert.equal(dialog.classList.contains('expanded'),true);
  event('click',130);assert.equal(handle['aria-expanded'],'true');
  event('click',130,{detail:0});assert.equal(handle['aria-expanded'],'false');
});
test('İptal edilen sürükleme paneli kapatmaz; aşağı sürükleme mevcut kapatma kontrolünü çağırır',()=>{
  let calls=0;const {dialog,event}=fixture(()=>{calls++;});
  event('pointerdown',100);event('pointermove',220);assert.equal(dialog.style.transform,'translateY(120px)');
  event('pointercancel',220);assert.equal(calls,0);assert.equal(dialog.style.transform,undefined);
  event('pointerdown',100);event('pointermove',220);event('pointerup',220);assert.equal(calls,1);
});

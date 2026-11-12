import test from 'node:test';
import assert from 'node:assert/strict';
import {createInstallController,installationGuide} from '../assets/js/ui/install.js';
function fixture({standalone=false}={}){
  const button=new EventTarget();button.querySelector=()=>null;
  const events=new EventTarget(),display={matches:standalone,addEventListener(type,handler){this.change=handler;}};
  let guides=0,installed=0;
  createInstallController({button,events,display,device:{},onGuide:()=>guides++,onInstalled:()=>installed++});
  return {button,events,display,get guides(){return guides;},get installed(){return installed;}};
}
test('Kurulum olayı olmayan tarayıcıda görünür seçenek çalışan rehberi açar',()=>{
  const f=fixture();assert.equal(f.button.hidden,false);assert.equal(f.button.disabled,false);f.button.dispatchEvent(new Event('click'));assert.equal(f.guides,1);
});
test('Hazır kurulum olayı bir kez kullanılır; iptal yüklenmiş sayılmaz',async()=>{
  const f=fixture();let prompts=0;const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{prompts++;return {outcome:'dismissed'};};f.events.dispatchEvent(e);assert.equal(e.defaultPrevented,true);
  f.button.dispatchEvent(new Event('click'));await Promise.resolve();await Promise.resolve();assert.equal(prompts,1);assert.equal(f.installed,0);assert.equal(f.button.disabled,false);
  f.button.dispatchEvent(new Event('click'));assert.equal(prompts,1);assert.equal(f.guides,1);
});
test('Yüklendi olayı ve standalone görünüm tekrar yükleme eylemini devre dışı bırakır',()=>{
  const f=fixture();f.events.dispatchEvent(new Event('appinstalled'));assert.equal(f.installed,1);assert.equal(f.button.textContent,'Uygulama yüklü');assert.equal(f.button.disabled,true);
  const standalone=fixture({standalone:true});assert.equal(standalone.button.disabled,true);standalone.button.dispatchEvent(new Event('click'));assert.equal(standalone.guides,0);
});
test('Kurulum isteği hata verirse rehber açılır ve düğme kullanılabilir kalır',async()=>{
  const f=fixture(),e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{throw Error('Unavailable');};f.events.dispatchEvent(e);f.button.dispatchEvent(new Event('click'));await Promise.resolve();await Promise.resolve();assert.equal(f.guides,1);assert.equal(f.button.disabled,false);
});
test('iPhone/iPad, Android ve güvensiz adres için uygun kurulum adımları gösterilir',()=>{
  assert.match(installationGuide({userAgent:'iPhone'}).steps.join(' '),/Ana Ekrana Ekle/);
  assert.match(installationGuide({platform:'MacIntel',maxTouchPoints:5}).note,/iPad/);
  assert.match(installationGuide({userAgent:'Android'}).steps.join(' '),/Chrome/);
  assert.match(installationGuide({secure:false}).note,/kullanılamıyor/);
});

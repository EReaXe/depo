import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createThemeController,themeKey} from '../assets/js/ui/theme.js';
function fixture({saved=null,dark=false,denied=false}={}){
  const root={dataset:{},style:{}},meta={setAttribute(name,value){this[name]=value;}};
  let changed;
  const media={matches:dark,addEventListener(type,listener){changed=listener;}};
  const storage={getItem(){if(denied)throw Error('Blocked');return saved;},setItem(key,value){if(denied)throw Error('Blocked');assert.equal(key,themeKey);saved=value;}};
  const controller=createThemeController({root,media,meta,storage});
  return {root,meta,controller,storage,device(value){media.matches=value;changed();}};
}
test('Varsayılan cihaz temasını izler ve cihaz değişikliklerine anında uyar',()=>{
  const f=fixture({dark:true});assert.equal(f.controller.getPreference(),'system');assert.equal(f.root.dataset.theme,'dark');assert.equal(f.meta.content,'#1c1c1e');
  f.device(false);assert.equal(f.root.dataset.theme,'light');assert.equal(f.root.style.colorScheme,'light');
});
test('Açık/koyu seçimi cihazdan bağımsızdır ve sonraki açılışta korunur',()=>{
  const f=fixture({dark:true});assert.equal(f.controller.setPreference('light'),true);f.device(true);assert.equal(f.root.dataset.theme,'light');
  f.controller.restore();assert.equal(f.controller.getPreference(),'light');
  f.controller.setPreference('dark');f.device(false);assert.equal(f.root.dataset.theme,'dark');
  f.controller.setPreference('system');assert.equal(f.root.dataset.theme,'light');f.device(true);assert.equal(f.root.dataset.theme,'dark');
});
test('Geçersiz veya erişilemeyen tercih cihaz temasına döner; saklama hatası başarı sayılmaz',()=>{
  const invalid=fixture({saved:'unknown',dark:true});assert.equal(invalid.controller.getPreference(),'system');assert.equal(invalid.root.dataset.theme,'dark');
  assert.equal(invalid.controller.setPreference('unknown'),false);assert.equal(invalid.controller.getPreference(),'system');
  const denied=fixture({denied:true});assert.equal(denied.controller.setPreference('dark'),false);assert.equal(denied.root.dataset.theme,'dark');
});
test('İlk çizim betiği saklanan temayı veya cihaz temasını hata vermeden uygular',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for(const [saved,deviceDark,denied,expected] of [['dark',false,false,'dark'],['light',true,false,'light'],[null,true,false,'dark'],['unknown',false,false,'light'],[null,true,true,'dark']]){
    const root={dataset:{},style:{}},meta={setAttribute(name,value){this[name]=value;}};
    vm.runInNewContext(code,{document:{documentElement:root,querySelector:()=>meta},localStorage:{getItem(){if(denied)throw Error('Blocked');return saved;}},matchMedia:()=>({matches:deviceDark})});
    assert.equal(root.dataset.theme,expected);assert.equal(root.style.colorScheme,expected);
  }
  assert.ok(html.indexOf('<script>')<html.indexOf('./assets/css/style.css'));
});

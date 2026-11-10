import {recordDetails} from '../assets/js/core/refill.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {calculate} from '../assets/js/core/calc.js';
import {brands,vehicleDetails} from '../assets/js/data/vehicles.js';
import {homeCardMarkup} from '../assets/js/ui/home-card.js';
import {vehicleProperties} from '../assets/js/ui/panels.js';
import {checkProject} from '../scripts/check.mjs';

const vehicle={id:'test',name:'Opel Corsa',brand:'Opel',model:'Corsa',year:2006,fuel:'Benzin + LPG',currentKm:1000,plate:'',color:'Gri',transmission:'Otomatik'};
const record=(km,litres,amount,full)=>({km,litres,amount,full});

test('Kısmi dolumlar tamamlanan aralığa dahil, son açık aralık hariç',()=>{
  const result=calculate([record(100,40,2000,true),record(300,10,500,false),record(600,20,1100,true),record(700,10,600,false)]);
  assert.equal(result.consumption,6);assert.equal(result.cost,3.2);assert.equal(result.distance,500);assert.equal(result.spent,4200);
});
test('Tüketim aralıkların mesafelerine göre ağırlıklıdır',()=>{
  const result=calculate([record(1000,45,1000,true),record(1100,10,500,true),record(2000,45,2250,true)]);
  assert.equal(result.consumption,5.5);assert.equal(result.cost,2.75);
});
test('Eksik dolumlarda sonuç üretilmez; sıralama bağımsızdır',()=>{
  assert.equal(calculate([]).cost,null);assert.equal(calculate([record(100,10,500,true)]).consumption,null);
  assert.equal(calculate([record(600,30,1500,true),record(100,40,2000,true)]).consumption,6);
});
test('Eski araçlar ve yeni detaylar JSON yedeği turunda korunur',()=>{
  const source=readFileSync(new URL('../assets/js/app.js',import.meta.url),'utf8');
  const fn=source.slice(source.indexOf('function validate(s)'),source.indexOf('function toast('));
  const validate=new Function('vehicleDetails','recordDetails',fn+';return validate;')(vehicleDetails,recordDetails);
  const state={vehicles:[vehicle,{id:'old',name:'Eski araç'}],records:[],selected:'test'};
  assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state);
  assert.throws(()=>validate({...state,vehicles:[vehicle,vehicle]}));
});
test('Geçersiz araç detayları reddedilir',()=>{
  for(const patch of [{year:1800},{currentKm:-1},{fuel:'Geçersiz'},{brand:'Geçersiz'},{model:''},{transmission:'Geçersiz'}])assert.throws(()=>vehicleDetails({...vehicle,...patch}));
});
test('Kart gerçek kilometreyi gösterir; girilen HTML metin olarak kalır',()=>{
  const html=homeCardMarkup({...vehicle,model:'<script>'},[record(1500,30,1500,true)]);
  assert.ok(html.includes('1.500'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
  const properties=Object.fromEntries(vehicleProperties(vehicle,[]));assert.equal(properties.Motor,null);assert.equal(properties.Kilometre,'1.000 km');
});
test('Beta kilitleri ve yerel marka logoları korunur',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/data-screen="reports" disabled/);assert.match(html,/data-screen="vehicles" disabled/);assert.match(html,/id="notifications"[^>]*disabled/);
  for(const brand of brands)assert.ok(existsSync(new URL(`../assets/brands/${brand.slug}.${brand.slug==='togg'?'svg':'png'}`,import.meta.url)));
});
test('Yayın yolları, modül importları ve çevrimdışı dosyalar eksiksiz',()=>assert.ok(checkProject()));

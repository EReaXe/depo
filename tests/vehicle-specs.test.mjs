import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveVehicleSpecs,vehicleSpecs,specSources} from '../assets/js/data/vehicle-specs.js';
import {vehicleProperties} from '../assets/js/ui/panels.js';
const clio={brand:'Renault',model:'Clio',year:2024,fuel:'Benzin',transmission:''};
test('Kesin ortak alanlar dolar; vites/motor belirsizken farklı tüketim seçilmez',()=>{
  const {values:v}=resolveVehicleSpecs(clio);
  assert.equal(v.body,'Hatchback');assert.equal(v.engine,'1,0 L · 999 cm³');assert.equal(v.tankLitres,42);assert.equal(v.combined,null);
  assert.deepEqual(resolveVehicleSpecs({...clio,transmission:'Otomatik'}).values.combined,[6,6.3]);
  assert.equal(resolveVehicleSpecs({...clio,transmission:'Manuel'}).values.combined,null);
});
test('Aynı modelde çekişe göre değişen depo ve tüketim uydurulmaz',()=>{
  const {values:v}=resolveVehicleSpecs({brand:'Chery',model:'Tiggo 7',year:2026,fuel:'Benzin',transmission:'Otomatik'});
  assert.equal(v.body,'SUV');assert.equal(v.tankLitres,null);assert.equal(v.combined,null);assert.match(v.engine,/1,6 Turbo/);
});
test('Yakıt, yıl, model veya vites uyumsuzluğu başka versiyonun bilgisini getirmez',()=>{
  for(const patch of [{year:2023},{fuel:'Dizel'},{fuel:'Benzin + LPG'},{model:'Clio Sport Tourer'},{transmission:'Yarı otomatik'}])assert.equal(resolveVehicleSpecs({...clio,...patch}).matched,false);
  assert.equal(resolveVehicleSpecs({brand:'Chery',model:'Kimo',year:2024,fuel:'Hibrit (Dizel)'}).matched,false);
  assert.equal(resolveVehicleSpecs({name:'Renault Clio'}).matched,false);
});
test('Fabrika verisi kullanıcı kaydını değiştirmez; WLTP şehir/yol yerine yazılmaz',()=>{
  const vehicle={...clio,fuel:'Hibrit (Benzin)'},before=structuredClone(vehicle);
  const rows=Object.fromEntries(vehicleProperties(vehicle,[]));
  assert.equal(rows.Depo,'39 L');assert.equal(rows['Şehir / Yol'],null);assert.equal(rows['Fabrika birleşik'],'4,8 L/100 km (WLTP)');assert.deepEqual(vehicle,before);
  const invalid=Object.fromEntries(vehicleProperties({brand:'Chery',model:'Kimo',year:2024,fuel:'Hibrit (Dizel)'},[]));assert.equal(invalid.Motor,null);
});
test('Şehir/yol yalnız kaynakta ayrı ve tüm eşleşmelerde aynı NEDC verisi varsa çözülür',()=>{
  const data=[{...clio,urban:7,extraUrban:5,cycle:'NEDC',source:'test'}];
  assert.equal(resolveVehicleSpecs(clio,data).values.urban,7);
  assert.equal(resolveVehicleSpecs(clio,[...data,{...data[0],urban:8}]).values.urban,null);
  assert.equal(resolveVehicleSpecs(clio,[...data,{...data[0],urban:undefined}]).values.urban,null);
});
test('Katalog kayıtlarının kaynakları, birimleri ve açık yıl kapsamı geçerlidir',()=>{
  for(const row of vehicleSpecs){assert.ok(specSources[row.source]?.url.startsWith('https://'));assert.ok(Number.isInteger(row.year));assert.ok(row.tankLitres>0);assert.ok(row.combined[0]<=row.combined[1]);}
});

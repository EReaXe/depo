import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createQuickRecord,fuelChoices,parseDecimal,latestUnitPrice,recordDetails} from '../assets/js/core/refill.js';
import {vehicleDetails} from '../assets/js/data/vehicles.js';
import {calculate} from '../assets/js/core/calc.js';
const vehicle={id:'car',name:'Opel Corsa',fuel:'Benzin + LPG',currentKm:1000};
const input={vehicle,records:[],values:{fuel:'LPG',amount:'1200,50',unitPrice:'30,5',km:'1500',full:true},id:'fill',date:'2026-11-10'};
test('Çift yakıtta yalnız LPG ve Benzin; elektrikli araçta sıvı yakıt yok',()=>{
  assert.deepEqual(fuelChoices(vehicle),['LPG','Benzin']);assert.deepEqual(fuelChoices({fuel:'Elektrik'}),[]);assert.deepEqual(fuelChoices({fuel:'Hibrit (Dizel)'}),['Dizel']);
});
test('Türkçe ondalık girilir, tutar/fiyat üzerinden hassas litre saklanır',()=>{
  const r=createQuickRecord(input);assert.equal(r.amount,1200.5);assert.equal(r.litres,1200.5/30.5);assert.equal(r.fuel,'LPG');assert.equal(r.unitPrice,30.5);assert.ok(r.full);
  assert.equal(parseDecimal('45.25'),45.25);assert.equal(parseDecimal('45,25'),45.25);assert.ok(Number.isNaN(parseDecimal('1.200,50')));
});
test('Sıfır/bozuk fiyat, uyumsuz yakıt ve geri kilometre reddedilir',()=>{
  for(const patch of [{unitPrice:'0'},{unitPrice:'abc'},{amount:'0'},{km:'999'},{fuel:'Dizel'}])assert.throws(()=>createQuickRecord({...input,values:{...input.values,...patch}}));
});
test('Aynı kilometrede farklı yakıtlar girilebilir; aynı yakıt tekrarlanamaz',()=>{
  const r=createQuickRecord(input);
  assert.throws(()=>createQuickRecord({...input,records:[r]}));
  assert.equal(createQuickRecord({...input,records:[r],values:{...input.values,fuel:'Benzin'}}).fuel,'Benzin');
});
test('Son fiyat araç ve yakıta özeldir; eski türe bağlanmamış fiyat tahmin edilmez',()=>{
  const r=createQuickRecord(input);
  assert.equal(latestUnitPrice([r],'car','LPG').price,30.5);assert.equal(latestUnitPrice([r],'car','Benzin'),null);assert.equal(latestUnitPrice([r],'other','LPG'),null);assert.equal(latestUnitPrice([{...r,fuel:undefined}],'car','LPG'),null);
});
test('Yeni yakıt alanları yedek ve okuma turunda korunur; eski kayıt geçerlidir',()=>{
  const source=readFileSync(new URL('../assets/js/app.js',import.meta.url),'utf8');const fn=source.slice(source.indexOf('function validate(s)'),source.indexOf('function toast('));
  const validate=new Function('vehicleDetails','recordDetails',fn+';return validate;')(vehicleDetails,recordDetails);
  const r=createQuickRecord(input),legacy={...r,id:'old',km:1000};delete legacy.fuel;delete legacy.unitPrice;
  const state={vehicles:[{id:'car',name:'Eski araç'}],records:[legacy,r],selected:'car'};
  assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state);
  assert.throws(()=>recordDetails({...r,unitPrice:1}));
});
test('Farklı yakıtların tam dolumları aynı depo gibi hesaplanmaz',()=>{
  const a=createQuickRecord(input),b={...a,id:'petrol',fuel:'Benzin',km:1600};const result=calculate([a,b]);
  assert.equal(result.mixedFuels,true);assert.equal(result.consumption,null);assert.equal(result.spent,a.amount+b.amount);
});

import {brandQuotes} from '../assets/js/core/brand-quotes.js';
import {cityAtLocation} from '../assets/js/core/location.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeStations,cheapestStations,sortedStations,fetchStations} from '../assets/js/core/prices.js';
import {cities} from '../assets/js/data/price-config.js';

const now=Date.parse('2026-11-10T12:00:00Z');
const station=(id,price,extra={})=>({id,name:`Test ${id}`,brand:`Marka ${id}`,fuelPrices:[{fuelType:'Benzin',price,updatedAt:'2026-11-10T10:00:00Z',...extra}]});
test('İl seçimi 81 benzersiz il içerir',()=>{assert.equal(cities.length,81);assert.equal(new Set(cities).size,81);assert.ok(cities.includes('İstanbul'));});
test('En ucuzlarda eski, tahmini ve gelecek tarihli fiyatlar kullanılmaz',()=>{
  const rows=normalizeStations({stations:[station('a',75),station('b',74),station('old',1,{updatedAt:'2026-11-03T10:00:00Z'}),station('estimate',2,{presentation:{isEstimate:true}}),station('future',3,{updatedAt:'2026-11-11T10:00:00Z'})]});
  assert.equal(cheapestStations(rows,now).Benzin.id,'b');assert.equal(cheapestStations(rows,now).LPG,null);
});
test('Eksik/geçersiz fiyat ve farklı para birimi gerçek fiyat olmaz',()=>{
  const row=station('a',0);row.fuelPrices.push({fuelType:'LPG',price:50,currency:'USD',updatedAt:'2026-11-10T10:00:00Z'});
  assert.deepEqual(normalizeStations({stations:[row]})[0].prices,{});assert.throws(()=>normalizeStations({prices:[]}));
});
test('İstasyonlar çoğalan fiyat kayıtlarında en yeni fiyatı korur',()=>{
  const row=station('a',75);row.fuelPrices.push({fuelType:'Benzin',price:76,updatedAt:'2026-11-10T11:00:00Z'});
  assert.equal(normalizeStations({stations:[row]})[0].prices.Benzin.price,76);
});
test('İstasyon servisi sayfalarını tamamlar ve konum sorgusunu doğru iletir',async()=>{
  const calls=[];const result=await fetchStations({mode:'location',latitude:39.9,longitude:32.8},{endpoint:'https://example.test/prices',fetcher:async url=>{calls.push(new URL(url));return {ok:true,json:async()=>({stations:[station('a'+calls.length,75)],hasMore:calls.length===1})};}});
  assert.equal(result.stations.length,2);assert.equal(calls[0].searchParams.get('lat'),'39.9');assert.equal(calls[1].searchParams.get('offset'),'500');
});
test('Ücretsiz marka verisi yerel JSON üzerinden gelir, GPS gönderilmez',async()=>{let requested;const payload=JSON.parse(readFileSync(new URL('../assets/data/brand-prices.json',import.meta.url),'utf8'));const result=await fetchStations({mode:'location',city:'Ankara',latitude:39.9,longitude:32.8},{endpoint:null,fetcher:async url=>{requested=String(url);return {ok:true,json:async()=>payload};}});assert.equal(requested,'./assets/data/brand-prices.json');assert.equal(result.scope,'province-brand');assert.ok(result.stations.length>0);assert.equal(result.stations[0].latitude,null);});
test('HTTP ve başarısız istekler uydurma fiyatla örtülmez',async()=>{
  await assert.rejects(fetchStations({mode:'city',city:'Ankara'},{endpoint:'http://example.test/',fetcher:()=>{throw Error('Çağrılmamalı');}}),/HTTPS/);
  await assert.rejects(fetchStations({mode:'city',city:'Ankara'},{endpoint:'https://example.test/',fetcher:async()=>({ok:false,status:429})}),/yoğun/);
});
test("Marka bildirimleri kuruştan TL’ye çevrilir ve LPG uydurulmaz",()=>{const payload=JSON.parse(readFileSync(new URL('../assets/data/brand-prices.json',import.meta.url),'utf8'));const rows=brandQuotes(payload,'Ankara');assert.ok(rows.length>0);assert.ok(rows.some(s=>s.prices.Benzin?.price>1));const noLpg=structuredClone(payload);noLpg.data.prices=noLpg.data.prices.filter(p=>p.product!=='lpg');assert.ok(brandQuotes(noLpg,'Ankara').every(s=>!s.prices.LPG));assert.ok(brandQuotes(payload,'İstanbul').some(s=>s.id.startsWith('istanbul-anadolu:')));assert.ok(brandQuotes(payload,'Kocaeli').length>0);});
test('Konum cihazda il sınırlarıyla eşleşir',()=>{const geo=JSON.parse(readFileSync(new URL('../assets/data/provinces.geojson',import.meta.url),'utf8'));assert.equal(cityAtLocation(geo,39.93,32.86),'Ankara');assert.equal(cityAtLocation(geo,41.01,28.97),'İstanbul');assert.equal(cityAtLocation(geo,38.42,27.14),'İzmir');assert.equal(cityAtLocation(geo,0,0),null);});

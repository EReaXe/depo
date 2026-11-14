import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDoviz,parseShell,regionKey} from '../scripts/lib/market-prices.mjs';
import {brandQuotes} from '../assets/js/core/brand-quotes.js';
import {isCurrent} from '../assets/js/core/prices.js';
import {cities} from '../assets/js/data/price-config.js';
const at='2026-11-14T08:00:00Z';
const table=(date='14.11.2026')=>'<table><tr>'+['Dağıtıcı','Benzin','Motorin','LPG','Tarih'].map(x=>`<th>${x}</th>`).join('')+'</tr>'+['Petrol Ofisi','Opet','Total'].map(brand=>`<tr><td><span>${brand}</span></td><td>₺72,20</td><td>₺96,40</td><td>-</td><td><span>${date}</span><button>Fiyat hatası bildir</button></td></tr>`).join('')+'</table>';
test('Döviz.com tarihi, ürün sütunu ve marka eşleşmesi korunur; eksik LPG türetilmez',()=>{
  const rows=parseDoviz(table(),'istanbul-anadolu',at);
  assert.equal(rows.length,6);assert.equal(rows[0].kurus,7220);assert.equal(rows[0].reported_on,'2026-11-14');assert.equal(rows[0].region,'istanbul-anadolu');assert.equal(rows[4].brand,'totalenergies');
  assert.ok(rows.every(r=>r.product!=='lpg'));assert.throws(()=>parseDoviz(table().replace('<th>Benzin</th>','<th>LPG</th>'),'ankara',at));assert.throws(()=>parseDoviz(table('31.02.2026'),'ankara',at));
});
const shell=()=>({products:['37','34','5'].map(c=>({fepProductCode:c+'  ',currCode:'TRY'})),groups:cities.filter(c=>c!=='İstanbul').map(c=>({cityName:c,cityCode:'0',counties:[{countyName:'MERKEZ',prices:{'37  ':70,'34  ':90}}]})).concat({cityName:'ISTANBUL',cityCode:'034',counties:[{countyName:'KADIKOY',prices:{'37  ':71,'5   ':51}},{countyName:'USKUDAR',prices:{'37  ':73}},{countyName:'BESIKTAS',prices:{'37  ':75}},{countyName:'BILINMEYEN',prices:{'37  ':1}}]})});
test('Shell TRY ürünleri doğrulanır, İstanbul yakaları ayrılır; medyan ve gözlem tarihi açık kalır',()=>{
  const data=shell(),rows=parseShell(data,at);const asian=rows.find(r=>r.region==='istanbul-anadolu'&&r.product==='petrol-95');
  assert.equal(asian.kurus,7200);assert.equal(asian.reported_on,undefined);assert.equal(asian.observedAt,at);assert.equal(asian.aggregation,'county-median');assert.equal(asian.sampleCount,2);
  assert.equal(rows.find(r=>r.region==='istanbul-avrupa'&&r.product==='petrol-95').kurus,7500);
  assert.ok(!rows.some(r=>r.region==='ankara'&&r.product==='lpg'));data.products[0].currCode='USD';assert.throws(()=>parseShell(data,at));assert.throws(()=>parseShell({products:[],groups:[]},at));
});
test('Yeni gözlem eski tablo tarihini güncel yapmaz; Shell kontrolü 24 saatte eskir',()=>{
  const now=Date.now(),observedAt=new Date(now).toISOString();
  const row={region:'ankara',brand:'po',product:'petrol-95',kurus:7200,reported_on:'2020-01-01',scope:'market-list',observedAt,source:'Döviz.com'};
  const payload={kind:'province-brand-quotes',data:{brands:[],prices:[row]}};
  assert.equal(isCurrent(brandQuotes(payload,'Ankara')[0].prices.Benzin,now),false);
  delete row.reported_on;assert.equal(isCurrent(brandQuotes(payload,'Ankara')[0].prices.Benzin,now),true);
  row.observedAt=new Date(now-25*3600000).toISOString();assert.equal(isCurrent(brandQuotes(payload,'Ankara')[0].prices.Benzin,now),false);
  row.observedAt=undefined;assert.equal(isCurrent(brandQuotes(payload,'Ankara')[0].prices.Benzin,now),false);
});

test('Shell kısaltılmış il adları yerel illere eşlenir',()=>{assert.equal(regionKey('AFYON'),'afyonkarahisar');assert.equal(regionKey('K.MARAS'),'kahramanmaras');});

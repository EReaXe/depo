import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fuelBrands,fuelBrand,groupBrandStations} from '../assets/js/data/fuel-brands.js';
import {brandQuotes} from '../assets/js/core/brand-quotes.js';
import {isCurrent,cheapestStations} from '../assets/js/core/prices.js';
import {parsePoLpg,parseAytemizLpg} from '../scripts/lib/lpg.mjs';
import {cities} from '../assets/js/data/price-config.js';
test('Yalnız seçilen markalar iki grupta listelenir; kaynak adları eşleşir',()=>{
  assert.deepEqual(fuelBrands.filter(b=>b.group==='main').map(b=>b.name),['Petrol Ofisi','Opet','Shell','TotalEnergies','Aytemiz','Lukoil','Alpet']);
  assert.deepEqual(fuelBrands.filter(b=>b.group==='other').map(b=>b.name),['GO','Kadoil','Sunpet','M Oil']);
  assert.equal(fuelBrand('PO').name,'Petrol Ofisi');assert.equal(fuelBrand('MOİL').name,'M Oil');assert.equal(fuelBrand('KADOİL K').name,'Kadoil');
  const groups=groupBrandStations([{id:'1',brand:'PO'},{id:'2',brand:'MOİL'},{id:'3',brand:'İlgisiz marka'}]);
  assert.equal(groups.main.length,1);assert.equal(groups.other.length,1);
});
test('Resmî LPG KDV dahil sütundan okunur; eksik veya değişen tablo reddedilir',()=>{
  const row='<tr data-disctrict-name="ANKARA"><td>ANKARA</td>'+Array(5).fill('<td><span class="with-tax">80.00</span></td>').join('')+'<td><span class="with-tax">50.79</span><span class="without-tax">42.32</span></td></tr>';
  const html='<table>'+Array(6).fill('<th>Başlık</th>').join('')+'<th>PO/gaz Otogaz</th>'+cities.map(city=>row.replaceAll('ANKARA',city)).join('')+'</table>';
  assert.equal(parsePoLpg(html)[0].kurus,5079);
  assert.throws(()=>parsePoLpg(html.replace('PO/gaz Otogaz','Başka ürün')));
  assert.throws(()=>parsePoLpg('<table>PO/gaz Otogaz'+row+'</table>'));
  const ay='<tr><td><a href="lpg-fiyatlari/ankara-lpg-fiyati.html">Ankara</a></td><td>50,81</td></tr>';
  assert.equal(parseAytemizLpg('12.11.2026 tarihli KDV dahil'+cities.map(city=>ay.replace('Ankara',city)).join(''))[0].reportedOn,'2026-11-12');
  assert.throws(()=>parseAytemizLpg(ay.repeat(70)));
});
test('LPG yalnız doğru marka ve ilde birleşir; kontrol tarihi yenilenerek eski veri güncel olmaz',()=>{
  const observedAt=new Date().toISOString();
  const payload={kind:'province-brand-quotes',data:{brands:[{id:'po',name:'PO'},{id:'shell',name:'SHELL'}],prices:[]},lpgReports:[{brand:'po',source:'https://www.petrolofisi.com.tr/akaryakit-fiyatlari',observedAt,prices:[{region:'ankara',kurus:5079},{region:'istanbul-avrupa',kurus:5070},{region:'istanbul-anadolu',kurus:5010}]}]};
  const rows=brandQuotes(payload,'Ankara');assert.equal(rows.length,1);assert.equal(rows[0].brandId,'po');assert.equal(rows[0].prices.LPG.price,50.79);assert.equal(rows[0].prices.LPG.reportedOn,undefined);
  const ist=brandQuotes(payload,'İstanbul');assert.equal(ist.length,2);assert.notEqual(ist[0].prices.LPG.price,ist[1].prices.LPG.price);
  assert.equal(brandQuotes(payload,'İzmir').length,0);
  payload.lpgReports[0].observedAt='2020-01-01T12:00:00Z';const old=brandQuotes(payload,'Ankara');assert.equal(isCurrent(old[0].prices.LPG),false);assert.equal(cheapestStations(old).LPG,null);
});
test('Tüm yakıt marka logoları yereldir ve PWA listesinde bulunur',()=>{
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  for(const brand of fuelBrands){assert.ok(readFileSync(new URL('../'+brand.logo.slice(2),import.meta.url)).length>100);assert.ok(sw.includes(brand.logo));}
});

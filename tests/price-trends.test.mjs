import test from 'node:test';
import assert from 'node:assert/strict';
import {retainPriceHistory} from '../scripts/lib/market-prices.mjs';
import {priceTrendMarkup} from '../assets/js/ui/prices-screen.js';
const base={region:'ankara',brand:'po',product:'diesel',sourceUrl:'https://www.doviz.com/akaryakit-fiyatlari/ankara',kurus:9000,reported_on:'2026-11-13',observedAt:'2026-11-13T10:00:00Z'};
test('Fiyat geçmişi ilk gözlemde boş; artış/düşüşte önceki değer saklanır ve sabit fiyatta korunur',()=>{
  assert.equal(retainPriceHistory([base])[0].previousKurus,undefined);
  const current={...base,kurus:9200,reported_on:'2026-11-14',observedAt:'2026-11-14T10:00:00Z'};
  const up=retainPriceHistory([current],[base])[0];assert.equal(up.previousKurus,9000);
  assert.equal(retainPriceHistory([{...current,observedAt:'2026-11-14T16:00:00Z'}],[up])[0].previousKurus,9000);
  assert.equal(retainPriceHistory([{...current,kurus:9100}],[up])[0].previousKurus,9200);
});
test('Marka/yaka/yakıt/kaynak değişikliği veya eski veri fiyat hareketi oluşturmaz',()=>{
  for(const change of [{region:'istanbul-anadolu'},{brand:'shell'},{product:'lpg'},{sourceUrl:'https://example.com/'},{aggregation:'county-median'},{reported_on:'2020-01-01'}]){
    assert.equal(retainPriceHistory([{...base,kurus:9200,...change}],[base])[0].previousKurus,undefined);
  }
});
test('Oklar istenen yönde, erişilebilir önceki fiyatla; eksik/eski/değişmeyen fiyatta gizli',()=>{
  const current={price:92,previousPrice:90,updatedAt:new Date().toISOString()};
  assert.match(priceTrendMarkup(current),/priceTrendUp/);assert.match(priceTrendMarkup(current),/Arttı; önceki fiyat/);
  assert.match(priceTrendMarkup({...current,price:88}),/priceTrendDown/);
  for(const p of [undefined,{...current,price:90},{...current,previousPrice:null},{...current,stale:true},{...current,unusual:true}])assert.equal(priceTrendMarkup(p),'');
});

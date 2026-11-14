import test from 'node:test';
import assert from 'node:assert/strict';
import {extractExpectationPrices,parseFuelNews} from '../scripts/lib/fuel-news.mjs';
import {expectationPriceText} from '../assets/js/core/market-notifications.js';
import {homeExpectationMarkup} from '../assets/js/ui/home-card.js';
test('Haber tutarı lira/kuruştan TL/L cinsine doğru çevrilir',()=>{
 assert.deepEqual(extractExpectationPrices('Motorine 1 lira 20 kuruş indirim bekleniyor','',['Motorin']),[{fuel:'Motorin',change:-1.2}]);
 assert.deepEqual(extractExpectationPrices('Benzine 85 kuruşluk zam geliyor','',['Benzin']),[{fuel:'Benzin',change:.85}]);
 assert.deepEqual(extractExpectationPrices('Benzine 1,25 TL zam bekleniyor','',['Benzin']),[{fuel:'Benzin',change:1.25}]);
});
test('Birden çok yakıtın tutarı ayrılır; geçmiş veya belirsiz tutarlar üretilmez',()=>{
 assert.deepEqual(extractExpectationPrices('Benzine 1 lira zam ve motorine 2 lira indirim bekleniyor','',['Benzin','Motorin']),[{fuel:'Benzin',change:1},{fuel:'Motorin',change:-2}]);
 assert.deepEqual(extractExpectationPrices('Akaryakıta zam bekleniyor','1 lira zam bekleniyor',['Benzin','Motorin','LPG']),[]);
 assert.deepEqual(extractExpectationPrices('Benzine zam bekleniyor','Geçen hafta benzine 2 lira zam geldi.',['Benzin']),[]);
 assert.deepEqual(extractExpectationPrices('Motorine 1 lira indirim bekleniyor','Motorine 2 lira indirim bekleniyor',['Motorin']),[]);
});
test('Beklenen pompa fiyatı yalnız açık kaynak cümlesinden alınır',()=>{
 const rows=extractExpectationPrices('Benzine zam bekleniyor',"Benzinin litre fiyatının 75,20 liraya çıkması bekleniyor.",['Benzin']);assert.deepEqual(rows,[{fuel:'Benzin',expectedPrice:75.2}]);
 assert.match(expectationPriceText({fuels:['Benzin'],prices:rows}),/beklenen litre fiyatı 75,20 TL/);
 assert.match(expectationPriceText({fuels:['Benzin'],prices:[{fuel:'Benzin',change:1}]}),/1,00 TL\/L zam beklentisi/);
 assert.equal(expectationPriceText({fuels:['Benzin'],prices:[{fuel:'Motorin',change:1},{fuel:'Benzin',expectedPrice:-1}]}),'Tutar bilgisi alınamadı.');
});
test('RSS tutarı JSON ve Ana Sayfa şeridine taşır, başlık kısaltması tutarı kaybettirmez',()=>{
 const now=Date.parse('2026-11-14T10:00:00+03:00'),source={name:'NTV',url:'https://www.ntv.com.tr/ekonomi.rss'};
 const xml='<rss><item><title>Motorine indirim bekleniyor</title><description>Motorine yarın 1 lira 20 kuruş indirim yapılması bekleniyor.</description><link>https://www.ntv.com.tr/ekonomi/test</link><pubDate>2026-11-14T09:00:00+03:00</pubDate></item></rss>';
 const items=parseFuelNews(xml,source,now).items;assert.equal(items[0].prices[0].change,-1.2);assert.match(homeExpectationMarkup(items,now),/1,20 TL\/L indirim beklentisi/);
});

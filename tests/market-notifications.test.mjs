import test from 'node:test';
import assert from 'node:assert/strict';
import {activeExpectations,comparePriceSnapshot} from '../assets/js/core/market-notifications.js';
import {parseFuelNews} from '../scripts/lib/fuel-news.mjs';
const now=Date.parse('2026-11-12T12:00:00+03:00');
const news={id:'one',title:'Motorine yarından itibaren indirim bekleniyor',fuels:['Motorin'],source:'NTV',url:'https://www.ntv.com.tr/ekonomi/test',publishedAt:'2026-11-12T10:00:00+03:00',expiresAt:'2026-11-13T00:00:00+03:00'};
const feed=item=>({kind:'fuel-expectations',items:item});
test('Beklenti sadece kaynaklı, tarihli ve süresi dolmamışsa görünür; boş akış boş kalır',()=>{
  assert.deepEqual(activeExpectations(feed([]),now),[]);assert.equal(activeExpectations(feed([null,news]),now).length,1);
  for(const patch of [{expiresAt:'2026-11-12T11:00:00+03:00'},{publishedAt:'2026-11-01T10:00:00+03:00'},{publishedAt:'2026-11-13T10:00:00+03:00'},{url:'javascript:alert(1)'},{url:'https://example.test/news'},{fuels:[]}])assert.equal(activeExpectations(feed([{...news,...patch}]),now).length,0);
  assert.equal(activeExpectations(feed([news,{...news,id:'two',publishedAt:'2026-11-12T11:00:00+03:00'}]),now)[0].id,'two');
});
const source={name:'NTV',url:'https://www.ntv.com.tr/ekonomi.rss'};
function atom(title= news.title,summary='13 Kasım 2026 Cuma gününden itibaren geçerli olması bekleniyor.',published=news.publishedAt){return `<feed><entry><id>${news.url}</id><title>${title}</title><summary>${summary}</summary><published>${published}</published><link href="${news.url}"/></entry></feed>`;}
test('RSS/Atom haberinde yayın tarihi korunur ve geçerlilik Türkiye gece yarısında biter',()=>{
  const parsed=parseFuelNews(atom(),source,now).items;assert.equal(parsed.length,1);assert.equal(parsed[0].expiresAt,'2026-11-12T21:00:00.000Z');
  assert.equal(parseFuelNews(atom(),source,Date.parse('2026-11-13T00:00:00+03:00')).items.length,0);
  assert.equal(parseFuelNews(atom('Motorine indirim bekleniyor','Yarından itibaren geçerli.'),source,now).items[0].expiresAt,parsed[0].expiresAt);
  assert.equal(parseFuelNews(atom(news.title,'7 Kasım 2026 itibaren.'),source,now).items.length,0);
  assert.equal(parseFuelNews(atom(news.title,'31 Kasım 2026 itibaren.'),source,now).items.length,0);
});
test('Geçmiş gerçekleşmiş haberler, soru başlıkları, eski yayınlar ve iptal haberleri beklenti sayılmaz',()=>{
  for(const title of ['Motorine indirim geldi','Motorine zam mı geliyor?','Motorine beklenen indirim iptal edildi'])assert.equal(parseFuelNews(atom(title),source,now).items.length,0);
  assert.equal(parseFuelNews(atom(news.title,'','2026-11-01T10:00:00+03:00'),source,now).items.length,0);
  assert.equal(parseFuelNews(atom('Motorine beklenen indirim iptal edildi'),source,now).cancelledIds.length,1);
  assert.throws(()=>parseFuelNews('<html>Bakım</html>',source,now));
});
const station=(value,updatedAt='2026-11-12T10:00:00+03:00')=>({id:'ankara:po',brandId:'po',brand:'PO',prices:{Benzin:{price:value,updatedAt,scope:'province-brand'}}});
test('İlk fiyat yüklemesi başlangıçtır; kontrol tarihi tek başına bildirim üretmez',()=>{
  const first=comparePriceSnapshot(null,[station(70)],'2026-11-12T10:00:00+03:00',now);assert.equal(first.changed.length,0);
  const same=comparePriceSnapshot(first.snapshot,[station(70)],'2026-11-12T11:00:00+03:00',now);assert.equal(same.changed.length,0);
  const changed=comparePriceSnapshot(same.snapshot,[station(71)],'2026-11-12T11:30:00+03:00',now);assert.equal(changed.changed.length,1);
  assert.equal(comparePriceSnapshot(changed.snapshot,[station(71)],'2026-11-12T11:40:00+03:00',now).changed.length,0);
});
test('Eski/ters sırada gelen dosya, eksik fiyat ve yeni marka satırı sahte değişiklik üretmez',()=>{
  const first=comparePriceSnapshot(null,[station(70)],'2026-11-12T10:00:00+03:00',now).snapshot;
  assert.equal(comparePriceSnapshot(first,[station(1)],'2026-11-11T10:00:00+03:00',now).changed.length,0);
  assert.equal(comparePriceSnapshot(first,[{...station(1),prices:{Benzin:{price:1,updatedAt:'2020-01-01',scope:'province-brand'}}}],'2026-11-12T11:00:00+03:00',now).changed.length,0);
  assert.equal(comparePriceSnapshot(first,[{...station(1),id:'ankara:opet',brandId:'opet',brand:'OPET'}],'2026-11-12T11:00:00+03:00',now).changed.length,0);
});

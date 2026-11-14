import test from 'node:test';
import assert from 'node:assert/strict';
import {homeExpectationMarkup} from '../assets/js/ui/home-card.js';
const now=Date.parse('2026-11-14T10:00:00Z');
const item={id:'test-only',title:'Benzinde indirim bekleniyor',url:'https://www.ntv.com.tr/ekonomi/test-only',source:'NTV',fuels:['Benzin'],publishedAt:'2026-11-14T08:00:00Z',expiresAt:'2026-11-14T21:00:00Z'};
test('Ana Sayfa şeridi yalnız geçerli beklentide kaynak, tarih ve beklenti açıklamasıyla görünür',()=>{
  const html=homeExpectationMarkup([item],now);assert.match(html,/SON DAKİKA/);assert.match(html,/Benzinde indirim bekleniyor/);assert.match(html,/NTV/);assert.match(html,/14 Kas/);assert.match(html,/kesinleşmiş fiyat değildir/);
  assert.equal(homeExpectationMarkup([],now),'');assert.equal(homeExpectationMarkup([item],Date.parse(item.expiresAt)),'');
  assert.equal(homeExpectationMarkup([{...item,url:'https://example.com/'}],now),'');
  assert.equal(homeExpectationMarkup([{...item,publishedAt:'2026-11-15T08:00:00Z'}],now),'');
});
test('Geçerli farklı yakıt beklentileri birlikte listelenir ve başlık HTML olarak çalışmaz',()=>{
  const second={...item,id:'test-2',title:'<img src=x> Motorinde zam beklentisi',fuels:['Motorin']};
  const html=homeExpectationMarkup([item,second],now);assert.equal((html.match(/<article>/g)||[]).length,2);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
});

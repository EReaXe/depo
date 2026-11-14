import test from 'node:test';
import assert from 'node:assert/strict';
import {garageMarkup,withoutVehicle} from '../assets/js/ui/garage.js';
const state={vehicles:[{id:'a',name:'Birinci araç',brand:'Opel',currentKm:100},{id:'b',name:'<İkinci>'}],records:[{vehicle:'a',km:150},{vehicle:'b',km:90}],selected:'a'};
test('Araç silme yalnız ilgili kayıtları kaldırır, seçimi ve kaynak veriyi korur',()=>{
 const other=withoutVehicle(state,'b');assert.equal(other.selected,'a');assert.deepEqual(other.records,[state.records[0]]);
 const selected=withoutVehicle(state,'a');assert.equal(selected.selected,'b');assert.equal(selected.records.length,1);
 assert.equal(withoutVehicle(selected,'b').selected,null);assert.equal(state.vehicles.length,2);assert.equal(state.records.length,2);
});
test('Garaj seçimi metin ve erişilebilir durumla gösterir, gerçek km ve güvenli ad kullanır',()=>{
 const html=garageMarkup(state);assert.match(html,/aria-pressed="true"/);assert.match(html,/aria-pressed="false"/);assert.match(html,/Seçili araç/);assert.match(html,/150 km/);assert.match(html,/&lt;İkinci&gt;/);assert.doesNotMatch(html,/<İkinci>/);assert.match(garageMarkup({vehicles:[],records:[]}),/Garajınız henüz boş/);
});

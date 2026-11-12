import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {vehicleDetails} from '../assets/js/data/vehicles.js';
import {recordDetails} from '../assets/js/core/refill.js';
import {makeBackup,parseBackup,makeTransferUrl,readTransfer,maxTransferUrlBytes} from '../assets/js/core/backup.js';
import {qrMarkup} from '../assets/js/ui/backup-panel.js';
const source=readFileSync(new URL('../assets/js/app.js',import.meta.url),'utf8');
const validate=new Function('vehicleDetails','recordDetails',source.slice(source.indexOf('function validate(s)'),source.indexOf('function toast('))+';return validate;')(vehicleDetails,recordDetails);
const state={vehicles:[{id:'test-car',name:'Deneme aracı'}],records:[{id:'r',vehicle:'test-car',date:'2026-11-12',km:1000,amount:450,litres:15,full:true,fuel:'LPG',unitPrice:30}],selected:'test-car'};
test('Tarihli yeni yedek ve eski sürümsüz JSON tüm araç/dolum alanlarıyla okunur',()=>{
  const backup=makeBackup(state,validate,new Date('2026-11-12T10:00:00Z'));assert.equal(backup.format,'depo-backup');assert.equal(backup.exportedAt,'2026-11-12T10:00:00.000Z');
  assert.deepEqual(parseBackup(JSON.stringify(backup),validate).state,state);
  assert.equal(parseBackup(JSON.stringify(state),validate).exportedAt,null);
  assert.deepEqual(parseBackup(JSON.stringify({...state,version:1}),validate).state,state);
});
test('Yanlış ürün, gelecek sürüm, bozuk tarih ve geçersiz JSON reddedilir',()=>{
  for(const patch of [{format:'other'},{version:2},{exportedAt:'no-date'}])assert.throws(()=>parseBackup(JSON.stringify({...state,...patch}),validate));
  assert.throws(()=>parseBackup('{',validate),/JSON/);assert.throws(()=>parseBackup('x'.repeat(5_000_001),validate),/büyük/);
  assert.throws(()=>validate({...state,records:[{...state.records[0],date:'2026-02-30'}]}));
});
test('Bozuk kayıtta veya tekrar eden yakıt/km sırasında yedek reddedilir; girdi değiştirilmez',()=>{
  const original=structuredClone(state);
  for(const patch of [{vehicle:'unknown'},{amount:-1},{unitPrice:1}])assert.throws(()=>parseBackup(JSON.stringify({...state,records:[{...state.records[0],...patch}]}),validate));
  assert.throws(()=>validate({...state,records:[state.records[0],{...state.records[0],id:'duplicate'}]}));
  assert.deepEqual(state,original);
});
test('Aktarım bağlantısı kök/alt yol kapsamını korur ve sıkıştırılmış veriyi kayıpsız döndürür',async()=>{
  const backup=makeBackup(state,validate);
  for(const base of ['https://example.test/','https://example.test/depo/']){
    const url=await makeTransferUrl(backup,base+'?old=1#old');assert.ok(url.startsWith(base+'#depo-transfer='));assert.ok(url.length<=maxTransferUrlBytes);
    const result=await readTransfer(new URL(url).hash,validate);assert.deepEqual(result.state,state);assert.equal(result.exportedAt,backup.exportedAt);
    assert.match(qrMarkup(url),/shape-rendering="crispEdges"/);
  }
});
test('Sıkıştırma yoksa küçük yedek bağlantısı çalışır; bozuk veri denetimde reddedilir',async()=>{
  const url=await makeTransferUrl(makeBackup(state,validate),'https://example.test/depo/',{compress:false});assert.match(url,/#depo-transfer=1\.j\./);
  const hash=new URL(url).hash;assert.deepEqual((await readTransfer(hash,validate)).state,state);
  const parts=hash.split('.');parts[3]=(parts[3][0]==='A'?'B':'A')+parts[3].slice(1);await assert.rejects(readTransfer(parts.join('.'),validate),/bozulmuş/);
  await assert.rejects(readTransfer('#depo-transfer=2.bad',validate),/geçersiz/);
});
test('Büyük aktarım sessizce kırpılmaz; JSON dosyasına yönlendirilir',async()=>{
  const backup={...makeBackup(state,validate),padding:Array.from({length:4000},()=>crypto.randomUUID()).join('')};
  await assert.rejects(makeTransferUrl(backup,'https://example.test/'),/JSON/);
});

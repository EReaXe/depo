import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
// A scheduled Pages build starts from Git, so retain the latest published snapshots
// before deciding whether the six-hour price refresh is due.
if(process.env.GITHUB_ACTIONS==='true'&&process.env.GITHUB_REPOSITORY){
  const [owner,repo]=process.env.GITHUB_REPOSITORY.split('/');
  const base=`https://${owner.toLowerCase()}.github.io/${encodeURIComponent(repo)}/`;
  for(const [file,kind] of [['brand-prices.json','province-brand-quotes'],['fuel-news.json','fuel-expectations']]){
    try{
      const response=await fetch(new URL('assets/data/'+file,base),{signal:AbortSignal.timeout(20000),cache:'no-store'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const payload=await response.json();if(payload.kind!==kind||(file==='brand-prices.json'?!Array.isArray(payload.data?.prices)||!Array.isArray(payload.data?.brands):!Array.isArray(payload.items)))throw Error('Snapshot biçimi geçersiz');
      await writeFile(new URL('assets/data/'+file,root),JSON.stringify(payload,null,2)+'\n');
    }catch(error){console.warn(file+': son yayın alınamadı; Git kopyası korunuyor. '+error.message);}
  }
}
let capture=NaN;try{capture=Date.parse(JSON.parse(await readFile(new URL('assets/data/brand-prices.json',root),'utf8')).checkedAt);}catch{}
const scheduled=process.env.GITHUB_EVENT_NAME==='schedule';
if(!scheduled||!Number.isFinite(capture)||Date.now()-capture>=6*3600000||capture>Date.now()+300000){
  try{execFileSync(process.execPath,[fileURLToPath(new URL('sync-prices.mjs',import.meta.url))],{stdio:'inherit'});}catch{console.warn('Fiyat kaynağı yenilenemedi; önceki fiyatlar ve tarihleri korunuyor.');}
}else console.log('Fiyat kaynağı son altı saat içinde kontrol edilmiş; yeniden alınmıyor.');
try{execFileSync(process.execPath,[fileURLToPath(new URL('sync-fuel-news.mjs',import.meta.url))],{stdio:'inherit'});}catch{console.warn('Beklenti haberleri yenilenemedi; süresi dolmamış önceki kayıtlar korunuyor.');}

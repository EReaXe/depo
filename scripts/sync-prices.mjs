import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {parsePoLpg,parseAytemizLpg} from './lib/lpg.mjs';
const source='https://turkpidya.com/wp-json/turkpidya-data/v1/tools/datasets/fuel-brands';
const response=await fetch(source,{signal:AbortSignal.timeout(25000),headers:{Accept:'application/json'}});
if(!response.ok)throw Error(`Ücretsiz fiyat servisi HTTP ${response.status}`);
const payload=await response.json();
if(payload.status!=='verified'||!Array.isArray(payload.data?.prices)||!Array.isArray(payload.data?.brands))throw Error('Fiyat verisi doğrulanamadı; önceki dosya korunuyor.');
const prices=payload.data.prices.filter(p=>['petrol-95','diesel','lpg'].includes(p.product)&&Number.isInteger(p.kurus)&&p.kurus>0&&Number.isFinite(Date.parse(p.reported_on)));
if(prices.length<50||new Set(prices.map(p=>p.region)).size<70)throw Error('Beklenen il kapsamı alınamadı; önceki dosya korunuyor.');
await mkdir(new URL('../assets/data/',import.meta.url),{recursive:true});
const target=new URL('../assets/data/brand-prices.json',import.meta.url);
let previous;try{previous=JSON.parse(await readFile(target,'utf8'));}catch{}
const lpgReports=[];
for(const [brand,url,parse] of [['po','https://www.petrolofisi.com.tr/akaryakit-fiyatlari',parsePoLpg],['aytemiz','https://www.aytemiz.com.tr/akaryakit-fiyatlari/lpg-fiyatlari',parseAytemizLpg]]){
  try{const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error(`HTTP ${response.status}`);const prices=parse(await response.text());lpgReports.push({brand,source:url,observedAt:new Date().toISOString(),prices});console.log(`${brand}: ${prices.length} resmî LPG liste fiyatı.`);}
  catch(error){console.warn(`${brand} LPG güncellenemedi: ${error.message}`);const old=previous?.lpgReports?.find(r=>r.brand===brand);if(old)lpgReports.push(old);}
}
await writeFile(target,JSON.stringify({kind:'province-brand-quotes',source,checkedAt:new Date().toISOString(),...payload,data:{...payload.data,prices},lpgReports},null,2)+'\n');
console.log(`${prices.length} il/marka fiyat bildirimi alındı. İstasyon pompa fiyatı değildir. Kaynak: Turkpidya.`);

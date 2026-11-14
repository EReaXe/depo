import {writeFile,readFile} from 'node:fs/promises';
import {cities} from '../assets/js/data/price-config.js';
import {fuelBrands} from '../assets/js/data/fuel-brands.js';
import {cityKey} from '../assets/js/core/brand-quotes.js';
import {parseDoviz,parseShell,dovizUrl,shellUrl,regionKey,retainPriceHistory} from './lib/market-prices.mjs';
const target=new URL('../assets/data/brand-prices.json',import.meta.url);
let previous;try{previous=JSON.parse(await readFile(target,'utf8'));}catch{}
const observedAt=new Date().toISOString(),prices=[],slugs=cities.flatMap(c=>c==='İstanbul'?['istanbul-anadolu','istanbul-avrupa']:[cityKey(c)]);
let success=0;
// Bounded queue: at most three public page requests at a time.
async function worker(){
  while(slugs.length){
    const slug=slugs.shift();
    try{
      const response=await fetch(dovizUrl(slug),{signal:AbortSignal.timeout(25000)});
      if(!response.ok)throw Error('HTTP '+response.status);
      prices.push(...parseDoviz(await response.text(),slug,observedAt));success++;
    }catch(error){
      console.warn(`${slug}: ${error.message}; önceki tarihli kayıt korunuyor.`);
      prices.push(...(previous?.data?.prices||[]).filter(r=>r.region===regionKey(slug)));
    }
  }
}
await Promise.all([worker(),worker(),worker()]);
let shell;
try{
  const response=await fetch(shellUrl,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  shell=parseShell(await response.json(),observedAt);
}catch(error){console.warn('Shell yenilenemedi: '+error.message);}
if(shell){
  const covered=new Set(shell.map(r=>r.region+':'+r.product));
  for(let i=prices.length-1;i>=0;i--)if(prices[i].brand==='shell'&&covered.has(prices[i].region+':'+prices[i].product))prices.splice(i,1);
  prices.push(...shell);
}
if(!success||new Set(prices.map(r=>r.region)).size<70)throw Error('Yeterli güncel il kapsamı alınamadı; önceki dosya korunuyor.');
prices.splice(0,prices.length,...retainPriceHistory(prices,previous?.data?.prices));
prices.sort((a,b)=>(a.region+':'+a.brand+':'+a.product).localeCompare(b.region+':'+b.brand+':'+b.product));
await writeFile(target,JSON.stringify({kind:'province-brand-quotes',provider:'doviz-shell',checkedAt:observedAt,fetched_at:observedAt,status:'verified',freshness:{state:'fresh',max_age_seconds:86400},data:{brands:fuelBrands.map(({id,name})=>({id,name})),prices},lpgReports:[]},null,2)+'\n');
console.log(`${success} il/yaka tablosu güncellendi, ${prices.length} fiyat. Kaynak: Döviz.com ve Shell.`);

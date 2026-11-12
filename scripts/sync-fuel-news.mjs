import {readFile,writeFile} from 'node:fs/promises';
import {parseFuelNews} from './lib/fuel-news.mjs';
import {activeExpectations} from '../assets/js/core/market-notifications.js';
const sources=[{name:'NTV',url:'https://www.ntv.com.tr/ekonomi.rss'},{name:'TRT Haber',url:'https://www.trthaber.com/ekonomi_articles.rss'}];
const target=new URL('../assets/data/fuel-news.json',import.meta.url);
let previous={kind:'fuel-expectations',items:[]};try{previous=JSON.parse(await readFile(target,'utf8'));}catch{}
let items=activeExpectations(previous),success=0;
for(const source of sources){
  try{const response=await fetch(source.url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);const news=parseFuelNews(await response.text(),source);success++;const byId=new Map(items.map(item=>[item.id,item]));for(const id of news.cancelledIds)byId.delete(id);for(const item of news.items)byId.set(item.id,item);items=[...byId.values()];console.log(source.name+': '+news.items.length+' geçerli beklenti haberi.');}
  catch(error){console.warn(source.name+': '+error.message+'; tarihi geçmemiş önceki haberler korunuyor.');}
}
if(!success)throw Error('Haber kaynaklarına ulaşılamadı; önceki dosya değiştirilmedi.');
const payload={kind:'fuel-expectations',checkedAt:new Date().toISOString(),sources,items:activeExpectations({kind:'fuel-expectations',items})};
await writeFile(target,JSON.stringify(payload,null,2)+'\n');

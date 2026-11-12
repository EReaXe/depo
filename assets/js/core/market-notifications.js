import {groupBrandStations} from '../data/fuel-brands.js';
import {isCurrent} from './prices.js';
const newsHosts=['www.ntv.com.tr','ntv.com.tr','www.trthaber.com','trthaber.com'];
export function activeExpectations(payload,now=Date.now()){
  if(payload?.kind!=='fuel-expectations'||!Array.isArray(payload.items))return [];
  const result=[],fuels=new Set();
  for(const item of payload.items.filter(item=>item&&typeof item==='object').sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))){
    const published=Date.parse(item?.publishedAt),expires=Date.parse(item?.expiresAt);
    let url;try{url=new URL(item.url);}catch{continue;}
    if(url.protocol!=='https:'||!newsHosts.includes(url.hostname)||typeof item.id!=='string'||item.id.length>150||typeof item.title!=='string'||!item.title.trim()||item.title.length>220||typeof item.source!=='string'||item.source.length>60||!Array.isArray(item.fuels)||!item.fuels.length||item.fuels.some(f=>!['Benzin','Motorin','LPG'].includes(f)))continue;
    if(!Number.isFinite(published)||!Number.isFinite(expires)||published>now+300000||now-published>72*3600000||expires<=now||expires>published+72*3600000)continue;
    if(item.fuels.every(f=>fuels.has(f)))continue;
    item.fuels.forEach(f=>fuels.add(f));result.push(item);
    if(result.length===3)break;
  }
  return result;
}
export function comparePriceSnapshot(previous,stations,checkedAt,now=Date.now()){
  const capture=Date.parse(checkedAt);
  if(!Number.isFinite(capture)||capture>now+300000)return {snapshot:previous,changed:[]};
  if(previous&&capture<Date.parse(previous.checkedAt))return {snapshot:previous,changed:[]};
  const {main,other}=groupBrandStations(stations),values={...(previous?.values||{})},changed=[];
  let observed=0;
  for(const station of [...main,...other])for(const [fuel,price] of Object.entries(station.prices||{})){
    if(!isCurrent(price,now))continue;observed++;
    const key=station.id+'|'+fuel,old=values[key];
    if(old&&Date.parse(price.updatedAt)<Date.parse(old.updatedAt))continue;
    if(old&&Math.abs(old.price-price.price)>.0001)changed.push({brand:station.brand,fuel,sourceUrl:price.sourceUrl||'https://turkpidya.com/en/tools?utm_source=api&utm_medium=credit&utm_campaign=tools'});
    values[key]={price:price.price,updatedAt:price.updatedAt};
  }
  return {snapshot:observed?{checkedAt,values}:previous,changed};
}

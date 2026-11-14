import {priceConfig,priceFuels} from '../data/price-config.js';
import {brandQuotes} from './brand-quotes.js';
export function normalizeStations(payload){
  if(!payload||!Array.isArray(payload.stations))throw Error('Fiyat servisinden geçersiz yanıt alındı.');
  return payload.stations.map(s=>{
    if(typeof s.id!=='string'||typeof s.name!=='string'||typeof s.brand!=='string'||!Array.isArray(s.fuelPrices))throw Error('İstasyon bilgileri geçersiz.');
    const prices={};
    for(const p of s.fuelPrices){
      if(!priceFuels.includes(p.fuelType)||!Number.isFinite(p.price)||p.price<=0||p.price>10000||(p.currency&&p.currency!=='TRY'))continue;
      const updatedAt=p.presentation?.freshnessAt||p.updatedAt;
      if(!updatedAt||!Number.isFinite(Date.parse(updatedAt)))continue;
      const candidate={price:p.price,updatedAt,estimate:p.presentation?.isEstimate===true,stale:p.presentation?.stale===true,source:p.presentation?.sourceLabel||p.source||''};
      if(!prices[p.fuelType]||Date.parse(updatedAt)>Date.parse(prices[p.fuelType].updatedAt))prices[p.fuelType]=candidate;
    }
    return {id:s.id,name:s.presentation?.listName||s.name,brand:s.presentation?.brandLabel||s.brand,city:typeof s.city==='string'?s.city:'',district:typeof s.district==='string'?s.district:'',latitude:Number.isFinite(s.latitude)&&Math.abs(s.latitude)<=90?s.latitude:null,longitude:Number.isFinite(s.longitude)&&Math.abs(s.longitude)<=180?s.longitude:null,prices};
  });
}
export function isCurrent(price,now=Date.now()){
  const age=now-Date.parse(price?.updatedAt);
  const maxAge=price?.scope==='market-list'&&price.reportedOn?10*86400000:price?.scope==='province-brand'?30*24*60*60*1000:priceConfig.maxAgeMs;
  return !!price&&!price.estimate&&!price.stale&&!price.unusual&&age>=-300000&&age<=maxAge;
}
export function cheapestStations(stations,now=Date.now()){
  return Object.fromEntries(priceFuels.map(fuel=>[fuel,stations.filter(s=>isCurrent(s.prices[fuel],now)).sort((a,b)=>a.prices[fuel].price-b.prices[fuel].price||a.name.localeCompare(b.name,'tr'))[0]||null]));
}
export function sortedStations(stations,fuel){
  return [...stations].sort((a,b)=>{
    const ap=a.prices[fuel],bp=b.prices[fuel];
    const ac=isCurrent(ap),bc=isCurrent(bp);
    if(ac!==bc)return ac?-1:1;
    return (ap?.price??Infinity)-(bp?.price??Infinity)||a.brand.localeCompare(b.brand,'tr')||a.name.localeCompare(b.name,'tr');
  });
}
export async function fetchStations(query,{signal,fetcher=fetch,endpoint=priceConfig.endpoint}={}){
  if(!endpoint){
    const response=await fetcher('./assets/data/brand-prices.json',{signal,cache:'no-store'});
    if(!response.ok)throw Error('Marka fiyat dosyası yüklenemedi. İnternet bağlantısını kontrol edin.');
    const payload=await response.json();
    return {stations:brandQuotes(payload,query?.city),configured:false,scope:'province-brand',provider:payload.provider,checkedAt:payload.checkedAt};
  }
  const url=new URL(endpoint,globalThis.location?.href||'https://localhost/');
  if(url.protocol!=='https:'&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')throw Error('Fiyat servisi HTTPS kullanmalı.');
  if(query.mode==='location'){url.searchParams.set('lat',query.latitude);url.searchParams.set('lng',query.longitude);url.searchParams.set('radius','10');}
  else url.searchParams.set('city',query.city);
  url.searchParams.set('limit','500');
  const stations=new Map();
  for(let page=0;page<20;page++){
    url.searchParams.set('offset',String(page*500));
    const response=await fetcher(url,{signal,cache:'no-store',credentials:'omit'});
    if(!response.ok)throw Error(response.status===429?'Fiyat servisi yoğun. Biraz sonra yeniden deneyin.':'Fiyat servisine ulaşılamadı.');
    const payload=await response.json();
    for(const station of normalizeStations(payload))stations.set(station.id,station);
    if(!payload.hasMore)return {stations:[...stations.values()],configured:true};
  }
  throw Error('Bu bölgedeki istasyon listesi çok büyük. Daha dar bir bölge seçin.');
}

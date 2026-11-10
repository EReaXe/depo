export const cityKey=value=>String(value).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ı','i').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function brandQuotes(payload,city){
  if(payload?.kind!=='province-brand-quotes'||!Array.isArray(payload.data?.prices)||!Array.isArray(payload.data?.brands))throw Error('Marka fiyat dosyası geçersiz.');
  if(!city)return [];
  const key=cityKey(city),keys=key==='istanbul'?['istanbul-avrupa','istanbul-anadolu']:key==='kocaeli'?['kocaeli-izmit']:key==='sakarya'?['sakarya-adapazari']:[key];
  const names=new Map(payload.data.brands.map(b=>[b.id,b.name]));
  const capturedAt=Date.parse(payload.fetched_at);const snapshotOld=!Number.isFinite(capturedAt)||Date.now()-capturedAt>(payload.freshness?.max_age_seconds||259200)*1000;
  const rows=new Map(),fuels={'petrol-95':'Benzin',diesel:'Motorin',lpg:'LPG'};
  for(const row of payload.data.prices){
    const fuel=fuels[row.product];
    if(!keys.includes(row.region)||!fuel||!Number.isInteger(row.kurus)||row.kurus<=0||row.kurus>1000000||!/^\d{4}-\d{2}-\d{2}$/.test(row.reported_on)||!Number.isFinite(Date.parse(row.reported_on)))continue;
    const id=`${row.region}:${row.brand}`;
    if(!rows.has(id))rows.set(id,{id,brand:names.get(row.brand)||row.brand,name:key==='istanbul'?(row.region.endsWith('avrupa')?'İstanbul · Avrupa':'İstanbul · Anadolu'):city,city,district:'',latitude:null,longitude:null,scope:'province-brand',prices:{}});
    const station=rows.get(id),previous=station.prices[fuel];
    if(!previous||previous.reportedOn<row.reported_on)station.prices[fuel]={price:row.kurus/100,updatedAt:row.reported_on+'T12:00:00+03:00',reportedOn:row.reported_on,estimate:false,stale:snapshotOld||payload.freshness?.state!=='fresh'||payload.status!=='verified',scope:'province-brand',source:'EPDK marka bildirimi · Turkpidya'};
  }
  const result=[...rows.values()];
  // Keep source values visible, but exclude strong outliers from cheapest claims.
  for(const fuel of ['Benzin','Motorin','LPG']){
    const values=result.map(s=>s.prices[fuel]?.price).filter(Number.isFinite).sort((a,b)=>a-b);
    if(values.length<5)continue;
    const median=values[Math.floor(values.length/2)];
    for(const row of result)if(row.prices[fuel])row.prices[fuel].unusual=Math.abs(row.prices[fuel].price/median-1)>.25;
  }
  return result;
}

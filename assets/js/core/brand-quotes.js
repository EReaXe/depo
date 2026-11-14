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
    if(!keys.includes(row.region)||!fuel||!Number.isInteger(row.kurus)||row.kurus<=0||row.kurus>1000000||(!row.reported_on&&row.scope!=='market-list')||(row.reported_on&&(!/^\d{4}-\d{2}-\d{2}$/.test(row.reported_on)||!Number.isFinite(Date.parse(row.reported_on)))))continue;
    const id=`${row.region}:${row.brand}`;
    if(!rows.has(id))rows.set(id,{id,brandId:row.brand,brand:names.get(row.brand)||row.brand,name:key==='istanbul'?(row.region.endsWith('avrupa')?'İstanbul · Avrupa':'İstanbul · Anadolu'):city,city,district:'',latitude:null,longitude:null,scope:'province-brand',prices:{}});
    const station=rows.get(id),previous=station.prices[fuel];
    const market=row.scope==='market-list';
    const updatedAt=row.reported_on?row.reported_on+'T00:00:00+03:00':row.observedAt;
    if(!Number.isFinite(Date.parse(updatedAt)))continue;
    if(!previous||Date.parse(previous.updatedAt)<Date.parse(updatedAt))station.prices[fuel]={price:row.kurus/100,updatedAt,reportedOn:row.reported_on,observedAt:row.observedAt,estimate:false,stale:market?(!Number.isFinite(Date.parse(row.observedAt))||Date.parse(row.observedAt)>Date.now()+300000||Date.now()-Date.parse(row.observedAt)>86400000):snapshotOld||payload.freshness?.state!=='fresh'||payload.status!=='verified',scope:market?'market-list':'province-brand',source:row.source||'EPDK marka bildirimi · Turkpidya',sourceUrl:row.sourceUrl,aggregation:row.aggregation,previousPrice:Number.isInteger(row.previousKurus)&&row.previousKurus>0?row.previousKurus/100:null};
  }
  for(const report of payload.lpgReports||[]){
    if(!['po','aytemiz'].includes(report.brand)||!Array.isArray(report.prices)||!Number.isFinite(Date.parse(report.observedAt)))continue;
    for(const row of report.prices){
      if(!keys.includes(row.region)&&!(key==='istanbul'&&row.region==='istanbul'))continue;
      if(!Number.isInteger(row.kurus)||row.kurus<=0||row.kurus>100000)continue;
      const id=`${row.region}:${report.brand}`;
      if(!rows.has(id))rows.set(id,{id,brandId:report.brand,brand:names.get(report.brand)||report.brand,name:row.region==='istanbul'?'İstanbul · il geneli':key==='istanbul'?(row.region.endsWith('avrupa')?'İstanbul · Avrupa':'İstanbul · Anadolu'):city,city,district:'',latitude:null,longitude:null,scope:'province-brand',prices:{}});
      const reportedOn=row.reportedOn;
      const updatedAt=reportedOn?reportedOn+'T12:00:00+03:00':report.observedAt;
      if(!Number.isFinite(Date.parse(updatedAt)))continue;
      rows.get(id).prices.LPG={price:row.kurus/100,updatedAt,reportedOn,observedAt:report.observedAt,estimate:false,stale:Date.now()-Date.parse(report.observedAt)>24*60*60*1000,scope:'official-list',source:report.brand==='po'?'Petrol Ofisi · resmî LPG listesi':'Aytemiz · resmî LPG listesi',sourceUrl:report.source};
    }
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

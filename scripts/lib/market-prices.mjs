import {cityKey} from '../../assets/js/core/brand-quotes.js';
import {fuelBrand} from '../../assets/js/data/fuel-brands.js';
const text=s=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export const regionKey=name=>({'afyon':'afyonkarahisar','k-maras':'kahramanmaras','kocaeli':'kocaeli-izmit','sakarya':'sakarya-adapazari'})[cityKey(name)]||cityKey(name);
export const dovizUrl=slug=>'https://www.doviz.com/akaryakit-fiyatlari/'+slug;
export const shellUrl='https://pompafiyat.turkiyeshell.com/api/Public/prices';
export function retainPriceHistory(prices,previous=[]){
  const key=r=>`${r.region}|${r.brand}|${r.product}`;
  const oldRows=new Map(previous.map(r=>[key(r),r]));
  return prices.map(row=>{
    const old=oldRows.get(key(row));
    if(!old||old.sourceUrl!==row.sourceUrl||old.aggregation!==row.aggregation||!Number.isInteger(old.kurus)||old.kurus<=0)return row;
    const time=r=>Date.parse(r.reported_on?r.reported_on+'T00:00:00+03:00':r.observedAt);
    if(!Number.isFinite(time(row))||time(row)<time(old))return row;
    if(row.kurus!==old.kurus)return {...row,previousKurus:old.kurus,changedAt:row.observedAt};
    return {...row,...(Number.isInteger(old.previousKurus)&&old.previousKurus>0?{previousKurus:old.previousKurus,changedAt:old.changedAt}:{})};
  });
}
export function parseDoviz(html,slug,observedAt){
  const table=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(m=>m[1]).find(t=>/Dağıtıcı/.test(t)&&/Benzin/.test(t));
  if(!table)throw Error('Döviz.com fiyat tablosu bulunamadı.');
  const headers=[...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(m=>text(m[1]));
  if(headers.join('|')!=='Dağıtıcı|Benzin|Motorin|LPG|Tarih')throw Error('Döviz.com sütun sırası değişmiş.');
  const rows=[];
  for(const tr of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...tr[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>text(m[1]));
    if(cells.length!==5)continue;
    const brand=fuelBrand(cells[0]==='Total'?'totalenergies':cells[0]);
    const date=cells[4].match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);
    if(!brand||!date)continue;
    const reported_on=`${date[3]}-${date[2]}-${date[1]}`,epoch=Date.parse(reported_on+'T00:00:00Z');
    if(!Number.isFinite(epoch)||new Date(epoch).toISOString().slice(0,10)!==reported_on)continue;
    for(const [i,product] of ['petrol-95','diesel','lpg'].entries()){
      const value=cells[i+1].replace(/^₺\s*/, '');
      if(!/^\d{1,3}(?:\.\d{3})*,\d{2}$/.test(value))continue;
      const kurus=Math.round(Number(value.replaceAll('.','').replace(',','.'))*100);
      if(kurus<=0||kurus>100000)continue;
      rows.push({region:regionKey(slug),brand:brand.id,product,kurus,reported_on,observedAt,source:'Döviz.com · il/marka tablosu',sourceUrl:dovizUrl(slug),scope:'market-list'});
    }
  }
  if(new Set(rows.map(r=>r.brand)).size<3)throw Error('Döviz.com marka kapsamı eksik.');
  return rows;
}
const asian=new Set(['ADALAR','ATASEHIR','BEYKOZ','CEKMEKOY','KADIKOY','KARTAL','MALTEPE','PENDIK','SANCAKTEPE','SULTANBEYLI','SILE','TUZLA','UMRANIYE','USKUDAR']);
const european=new Set(['ARNAVUTKOY','AVCILAR','BAGCILAR','BAHCELIEVLER','BAKIRKOY','BASAKSEHIR','BAYRAMPASA','BESIKTAS','BEYLIKDUZU','BEYOGLU','BUYUKCEKMECE','CATALCA','ESENLER','ESENYURT','EYUP','EYUPSULTAN','FATIH','GAZIOSMANPASA','GUNGOREN','KAGITHANE','KUCUKCEKMECE','SARIYER','SILIVRI','SISLI','SULTANGAZI','ZEYTINBURNU']);
export function parseShell(payload,observedAt){
  if(!Array.isArray(payload?.groups)||!Array.isArray(payload.products))throw Error('Shell fiyat biçimi geçersiz.');
  const codes={'37':'petrol-95','34':'diesel','5':'lpg'};
  for(const code of Object.keys(codes))if(!payload.products.some(p=>p.fepProductCode?.trim()===code&&p.currCode==='TRY'))throw Error('Shell ürün kodları değişmiş.');
  const buckets=new Map();
  for(const group of payload.groups)for(const county of group.counties||[]){
    let region=regionKey(group.cityName);
    if(Number(group.cityCode)===34){
      const name=cityKey(county.countyName).replaceAll('-','').toUpperCase();
      if(asian.has(name))region='istanbul-anadolu';else if(european.has(name))region='istanbul-avrupa';else continue;
    }
    for(const [code,value] of Object.entries(county.prices||{})){
      const product=codes[code.trim()];
      if(!product||!Number.isFinite(value)||value<=0||value>1000)continue;
      const key=region+':'+product;
      if(!buckets.has(key))buckets.set(key,{region,product,values:[]});
      buckets.get(key).values.push(value);
    }
  }
  const rows=[...buckets.values()].map(({region,product,values})=>{
    values.sort((a,b)=>a-b);const i=Math.floor(values.length/2),median=values.length%2?values[i]:(values[i-1]+values[i])/2;
    return {region,brand:'shell',product,kurus:Math.round(median*100),observedAt,source:'Shell · resmî ilçe listesi medyanı',sourceUrl:shellUrl,scope:'market-list',aggregation:'county-median',sampleCount:values.length};
  });
  if(new Set(rows.map(r=>r.region)).size<70)throw Error('Shell il kapsamı eksik.');
  return rows;
}

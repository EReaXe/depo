import {cityKey} from '../../assets/js/core/brand-quotes.js';
const text=s=>s.replace(/<[^>]*>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&amp;/g,'&').trim();
const region=name=>{const k=cityKey(text(name));return ({'afyon':'afyonkarahisar','istanbul-avrupa':'istanbul-avrupa','istanbul-anadolu':'istanbul-anadolu','kocaeli':'kocaeli-izmit','sakarya':'sakarya-adapazari'})[k]||k;};
function price(value){const n=Number(text(value).replace(',','.'));return Number.isFinite(n)&&n>0&&n<1000?Math.round(n*100):null;}
export function parsePoLpg(html){
  const table=html.match(/<table\b[^>]*>[\s\S]*?PO\/gaz Otogaz[\s\S]*?<\/table>/i)?.[0];
  if(!table)throw Error('Petrol Ofisi LPG tablosu bulunamadı.');
  const headers=[...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(m=>text(m[1]));
  if(headers.length!==7||headers[6]!=='PO/gaz Otogaz')throw Error('Petrol Ofisi LPG sütun sırası değişmiş.');
  const result=[];
  for(const match of table.matchAll(/<tr\b[^>]*data-disctrict-name="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)){
    const cells=[...match[2].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)];
    if(cells.length!==7)continue;
    const value=cells[6][1].match(/<span class="with-tax">([^<]+)<\/span>/)?.[1];
    const kurus=value&&price(value);if(kurus)result.push({region:region(match[1]),kurus});
  }
  if(new Set(result.map(r=>r.region)).size<70)throw Error('Petrol Ofisi LPG kapsamı eksik.');
  return result;
}
export function parseAytemizLpg(html){
  const date=html.match(/(\d{2})\.(\d{2})\.(\d{4}) tarihli KDV dahil/);
  if(!date)throw Error('Aytemiz fiyat tarihi bulunamadı.');
  const reportedOn=`${date[3]}-${date[2]}-${date[1]}`;
  const result=[];
  for(const match of html.matchAll(/<tr\b[^>]*>\s*<td\b[^>]*>\s*<a\b[^>]*href="lpg-fiyatlari\/[^"]+"[^>]*>([^<]+)<\/a>\s*<\/td>\s*<td\b[^>]*>([^<]+)<\/td>\s*<\/tr>/g)){
    const kurus=price(match[2]);if(kurus)result.push({region:region(match[1]),kurus,reportedOn});
  }
  if(new Set(result.map(r=>r.region)).size<70)throw Error('Aytemiz LPG kapsamı eksik.');
  return result;
}

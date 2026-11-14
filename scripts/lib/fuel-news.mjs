import {createHash} from 'node:crypto';
const decode=s=>String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&(amp|quot|apos|lt|gt|nbsp);/g,(_,n)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '})[n]);
const plain=s=>decode(decode(s)).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const tag=(s,name)=>s.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]||'';
const months=['ocak','şubat','mart','nisan','mayıs','haziran','temmuz','ağustos','eylül','ekim','kasım','aralık'];
const days=['pazar','pazartesi','salı','çarşamba','perşembe','cuma','cumartesi'];
export function extractExpectationPrices(title,content,fuels){
  const result=new Map(),names=/benzin(?:e|de|in)?|motorin(?:e|de|in)?|mazot(?:a|ta|un)?|lpg|otogaz/gi;
  const fuelOf=s=>/benzin/.test(s)?'Benzin':/motorin|mazot/.test(s)?'Motorin':'LPG';
  // Only explicit future-change clauses; never use a historical price paragraph.
  for(const clause of (title+'\n'+content).toLocaleLowerCase('tr').split(/\n|;|[.!?]\s+/)){
    if(!/beklen|beklenti|geliyor|yolda|yapılacak|öngörül|planlan/.test(clause)||/iptal|beklenmiyor/.test(clause))continue;
    const mentions=[...clause.matchAll(names)];
    const fuelAt=index=>{const preceding=mentions.filter(m=>m.index<index).at(-1);return preceding?fuelOf(preceding[0]):!mentions.length&&fuels.length===1?fuels[0]:null;};
    const number=s=>Number(s.replace(',','.'));
    for(const m of clause.matchAll(/(\d+(?:[,.]\d{1,2})?)\s*(lira|tl|kuruş)(?:\s+(\d{1,2})\s*kuruş)?(?:luk|lük|lık|lik)?\s*(?:tutarında\s*)?(zam|indirim|artış|düşüş)/g)){
      const fuel=fuelAt(m.index),amount=m[2]==='kuruş'?number(m[1])/100:number(m[1])+Number(m[3]||0)/100;
      if(!fuel||!fuels.includes(fuel)||!Number.isFinite(amount)||amount<=0||amount>100)continue;
      const change=Math.round(amount*100)/100*(/indirim|düşüş/.test(m[4])?-1:1);
      const old=result.get(fuel)||{fuel};
      // Conflicting amounts in the same feed are ambiguous; omit that fuel.
      if(old.change!==undefined&&old.change!==change){old.conflict=true;}else old.change=change;
      result.set(fuel,old);
    }
    for(const m of clause.matchAll(/litre\s+fiyatının\s+(\d+(?:[,.]\d{1,2})?)\s*(?:lira|tl)(?:ya|ye|'ye|'ya|’ye|’ya)?\s+(?:çıkması|yükselmesi|düşmesi|inmesi|olması)\s+bekleniyor/g)){
      const fuel=fuelAt(m.index),price=number(m[1]);
      if(!fuel||!fuels.includes(fuel)||price<=0||price>1000)continue;
      const old=result.get(fuel)||{fuel};
      if(old.expectedPrice!==undefined&&old.expectedPrice!==price)old.conflict=true;else old.expectedPrice=price;
      result.set(fuel,old);
    }
  }
  return [...result.values()].filter(r=>!r.conflict);
}
function midnight(value){const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));return Date.parse(date+'T00:00:00+03:00');}
function expiry(text,published){
  const lower=text.toLocaleLowerCase('tr'),base=midnight(published),dates=[];let explicitDate=false;
  for(const match of lower.matchAll(new RegExp(`\\b(\\d{1,2})\\s+(${months.join('|')})(?:\\s+(20\\d{2}))?`,'g'))){
    explicitDate=true;
    let year=Number(match[3]||new Date(published+3*3600000).getUTCFullYear()),month=months.indexOf(match[2])+1;
    if(!match[3]&&month===1&&new Date(published+3*3600000).getUTCMonth()===11)year++;
    const iso=`${year}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    const value=Date.parse(iso+'T00:00:00+03:00');
    if(Number.isFinite(value)&&new Date(value+3*3600000).toISOString().slice(0,10)===iso)dates.push(value);
  }
  if(dates.length)return Math.min(...dates);
  if(explicitDate)return NaN;
  if(/yarın|bu gece|gece yarısı/.test(lower))return base+24*3600000;
  for(let i=0;i<days.length;i++)if(new RegExp(days[i]+"(?:'|’)?(?:den|dan|ten|tan)? itibaren").test(lower)){
    const weekday=new Date(base+3*3600000).getUTCDay(),delta=(i-weekday+7)%7;
    return base+delta*24*3600000;
  }
  // No reliable effective date: do not carry a headline into the following day.
  return Math.min(published+12*3600000,base+24*3600000);
}
export function parseFuelNews(xml,source,now=Date.now()){
  if(!/<(?:feed|rss)\b/.test(xml))throw Error(source.name+' haber akışı geçersiz.');
  const entries=[...xml.matchAll(/<(?:entry|item)\b[^>]*>([\s\S]*?)<\/(?:entry|item)>/g)],items=[],cancelledIds=[];
  for(const [,entry] of entries){
    const title=plain(tag(entry,'title')),content=plain(tag(entry,'summary')||tag(entry,'description')||tag(entry,'content:encoded')||tag(entry,'content'));
    const publishedAt=plain(tag(entry,'published')||tag(entry,'pubDate')),published=Date.parse(publishedAt);
    if(!Number.isFinite(published)||published>now+300000||now-published>72*3600000)continue;
    const rawUrl=entry.match(/<link\b[^>]*href="([^"]+)"/)?.[1]||tag(entry,'link')||tag(entry,'id');
    let url;try{url=new URL(plain(rawUrl));}catch{continue;}
    if(url.protocol!=='https:'||url.hostname!==new URL(source.url).hostname)continue;
    url.search='';url.hash='';
    const id='news-'+createHash('sha256').update(url.href).digest('hex').slice(0,24);
    if(!/benzin|motorin|mazot|lpg|otogaz|akaryakıt/i.test(title)||!/zam|indirim|düşüş|artış/i.test(title))continue;
    if(/beklenmiyor|iptal|zam yok|indirim yok/i.test(title)){cancelledIds.push(id);continue;}
    if(title.includes('?')||!/beklen|beklenti|geliyor|yolda|yapılacak|öngörül|planlan/i.test(title))continue;
    const expiresAt=expiry(title+' '+content,published);
    if(!Number.isFinite(expiresAt)||expiresAt<=now||expiresAt>published+72*3600000)continue;
    const fuels=[];if(/benzin/i.test(title))fuels.push('Benzin');if(/motorin|mazot/i.test(title))fuels.push('Motorin');if(/lpg|otogaz/i.test(title))fuels.push('LPG');if(!fuels.length)fuels.push('Benzin','Motorin','LPG');
    const short=title.split(/\s+/).slice(0,24).join(' ').slice(0,210);
    items.push({id,title:short,fuels,prices:extractExpectationPrices(title,content,fuels),source:source.name,url:url.href,publishedAt:new Date(published).toISOString(),expiresAt:new Date(expiresAt).toISOString()});
  }
  return {items,cancelledIds};
}

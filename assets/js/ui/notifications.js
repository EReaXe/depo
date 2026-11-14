import {activeExpectations,comparePriceSnapshot,expectationPriceText} from '../core/market-notifications.js';
import {fetchStations} from '../core/prices.js';
import {attachSheetDrag} from './sheet-drag.js';
const key='depo-notifications-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>new Date(value).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
export function createNotificationCenter({button,getQuery,onChange,notify,storage}){
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  let state={items:[],seenNews:[],snapshots:{},preferences:{expectations:true,prices:true}},news={kind:'fuel-expectations',items:[]},busy=false,status='',expiryTimer;
  try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved&&Array.isArray(saved.items)&&Array.isArray(saved.seenNews)&&saved.snapshots&&typeof saved.snapshots==='object'){
    state.items=saved.items.filter(item=>item&&['expectation','price'].includes(item.type)&&typeof item.id==='string'&&typeof item.title==='string'&&item.title.length<250&&typeof item.body==='string'&&item.body.length<600&&Number.isFinite(Date.parse(item.createdAt))&&Date.now()-Date.parse(item.createdAt)<30*24*3600000&&Array.isArray(item.sources)).slice(0,50);
    state.seenNews=saved.seenNews.filter(id=>typeof id==='string').slice(-300);state.snapshots=saved.snapshots;
    state.preferences={expectations:saved.preferences?.expectations!==false,prices:saved.preferences?.prices!==false};
  }}catch{status='Bildirim geçmişi bu tarayıcıda okunamadı.';}
  const dialog=document.createElement('dialog');dialog.className='iosSheet notificationSheet';dialog.setAttribute('aria-labelledby','notificationTitle');document.body.append(dialog);
  let previousFocus;
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('sheetOpen');if(previousFocus?.isConnected&&!document.querySelector('dialog[open]'))previousFocus.focus({preventScroll:true});});
  function persist(){try{if(!storage)throw Error();storage.setItem(key,JSON.stringify(state));}catch{status='Bildirim geçmişi ve tercihler bu tarayıcıda saklanamıyor. Bu oturumda bildirimleri görebilirsiniz.';}}
  function publish(){
    const unread=state.items.filter(item=>!item.read).length,badge=button.querySelector('.notificationBadge');
    badge.hidden=!unread;badge.textContent=unread>9?'9+':String(unread);
    button.setAttribute('aria-label',unread?`Bildirimler, ${unread} okunmamış bildirim`:'Bildirimler');
    if(dialog.open)renderPanel();onChange?.();
  }
  function add(item){
    if(state.items.some(old=>old.id===item.id))return;
    state.items=[{...item,read:dialog.open},...state.items].filter(row=>Date.now()-Date.parse(row.createdAt)<30*24*3600000).slice(0,50);
  }
  function announce(message){if(document.getElementById('welcome')?.hidden===false||document.querySelector('dialog[open]'))return;notify?.(message);}
  function observeNews(payload){
    news=payload;const active=activeExpectations(news);let added=false;
    for(const item of active){if(state.seenNews.includes(item.id))continue;state.seenNews.push(item.id);if(state.preferences.expectations){add({id:item.id,type:'expectation',title:'Yeni fiyat beklentisi',body:item.title+'\n'+expectationPriceText(item),createdAt:item.publishedAt,sources:[{name:item.source,url:item.url}]});added=true;}}
    for(const item of active){const existing=state.items.find(row=>row.id===item.id&&row.type==='expectation');if(existing)existing.body=item.title+'\n'+expectationPriceText(item);}
    state.seenNews=state.seenNews.slice(-300);persist();publish();
    clearTimeout(expiryTimer);if(active.length)expiryTimer=setTimeout(()=>observeNews(news),Math.max(1,Math.min(...active.map(item=>Date.parse(item.expiresAt)))-Date.now()+20));
    if(added)announce('Yeni bir fiyat beklentisi var. Bildirimler bölümünden inceleyebilirsiniz.');
  }
  function observePrices(result,query){
    if(!query?.city||!Array.isArray(result.stations))return;
    const previous=state.snapshots[query.city],comparison=comparePriceSnapshot(previous,result.stations,result.checkedAt);
    if(!comparison.snapshot)return;
    state.snapshots[query.city]=comparison.snapshot;
    if(comparison.changed.length&&state.preferences.prices){
      const fuels=[...new Set(comparison.changed.map(row=>row.fuel))],brands=new Set(comparison.changed.map(row=>row.brand));
      const urls=[...new Set(comparison.changed.map(row=>row.sourceUrl))];
      add({id:'price-'+query.city+'-'+comparison.snapshot.checkedAt,type:'price',title:query.city+' fiyatları değişti',body:`Son kontrolünüze göre ${brands.size} markanın ${fuels.join(', ')} bildirimlerinde fiyat değişikliği var. Güncel listeyi Fiyatlar bölümünden inceleyebilirsiniz.`,createdAt:new Date().toISOString(),sources:urls.map(url=>({url,name:url.includes('petrolofisi')?'Petrol Ofisi':url.includes('aytemiz')?'Aytemiz':'Turkpidya'}))});
      announce('Seçili ilinizde fiyat değişikliği var. Bildirimler bölümünü açabilirsiniz.');
    }
    persist();publish();
  }
  function sourceLink(source){let url;try{url=new URL(source.url);}catch{return '';}
    if(url.protocol!=='https:'||!['www.ntv.com.tr','ntv.com.tr','www.trthaber.com','trthaber.com','turkpidya.com','www.petrolofisi.com.tr','www.aytemiz.com.tr'].includes(url.hostname))return '';
    return `<a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(source.name)}</a>`;
  }
  function renderPanel(){
    const hadFocus=dialog.contains(document.activeElement),focusId=hadFocus?document.activeElement.id:null;
    dialog.innerHTML=`<div class="sheetTop"><button type="button" class="sheetGrabber"><span></span></button><button class="sheetClose" aria-label="Paneli kapat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div><div class="sheetHeading"><h2 id="notificationTitle" tabindex="-1">Bildirimler</h2><button id="refreshNotifications" class="headerIcon" aria-label="Bildirimleri yenile" ${busy?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M19 12a7 7 0 0 0-12-5M5 12a7 7 0 0 0 12 5"/></svg></button></div><div class="sheetContent notificationContent"><p class="notificationNote">Uygulama açıkken kontrol edilir. Uygulama kapalıyken telefona bildirim gönderilmez.</p><fieldset class="notificationPreferences"><legend>Bildirim tercihleri</legend><div class="notificationPreferenceOptions"><label>Fiyat beklentileri<input id="notifyExpectations" type="checkbox" ${state.preferences.expectations?'checked':''}></label><label>Fiyat değişiklikleri<input id="notifyPrices" type="checkbox" ${state.preferences.prices?'checked':''}></label></div></fieldset>${status?`<p class="notificationNote" role="status">${esc(status)}</p>`:''}${state.items.length?`<ol class="notificationList">${state.items.map(item=>`<li><div class="notificationMeta"><span>${item.type==='expectation'?'Beklenti haberi':'Fiyat güncellemesi'}</span><time datetime="${esc(item.createdAt)}">${date(item.createdAt)}</time></div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><div class="notificationSources">${item.sources.map(sourceLink).join('')}</div></li>`).join('')}</ol>`:'<div class="notificationEmpty"><h3>Henüz bildirim yok</h3><p>Yeni bir beklenti haberi veya seçtiğiniz ilde fiyat değişikliği olduğunda burada görünecek.</p></div>'}</div>`;
    dialog.querySelector('.sheetClose').onclick=()=>dialog.close();dialog.querySelector('#refreshNotifications').onclick=refresh;attachSheetDrag(dialog);
    for(const [id,preference] of [['notifyExpectations','expectations'],['notifyPrices','prices']])dialog.querySelector('#'+id).onchange=e=>{state.preferences[preference]=e.target.checked;persist();publish();};
    if(hadFocus&&dialog.open){const target=focusId?dialog.querySelector('#'+focusId):null;(target&&!target.disabled?target:dialog.querySelector('#notificationTitle')).focus({preventScroll:true});}
  }
  button.onclick=()=>{
    if(document.querySelector('dialog[open]'))return;
    previousFocus=document.activeElement;state.items.forEach(item=>item.read=true);persist();renderPanel();dialog.showModal();document.body.classList.add('sheetOpen');publish();dialog.querySelector('#notificationTitle').focus({preventScroll:true});
  };
  async function refresh(){
    if(busy||document.visibilityState==='hidden')return;busy=true;publish();
    if(status==='Son kontrol tamamlanamadı. İnternet bağlantısı olduğunda yeniden denenecek.')status='';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
    const query=getQuery?.();
    const results=await Promise.allSettled([
      fetch('./assets/data/fuel-news.json',{cache:'no-store',signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('Haber dosyası alınamadı.');const payload=await response.json();if(payload.kind!=='fuel-expectations'||!Array.isArray(payload.items))throw Error('Haber dosyası geçersiz.');observeNews(payload);}),
      query?.city?fetchStations(query,{signal:controller.signal}).then(result=>observePrices(result,query)):Promise.resolve()
    ]);
    clearTimeout(timeout);busy=false;
    if(results.some(result=>result.status==='rejected'))status='Son kontrol tamamlanamadı. İnternet bağlantısı olduğunda yeniden denenecek.';publish();
  }
  publish();
  return {getExpectations:()=>activeExpectations(news),observePrices,start(){refresh();setInterval(refresh,5*60*1000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){publish();refresh();}});}};
}

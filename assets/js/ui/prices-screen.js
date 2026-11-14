import {expectationPriceText} from '../core/market-notifications.js';
import {fuelBrands,groupBrandStations} from '../data/fuel-brands.js';
import {attachSheetDrag} from './sheet-drag.js';
import {resolveCity} from '../core/location.js';
import {priceConfig,priceFuels,cities} from '../data/price-config.js';
import {fetchStations,cheapestStations,sortedStations,isCurrent} from '../core/prices.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:2}).format(n);
const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const fuelIcon=f=>icon(f==='Motorin'?'M12 3c0 0-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z':f==='LPG'?'M8 5V3h8v2M7 6h10l2 4v11H5V10zM5 12h14':'M4 21V4h10v17M2 21h14M7 7h4v5H7zM14 10h3l4 5v4M18 4l3 3v8');
export function priceTrendMarkup(price){
  if(!isCurrent(price)||!Number.isFinite(price.previousPrice)||price.previousPrice<=0||Math.abs(price.price-price.previousPrice)<.005)return '';
  const up=price.price>price.previousPrice,label=(up?'Arttı':'Düştü')+'; önceki fiyat '+money(price.previousPrice);
  return `<span class="priceTrend ${up?'priceTrendUp':'priceTrendDown'}" role="img" aria-label="${esc(label)}" title="${esc(label)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${up?'M8 13V3M4 7l4-4 4 4':'M8 3v10M4 9l4 4 4-4'}"/></svg></span>`;
}
export function createPricesScreen({host,getVehicle,load=fetchStations,getExpectations=()=>[],onPrices}){
  let provider='',datasetScope='province-brand',otherOpen=false;
  let query=null,stations=[],national=[],checkedAt=null,selectedFuel='LPG',active=false,busy=false,error='',notice='',controller,timer,version=0;
  try{const city=localStorage.getItem('depo-price-city');if(cities.includes(city))query={mode:'city',city};}catch{}
  const picker=document.createElement('dialog');picker.className='iosSheet cityPicker';picker.setAttribute('aria-labelledby','cityPickerTitle');document.body.append(picker);
  let pickerFocus;
  picker.addEventListener('close',()=>{document.body.classList.remove('sheetOpen');if(pickerFocus?.isConnected)pickerFocus.focus({preventScroll:true});});
  function chooseCity(city){query={mode:'city',city};try{localStorage.setItem('depo-price-city',city);}catch{}notice='';stations=[];refresh();}
  function openPicker(){
    pickerFocus=document.activeElement;
    picker.classList.remove('expanded');
    picker.innerHTML=`<div class="refillToolbar"><button id="closeCity">Vazgeç</button><h2 id="cityPickerTitle">İl seç</h2><span></span></div><div class="sheetContent"><label class="citySearch">İl ara<input type="search" id="citySearch" placeholder="Şehir adı" autocomplete="off"></label><div class="cityList">${cities.map(c=>`<button data-city="${esc(c)}">${esc(c)}${query?.city===c?'<span aria-label="Seçili">✓</span>':''}</button>`).join('')}</div><p id="cityNoResults" hidden>İl bulunamadı.</p></div>`;
    picker.querySelector('#closeCity').onclick=()=>picker.close();
    picker.querySelectorAll('[data-city]').forEach(button=>button.onclick=()=>{picker.close();chooseCity(button.dataset.city);});
    picker.querySelector('#citySearch').oninput=e=>{const q=e.target.value.toLocaleLowerCase('tr');let count=0;picker.querySelectorAll('[data-city]').forEach(b=>{b.hidden=!b.dataset.city.toLocaleLowerCase('tr').includes(q);if(!b.hidden)count++;});picker.querySelector('#cityNoResults').hidden=count>0;};
    picker.showModal();attachSheetDrag(picker);document.body.classList.add('sheetOpen');
  }
  async function locate(){
    if(!navigator.geolocation){notice='Bu tarayıcıda konum hizmeti yok. İl seçerek devam edebilirsiniz.';render();openPicker();return;}
    const token=++version;controller?.abort();busy=true;notice='Konumunuz belirleniyor…';render();
    navigator.geolocation.getCurrentPosition(async position=>{
      if(token!==version||!active)return;
      try{const city=await resolveCity(position.coords.latitude,position.coords.longitude);if(token!==version||!active)return;if(!city){busy=false;notice='Konumunuz Türkiye il sınırlarıyla eşleştirilemedi. İl seçin.';render();openPicker();return;}query={mode:'location',city,latitude:position.coords.latitude,longitude:position.coords.longitude};stations=[];notice=city+' konumdan belirlendi. ';refresh();}catch(e){if(token!==version||!active)return;busy=false;notice='Konumdan il belirlenemedi. İl seçin.';render();openPicker();}
    },reason=>{if(token!==version||!active)return;busy=false;notice=reason.code===1?'Konum izni verilmedi. İl seçerek devam edebilirsiniz.':'Konum alınamadı. İl seçerek devam edebilirsiniz.';render();openPicker();},{timeout:12000,maximumAge:60000,enableHighAccuracy:false});
  }
  async function refresh(){
    const token=++version;controller?.abort();controller=new AbortController();
    if(!query&&priceConfig.endpoint){busy=false;render();return;}
    busy=true;error='';render();
    const requestController=controller;const timeout=setTimeout(()=>requestController.abort(),15000);
    try{const result=await load(query,{signal:controller.signal});if(token!==version)return;stations=result.stations;provider=result.provider||'';datasetScope=result.scope||'station';national=result.national||[];checkedAt=result.checkedAt||null;onPrices?.(result,query);}
    catch(e){if(token!==version)return;error=e.name==='AbortError'?'Fiyat isteği zaman aşımına uğradı. Yeniden deneyin.':e.message;}
    finally{clearTimeout(timeout);if(token===version){busy=false;render();}}
  }
  function render(){
    const title=query?.city||'İl seçin';
    const groups=groupBrandStations(stations);
    for(const brand of fuelBrands){if(!groups[brand.group].some(s=>s.brandId===brand.id))groups[brand.group].push({id:'missing:'+brand.id,brandId:brand.id,brand:brand.name,logo:brand.logo,name:query?'Bu il için bildirim yok':'İl seçin',prices:{}});}
    const displayed=[...groups.main,...groups.other];
    const cheapest=cheapestStations(groups.main),vehicle=getVehicle();
    const table=rows=>`<div class="stationTableWrap"><table class="stationTable"><thead><tr><th scope="col">Marka</th>${priceFuels.map(f=>`<th scope="col"><button data-fuel="${f}" class="${selectedFuel===f?'selected':''}" aria-label="${f} fiyatına göre sırala" aria-pressed="${selectedFuel===f}">${fuelIcon(f)}${f}</button></th>`).join('')}</tr></thead><tbody>${sortedStations(rows,selectedFuel).map(s=>`<tr><th scope="row"><span class="fuelBrandIdentity"><img class="fuelBrandLogo fuelBrandLogo-${esc(s.brandId)}" src="${esc(s.logo)}" alt="" width="64" height="32"><span>${esc(s.brand)}</span></span><small>${esc(s.name)}</small></th>${priceFuels.map(f=>{const p=s.prices[f];const date=p?.reportedOn?new Date(p.reportedOn+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}):p?.observedAt?'Kontrol '+new Date(p.observedAt).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}):'';return `<td ${p?`title="${esc((isCurrent(p)?'':'Eski veya doğrulanmamış · ')+(p.source||'EPDK marka bildirimi')+' · '+(p.reportedOn||p.observedAt||p.updatedAt))}"`:''}><span class="${cheapest[f]?.id===s.id?'lowest ':''}${p&&!isCurrent(p)?'oldPrice':''}">${p?money(p.price).replace('₺',''):'—'}</span>${priceTrendMarkup(p)}${p?`<small class="priceReported">${esc(date)}${p.unusual?' · kontrol':''}</small>`:''}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;

    const brandMode=datasetScope==='province-brand';const referenceMode=!brandMode&&!priceConfig.endpoint&&stations.length===0;const references=Object.fromEntries(national.map(p=>[p.fuelType,p]));
    const regionNotice=brandMode?'İl bazlı marka fiyatlarıdır; tek bir istasyonun kesin pompa fiyatı değildir.':referenceMode?'Türkiye geneli tahmini fiyatlar; seçilen il veya en yakın istasyonun fiyatı değildir.':'';
    const selected=cheapest[selectedFuel];
    const validDates=displayed.flatMap(s=>Object.values(s.prices).filter(p=>isCurrent(p)).map(p=>Date.parse(p.updatedAt)));
    const updated=validDates.length?new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(Math.min(...validDates)):null;
    host.innerHTML=`${getExpectations().map(item=>`<aside class="fuelExpectation" aria-label="Fiyat beklentisi"><h2>Fiyat beklentisi</h2><p>${esc(item.title)}</p><p class="expectationAmount">${esc(expectationPriceText(item))}</p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.source)} · ${new Date(item.publishedAt).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</a><small>Beklentidir; kesinleşmiş pompa fiyatı değildir.</small></aside>`).join('')}<div class="priceLocation"><button id="pickCity">${icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l5 5')}İl seç</button><button id="useLocation" class="${query?.mode==='location'?'active':''}" aria-label="Konumuma göre istasyonları bul">${icon('m3 10 18-7-7 18-3-8-8-3z')}Konumum</button>${['Ankara','İstanbul','İzmir'].map(city=>`<button data-quick-city="${city}" class="${query?.city===city?'active':''}" aria-pressed="${query?.city===city}">${city}</button>`).join('')}</div><p class="priceNotice" role="status">${esc((notice||(query?.mode==='city'?query.city+' seçili. ':!query?'Konumunuzu kullanın veya il seçin. ':''))+(regionNotice?' '+regionNotice:''))}</p>
      <section class="cheapestPanel" aria-labelledby="cheapestTitle"><div class="pricePanelHeading"><h2 id="cheapestTitle">${icon('M3 3h9l9 9-9 9-9-9V3zM7 7h.01')}${brandMode?'Listede en düşük':referenceMode?'Ulusal referans':'En ucuzlar'} <small>${esc(referenceMode?'Türkiye':title)}</small></h2>${selected&&selected.latitude!==null&&selected.longitude!==null?`<a class="priceMap" href="https://www.google.com/maps/search/?api=1&amp;query=${selected.latitude},${selected.longitude}" target="_blank" rel="noopener noreferrer">${icon('m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16')}Harita</a>`:'<span class="priceMap unavailable" aria-label="Harita için istasyon verisi gerekli">Harita</span>'}</div><div class="cheapestGrid">${priceFuels.map(f=>{const station=cheapest[f],reference=references[f];return `<button data-fuel="${f}" class="cheapestFuel ${selectedFuel===f?'selected':''}" aria-pressed="${selectedFuel===f}"><span>${fuelIcon(f)}${f}</span><strong>${referenceMode&&reference?'≈'+money(reference.price):station?money(station.prices[f].price):'—'}${station?priceTrendMarkup(station.prices[f]):''}</strong><small>${referenceMode&&reference?new Date(reference.date).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+(Date.now()-Date.parse(reference.date)>priceConfig.maxAgeMs?' · eski tahmin':' · tahmini'):station?esc(station.brand):'Veri bekleniyor'}</small></button>`;}).join('')}</div><p class="priceVehicle">${brandMode?'En düşük fiyatlar yalnızca 7 ana marka arasında seçilir. Fiyatlar il/marka düzeyindedir; kaynak kapsamı aşağıda belirtilir.':referenceMode?'Ulusal tahminler istasyon karşılaştırması veya dolum fiyatı olarak kullanılmaz.':vehicle?esc(vehicle.name):'Karşılaştırma listelenen istasyonlar içindir.'}</p><div class="priceUpdate"><span>${busy?'Fiyatlar yükleniyor…':(brandMode||referenceMode)&&checkedAt?'Kaynak kontrolü · '+new Date(checkedAt).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):updated?`Fiyat zamanı · ${updated}`:'Güncel fiyat henüz alınmadı'}</span><button id="refreshPrices" ${busy?'disabled':''} aria-label="Fiyatları yenile">${icon('M20 7v5h-5M4 17v-5h5M19 12a7 7 0 0 0-12-5M5 12a7 7 0 0 0 12 5')}</button></div>${brandMode&&provider==='doviz-shell'?'<a class="nationalSource" href="https://www.doviz.com/akaryakit-fiyatlari" target="_blank" rel="noopener noreferrer">Veri: Döviz.com · il/marka fiyatları</a><a class="nationalSource" href="https://pompafiyat.turkiyeshell.com/" target="_blank" rel="noopener noreferrer">Shell · resmî fiyat servisi</a>':brandMode?'<a class="nationalSource" href="https://turkpidya.com/en/tools?utm_source=api&amp;utm_medium=credit&amp;utm_campaign=tools" target="_blank" rel="noopener noreferrer">Veri: Turkpidya · EPDK marka bildirimleri</a>':referenceMode?'<a class="nationalSource" href="https://ucuzyakitbul.com.tr/api-docs" target="_blank" rel="noopener noreferrer">Kaynak: UcuzYakıtBul · Ulusal Referans</a>':''}</section>
      ${error?`<p class="priceMessage" role="status">${esc(error)}</p>`:''}
      <section class="stationPanel" aria-labelledby="stationListTitle"><div class="stationHeading"><h2 id="stationListTitle">Marka fiyatları</h2><span>7 ana marka · TL / litre</span></div>${table(groups.main)}<details class="otherBrands" ${otherOpen?'open':''}><summary>Diğer markalar <span>GO, Kadoil, Sunpet, M Oil</span></summary>${table(groups.other)}</details><p class="stationFootnote">En düşük fiyat vurgusu yalnızca 7 ana marka içindir. Diğer markalar karşılaştırmaya katılmaz. ${provider==='doviz-shell'?'Döviz.com il/marka tabloları kullanılır. Shell değerleri resmî servisteki ilçe fiyatlarının medyanıdır; tek istasyon fiyatı değildir. Kaynakta fiyat yoksa — gösterilir. 24 saatten eski kontroller ve 10 günden eski tablo tarihleri karşılaştırmaya alınmaz.':'Benzin ve motorin: son 30 günlük EPDK bildirimleri. LPG: Petrol Ofisi ve Aytemiz resmî il listeleri; doğrulanmış veri yoksa — gösterilir.'} Kontrol tarihi, fiyatın değiştiği tarih değildir. Pompadaki fiyat farklı olabilir.</p>${provider==='doviz-shell'?'':`<div class="lpgSources"><span>LPG kaynakları</span><a href="https://www.petrolofisi.com.tr/akaryakit-fiyatlari" target="_blank" rel="noopener noreferrer">Petrol Ofisi</a><a href="https://www.aytemiz.com.tr/akaryakit-fiyatlari/lpg-fiyatlari" target="_blank" rel="noopener noreferrer">Aytemiz</a></div>`}</section>`;
    host.querySelector('.otherBrands').ontoggle=e=>{otherOpen=e.target.open;};
    host.querySelector('#pickCity').onclick=openPicker;host.querySelector('#useLocation').onclick=locate;host.querySelector('#refreshPrices').onclick=refresh;
    host.querySelectorAll('[data-quick-city]').forEach(b=>b.onclick=()=>chooseCity(b.dataset.quickCity));
    host.querySelectorAll('[data-fuel]').forEach(b=>b.onclick=()=>{selectedFuel=b.dataset.fuel;render();});
  }
  function show(){if(active)return;active=true;render();refresh();if(!query&&navigator.permissions)navigator.permissions.query({name:'geolocation'}).then(p=>{if(p.state==='granted'&&active&&!query)locate();}).catch(()=>{});timer=setInterval(()=>{if(active&&document.visibilityState==='visible'&&!busy&&(query||!priceConfig.endpoint))refresh();},priceConfig.refreshMs);}
  function hide(){if(!active)return;active=false;version++;controller?.abort();clearInterval(timer);busy=false;if(picker.open)picker.close();}
  return {show,hide,render,getQuery:()=>query};
}

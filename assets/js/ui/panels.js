import {resolveVehicleSpecs} from '../data/vehicle-specs.js';
import {brands} from '../data/vehicles.js';
import {attachSheetDrag} from './sheet-drag.js';
import {installationGuide} from './install.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export function vehicleProperties(vehicle,records){
  const {values:spec}=resolveVehicleSpecs(vehicle);
  const number=n=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:1}).format(n);
  const consumption=spec.urban!==null&&spec.extraUrban!==null&&spec.cycle==='NEDC'?`${number(spec.urban)} / ${number(spec.extraUrban)} L/100 km (NEDC)`:null;
  const combined=spec.combined?`${spec.combined.map(number).filter((v,i,a)=>i===0||v!==a[0]).join('–')} L/100 km (${spec.cycle})`:null;
  const km=records.reduce((max,r)=>Math.max(max,r.km),vehicle.currentKm??0);
  return [['Marka',vehicle.brand||vehicle.name],['Model',vehicle.model],['Yıl',vehicle.year],['Plaka',vehicle.plate],['Yakıt',vehicle.fuel],['Vites',vehicle.transmission],['Araç tipi',spec.body],['Motor',spec.engine],['Depo',spec.tankLitres!==null?`${number(spec.tankLitres)} L`:null],['Şehir / Yol',consumption],...(combined?[['Fabrika birleşik',combined]]:[]),['Renk',vehicle.color],['Kilometre',vehicle.currentKm!==undefined||records.length?`${new Intl.NumberFormat('tr-TR').format(km)} km`:null]];
}
export function createPanels({getState,editVehicle,addVehicle,theme,onThemeStorageError,openBackup,openClear}){
  const dialog=document.createElement('dialog');dialog.className='iosSheet';dialog.setAttribute('aria-labelledby','sheetTitle');document.body.append(dialog);
  const settings=document.getElementById('settings');
  const storageNote=document.getElementById('storageNote');
  const install=document.getElementById('install');
  const parking=document.createElement('div');parking.hidden=true;document.body.append(parking);parking.append(settings,storageNote);
  let returnFocus=null;
  function dismiss(){dialog.close();}
  dialog.addEventListener('close',()=>{if(settings.parentElement!==parking){parking.append(settings,storageNote);}settings.querySelector('div').prepend(install);if(!document.querySelector('dialog[open]'))document.body.classList.remove('sheetOpen');if(returnFocus?.isConnected&&!document.querySelector('dialog[open]')&&document.getElementById('welcome').hidden)returnFocus.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target.closest('#showWelcome'))dismiss();},true);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dismiss();}});
  function show(content){
    if(!dialog.open)returnFocus=document.activeElement;
    if(settings.parentElement!==parking)parking.append(settings,storageNote);
    settings.querySelector('div').prepend(install);
    dialog.classList.remove('expanded');
    dialog.innerHTML=`<div class="sheetTop"><button class="sheetGrabber" aria-label="Paneli genişlet" aria-expanded="false"><span></span></button><button class="sheetClose" aria-label="Paneli kapat">${svg('m7 7 10 10M17 7 7 17')}</button></div>${content}`;
    dialog.querySelector('.sheetClose').onclick=dismiss;
    if(!dialog.open)dialog.showModal();attachSheetDrag(dialog,{close:dismiss});document.body.classList.add('sheetOpen');dialog.querySelector('#sheetTitle').focus({preventScroll:true});
  }
  function showVehicle(id){
    const state=getState(),v=state.vehicles.find(v=>v.id===id);if(!v)return;
    const brand=brands.find(b=>b.name===v.brand);
    const logo=brand?`<img src="./assets/brands/${brand.slug}.${brand.slug==='togg'?'svg':'png'}" alt="">`:'';
    const rows=vehicleProperties(v,state.records.filter(r=>r.vehicle===id));
    const technical=resolveVehicleSpecs(v);
    const specNote=technical.matched?'Teknik bilgiler Türkiye üretici kataloğundan eşleştirildi. Versiyonlar arasında değişen veya kaynakta olmayan alanlar — gösterilir. Fabrika tüketimi gerçek dolum ortalamanız değildir; WLTP birleşik değeri şehir/yol değeri yerine kullanılmaz.':'Bu marka, model, yıl ve yakıt için doğrulanmış teknik bilgi bulunamadı. Eksik alanlar tahmin edilmez.';
    show(`<div class="sheetHeading vehicleSheetHeading"><div class="sheetIdentity">${logo}<div><h2 id="sheetTitle" tabindex="-1">${esc(v.name)}</h2><p>Tüm araç özellikleri</p></div></div><button class="sheetEdit" id="sheetEdit" aria-label="Aracı düzenle">${svg('m14 5 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z')}<span>Düzenle</span></button></div><div class="sheetContent"><dl class="propertyList">${rows.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${value!==null&&value!==undefined&&value!==''?esc(value):'—'}</dd></div>`).join('')}</dl><div class="vehicleSpecNote"><p>${esc(specNote)}</p>${technical.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)}${source.archived?' · üreticinin güncel teknik sayfası':''}</a>`).join('')}</div></div>`);
    dialog.querySelector('#sheetEdit').onclick=()=>{dismiss();editVehicle(id);};
  }
  function showSettings(){
    show(`<div class="sheetHeading"><div><h2 id="sheetTitle" tabindex="-1">Ayarlar</h2><p>Depo · Beta</p></div></div><div class="sheetContent" id="settingsContent"><section class="settingsGroup"><button id="settingsAddVehicle">${svg('M12 5v14M5 12h14')}<span>Garaja araç ekle</span>${svg('m9 6 6 6-6 6')}</button></section><h3 class="groupLabel">Veriler ve uygulama</h3><section class="settingsGroup"><button id="settingsBackup">${svg('M4 7h16v14H4zM8 7V3h8v4M8 12h8M8 16h5')}<span>Yedekleme ve aktarım</span>${svg('m9 6 6 6-6 6')}</button></section><div id="settingsPortal"></div></div>`);
    dialog.querySelector('#settingsPortal').append(settings,storageNote);settings.hidden=false;storageNote.hidden=false;
    const installGroup=document.createElement('section');installGroup.className='settingsGroup settingsInstall';installGroup.append(install);dialog.querySelector('#settingsContent').prepend(installGroup);
    const appearance=document.createElement('fieldset');appearance.className='themeSettings';
    appearance.innerHTML=`<legend>Görünüm</legend><div class="themeOptions">${[['system','Cihaz teması','Cihazınızın açık veya koyu temasını izler.'],['light','Açık',''],['dark','Koyu','']].map(([value,label,note])=>`<label><span>${label}${note?`<small>${note}</small>`:''}</span><input type="radio" name="theme" value="${value}" ${theme.getPreference()===value?'checked':''}></label>`).join('')}</div>`;
    appearance.addEventListener('change',e=>{if(e.target.matches('input[name="theme"]')&&!theme.setPreference(e.target.value))onThemeStorageError?.();});
    dialog.querySelector('#settingsAddVehicle').closest('.settingsGroup').after(appearance);
    dialog.querySelector('#settingsBackup').onclick=()=>{dismiss();openBackup();};
    const clearButton=document.createElement('button');clearButton.id='settingsClear';clearButton.className='clearDataAction';
    clearButton.innerHTML=`${svg('M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7')}<span>Tüm verileri temizle</span>${svg('m9 6 6 6-6 6')}`;
    dialog.querySelector('#settingsBackup').after(clearButton);
    clearButton.onclick=()=>{dismiss();openClear();};
    dialog.querySelector('#settingsAddVehicle').onclick=()=>{dismiss();addVehicle();};
  }
  function showInfo(){
    show(`<div class="sheetHeading"><h2 id="sheetTitle" tabindex="-1">Ortalama tüketim</h2></div><div class="sheetContent sheetExplanation"><p>İlk tam dolum başlangıç noktasıdır. Bir sonraki tam doluma kadar alınan tüm yakıt, bu aralıkta gidilen mesafeye bölünür.</p><p>Kısmi dolumlar da hesaba katılır. Tüketim ve kilometre maliyetini görmek için farklı kilometrelerde en az iki tam dolum kaydı gerekir.</p><p>Elektrikli araçlar için kWh hesabı henüz desteklenmiyor.</p></div>`);
  }
  function showInstallGuide(){
    const guide=installationGuide({userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints,secure:window.isSecureContext});
    // Keep one dialog open and avoid a queued close event moving the settings controls.
    const portal=dialog.querySelector('#settingsPortal');if(portal)parking.append(settings,storageNote);
    settings.querySelector('div').prepend(install);
    dialog.innerHTML=`<div class="sheetTop"><button type="button" class="sheetGrabber"><span></span></button><button class="sheetClose" aria-label="Paneli kapat">${svg('m7 7 10 10M17 7 7 17')}</button></div><div class="sheetHeading"><h2 id="sheetTitle" tabindex="-1">Uygulamayı yükle</h2></div><div class="sheetContent installContent"><p>Depo’yu uygulama simgesinden açın ve ilk yüklemenin ardından çevrimdışı da kullanın.</p><ol>${guide.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><p class="installNote">${esc(guide.note)}</p><button id="installBack">Ayarlara dön</button></div>`;
    dialog.querySelector('.sheetClose').onclick=dismiss;dialog.querySelector('#installBack').onclick=showSettings;
    if(!dialog.open){returnFocus=document.getElementById('openSettings');dialog.showModal();}
    attachSheetDrag(dialog);dialog.querySelector('#sheetTitle').focus({preventScroll:true});
  }
  return {showVehicle,showSettings,showInfo,showInstallGuide};
}

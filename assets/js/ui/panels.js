import {brands} from '../data/vehicles.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export function vehicleProperties(vehicle,records){
  const km=records.reduce((max,r)=>Math.max(max,r.km),vehicle.currentKm??0);
  return [['Marka',vehicle.brand||vehicle.name],['Model',vehicle.model],['Yıl',vehicle.year],['Plaka',vehicle.plate],['Yakıt',vehicle.fuel],['Vites',vehicle.transmission],['Araç tipi',null],['Motor',null],['Depo',null],['Şehir / Yol',null],['Renk',vehicle.color],['Kilometre',vehicle.currentKm!==undefined||records.length?`${new Intl.NumberFormat('tr-TR').format(km)} km`:null]];
}
export function createPanels({getState,editVehicle,addVehicle}){
  const dialog=document.createElement('dialog');dialog.className='iosSheet';dialog.setAttribute('aria-labelledby','sheetTitle');document.body.append(dialog);
  const settings=document.getElementById('settings');
  const storageNote=document.getElementById('storageNote');
  const parking=document.createElement('div');parking.hidden=true;document.body.append(parking);parking.append(settings,storageNote);
  let returnFocus=null;
  function dismiss(){dialog.close();}
  dialog.addEventListener('close',()=>{if(settings.parentElement!==parking){parking.append(settings,storageNote);}document.body.classList.remove('sheetOpen');if(returnFocus?.isConnected&&!document.querySelector('dialog[open]')&&document.getElementById('welcome').hidden)returnFocus.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target.closest('#showWelcome'))dismiss();},true);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dismiss();}});
  function show(content){
    returnFocus=document.activeElement;
    if(dialog.open)dialog.close();
    dialog.classList.remove('expanded');
    dialog.innerHTML=`<div class="sheetTop"><button class="sheetGrabber" aria-label="Paneli genişlet" aria-expanded="false"><span></span></button><button class="sheetClose" aria-label="Paneli kapat">${svg('m7 7 10 10M17 7 7 17')}</button></div>${content}`;
    dialog.querySelector('.sheetClose').onclick=dismiss;
    const handle=dialog.querySelector('.sheetGrabber');
    handle.onclick=()=>{const expanded=dialog.classList.toggle('expanded');handle.setAttribute('aria-expanded',String(expanded));handle.setAttribute('aria-label',expanded?'Paneli küçült':'Paneli genişlet');};
    let startY=null;handle.addEventListener('pointerdown',e=>{startY=e.clientY;handle.setPointerCapture(e.pointerId);});handle.addEventListener('pointerup',e=>{if(startY!==null&&e.clientY-startY>65)dismiss();else if(startY!==null&&e.clientY-startY<-40){dialog.classList.add('expanded');handle.setAttribute('aria-expanded','true');handle.setAttribute('aria-label','Paneli küçült');}startY=null;});
    dialog.showModal();document.body.classList.add('sheetOpen');dialog.querySelector('#sheetTitle').focus({preventScroll:true});
  }
  function showVehicle(id){
    const state=getState(),v=state.vehicles.find(v=>v.id===id);if(!v)return;
    const brand=brands.find(b=>b.name===v.brand);
    const logo=brand?`<img src="./assets/brands/${brand.slug}.${brand.slug==='togg'?'svg':'png'}" alt="">`:'';
    const rows=vehicleProperties(v,state.records.filter(r=>r.vehicle===id));
    show(`<div class="sheetHeading vehicleSheetHeading"><div class="sheetIdentity">${logo}<div><h2 id="sheetTitle" tabindex="-1">${esc(v.name)}</h2><p>Tüm araç özellikleri</p></div></div><button class="sheetEdit" id="sheetEdit" aria-label="Aracı düzenle">${svg('m14 5 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z')}<span>Düzenle</span></button></div><div class="sheetContent"><dl class="propertyList">${rows.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${value!==null&&value!==undefined&&value!==''?esc(value):'—'}</dd></div>`).join('')}</dl></div>`);
    dialog.querySelector('#sheetEdit').onclick=()=>{dismiss();editVehicle(id);};
  }
  function showSettings(){
    show(`<div class="sheetHeading"><div><h2 id="sheetTitle" tabindex="-1">Ayarlar</h2><p>Depo · Beta</p></div></div><div class="sheetContent" id="settingsContent"><section class="settingsGroup"><button id="settingsAddVehicle">${svg('M12 5v14M5 12h14')}<span>Garaja araç ekle</span>${svg('m9 6 6 6-6 6')}</button></section><h3 class="groupLabel">Veriler ve uygulama</h3><div id="settingsPortal"></div></div>`);
    dialog.querySelector('#settingsPortal').append(settings,storageNote);settings.hidden=false;storageNote.hidden=false;
    dialog.querySelector('#settingsAddVehicle').onclick=()=>{dismiss();addVehicle();};
  }
  function showInfo(){
    show(`<div class="sheetHeading"><h2 id="sheetTitle" tabindex="-1">Ortalama tüketim</h2></div><div class="sheetContent sheetExplanation"><p>İlk tam dolum başlangıç noktasıdır. Bir sonraki tam doluma kadar alınan tüm yakıt, bu aralıkta gidilen mesafeye bölünür.</p><p>Kısmi dolumlar da hesaba katılır. Tüketim ve kilometre maliyetini görmek için farklı kilometrelerde en az iki tam dolum kaydı gerekir.</p><p>Elektrikli araçlar için kWh hesabı henüz desteklenmiyor.</p></div>`);
  }
  return {showVehicle,showSettings,showInfo};
}

import {createNotificationCenter} from './ui/notifications.js';
import {createInstallController} from './ui/install.js';
import {createBackupPanel} from './ui/backup-panel.js';
import {createPricesScreen} from './ui/prices-screen.js';
import {createQuickRefill} from './ui/quick-refill.js';
import {recordDetails} from './core/refill.js';
import {createPanels} from './ui/panels.js';
import {renderHomeCard,homeExpectationMarkup} from './ui/home-card.js';
import {createVehicleWizard} from './ui/vehicle-wizard.js';
import {vehicleDetails} from './data/vehicles.js';
import {calculate} from './core/calc.js';
import {createThemeController,themeKey} from './ui/theme.js';
const theme=createThemeController();
window.addEventListener('storage',event=>{if(event.key===themeKey||event.key===null){theme.restore();document.querySelectorAll('input[name="theme"]').forEach(input=>{input.checked=input.value===theme.getPreference();});}});
let pricesScreen,notificationCenter;
const $=id=>document.getElementById(id), key='depo-v1';
let state={vehicles:[],records:[],selected:null}, editing=null, mode='';
const fmt=(n,d=2)=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(s){if(!s||!Array.isArray(s.vehicles)||!Array.isArray(s.records))throw Error('Yedek biçimi geçersiz.');const ids=new Set();for(const v of s.vehicles){if(typeof v.id!=='string'||ids.has(v.id)||typeof v.name!=='string'||!v.name.trim()||v.name.length>80)throw Error('Araç bilgileri geçersiz.');ids.add(v.id);}const recordIds=new Set();for(const r of s.records){if(typeof r.id!=='string'||recordIds.has(r.id)||!ids.has(r.vehicle)||typeof r.full!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date+'T12:00:00'))||new Date(r.date+'T12:00:00Z').toISOString().slice(0,10)!==r.date||!Number.isFinite(r.km)||r.km<0||!Number.isFinite(r.litres)||r.litres<=0||!Number.isFinite(r.amount)||r.amount<=0)throw Error('Yakıt kaydı geçersiz.');recordIds.add(r.id);}for(const id of ids){const rows=s.records.filter(r=>r.vehicle===id).sort((a,b)=>a.km-b.km);const seen=new Map();for(const row of rows){const fuels=seen.get(row.km)||[];if(fuels.length&&(!row.fuel||fuels.includes(undefined)||fuels.includes(row.fuel)))throw Error('Aynı kilometre ve yakıt için tekrar kayıt var.');fuels.push(row.fuel);seen.set(row.km,fuels);}for(let i=1;i<rows.length;i++)if(rows[i].date<rows[i-1].date)throw Error('Tarih ve kilometre sırası tutarsız.');}return {vehicles:s.vehicles.map(v=>({id:v.id,name:v.name,...vehicleDetails(v)})),records:s.records.map(r=>({id:r.id,vehicle:r.vehicle,date:r.date,km:r.km,litres:r.litres,amount:r.amount,full:r.full,...recordDetails(r)})),selected:ids.has(s.selected)?s.selected:s.vehicles[0]?.id||null};}
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',4500);}
try{const stored=localStorage.getItem(key);if(stored)state=validate(JSON.parse(stored));}catch{toast('Kayıtlar okunamadı. Varsa yedeğini yükle; mevcut veri üzerine otomatik yazılmadı.');}
function commit(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;render();return true;}catch{toast('Kaydedilemedi. Tarayıcı depolama iznini ve boş alanını kontrol et.');return false;}}
function render(){const rows=state.records.filter(r=>r.vehicle===state.selected);$('vehicle').innerHTML=state.vehicles.length?state.vehicles.map(v=>`<option value="${escape(v.id)}">${escape(v.name)}</option>`).join(''):'<option>Henüz araç yok</option>';$('vehicle').value=state.selected||'';$('editVehicle').disabled=!state.selected;$('addRecord').textContent=state.selected?'+ Yakıt ekle':'+ İlk aracını ekle';const m=calculate(rows);$('consumption').textContent=m.consumption===null?'—':fmt(m.consumption);$('cost').textContent=m.cost===null?'—':fmt(m.cost);$('spent').textContent=fmt(m.spent,0);$('litres').textContent=fmt(m.litres,1);$('count').textContent=`${rows.length} kayıt`;$('calculationHint').textContent=m.distance?`Ortalama, tamamlanan tam dolum aralıklarındaki ${fmt(m.distance,0)} km üzerinden hesaplandı.`:'Tüketimi görmek için farklı kilometrelerde en az iki tam dolum kaydı ekle.';$('records').innerHTML=rows.length?[...rows].sort((a,b)=>b.km-a.km).map(r=>`<article class="record"><div><strong>${new Date(r.date+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}</strong><span class="tag">${r.full?'Tam dolum':'Kısmi dolum'}${r.fuel?' · '+escape(r.fuel):''}</span></div><div class="odometer"><strong>${fmt(r.km,0)} km</strong><small>Kilometre sayacı</small></div><div class="volume"><strong>${fmt(r.litres)} L</strong><small>${fmt(r.amount/r.litres)} TL / L</small></div><div class="amount"><strong>${fmt(r.amount)} TL</strong><small>Dolum tutarı</small></div><button class="edit" data-edit="${escape(r.id)}" aria-label="${escape(r.date)} kaydını düzenle">Düzenle</button></article>`).join(''):`<div class="empty"><h3>${state.selected?'İlk dolumla başlayalım.':'Yola bir araçla başlayalım.'}</h3><p>${state.selected?'Yakıt aldığında kilometreyi, litreyi ve tutarı kaydet. Sonraki tam dolumda tüketimin burada görünsün.':'Aracını ekle, dolumlarını kaydet ve yakıtının seni ne kadar götürdüğünü gör.'}</p><button class="primary" id="emptyAction">${state.selected?'İlk yakıt kaydını ekle':'Araç ekle'}</button></div>`; $('emptyAction')?.addEventListener('click',()=>state.selected?openRecord():openVehicle());}
function openVehicle(id,startStep=1){vehicleWizard.open(state.vehicles.find(v=>v.id===id),startStep);}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function openRecord(id){if(!state.selected)return openVehicle();if(!id)return quickRefill.open();mode='record';editing=id||null;const r=state.records.find(r=>r.id===id);$('formTitle').textContent=r?'Yakıt kaydını düzenle':'Yakıt ekle';$('fields').innerHTML=`<label>Tarih<input type="date" name="date" required value="${r?.date||today()}"></label><label>Kilometre sayacı (km)<input type="number" inputmode="decimal" name="km" required min="0" max="99999999" step="0.1" placeholder="Örn. 45200" value="${r?.km??''}"></label><label>Alınan yakıt (litre)<input type="number" inputmode="decimal" name="litres" required min="0.01" max="10000" step="0.01" placeholder="Örn. 40,50" value="${r?.litres??''}"></label><label>Toplam tutar (TL)<input type="number" inputmode="decimal" name="amount" required min="0.01" max="99999999" step="0.01" placeholder="Örn. 2100" value="${r?.amount??''}"></label><label class="check"><input type="checkbox" name="full" ${r?.full?'checked':''}>Depoyu tam doldurdum</label><p class="fieldHelp">Depo tamamen dolduysa işaretle. Kısmi dolumları da kaydedebilirsin.</p>`;show(!!r);}
function show(removable){$('error').textContent='';$('delete').hidden=!removable;$('editor').showModal();}
$('form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),next=structuredClone(state);const existing=state.records.find(r=>r.id===editing);const r={...existing,id:editing||crypto.randomUUID(),vehicle:state.selected,date:f.get('date'),km:Number(f.get('km')),litres:Number(f.get('litres')),amount:Number(f.get('amount')),full:f.has('full')};if(existing?.fuel)r.unitPrice=r.amount/r.litres;next.records=next.records.filter(x=>x.id!==editing);next.records.push(r);try{validate(next);}catch(err){$('error').textContent=err.message+' Aynı kilometrede ikinci kayıt ekleme; tarih ile kilometre sırasını kontrol et.';return;}if(commit(next)){$('editor').close();toast('Kaydedildi.');}});
$('delete').onclick=()=>{const isVehicle=mode==='vehicle';if(!confirm(isVehicle?'Bu araç ve tüm yakıt kayıtları silinsin mi?':'Bu yakıt kaydı silinsin mi?'))return;const next=structuredClone(state);if(isVehicle){next.vehicles=next.vehicles.filter(v=>v.id!==editing);next.records=next.records.filter(r=>r.vehicle!==editing);next.selected=next.vehicles[0]?.id||null;}else next.records=next.records.filter(r=>r.id!==editing);if(commit(next)){$('editor').close();toast('Silindi.');}};
$('close').onclick=()=>$('editor').close();$('addVehicle').onclick=()=>openVehicle();$('editVehicle').onclick=()=>openVehicle(state.selected);$('addRecord').onclick=()=>openRecord();$('vehicle').onchange=e=>commit({...state,selected:e.target.value});$('records').onclick=e=>{const button=e.target.closest('[data-edit]');if(button)openRecord(button.dataset.edit);};
createInstallController({button:$('install'),onGuide:()=>panels.showInstallGuide(),onInstalled:()=>toast('Depo uygulaması yüklendi.')});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>toast('Çevrimdışı kullanım hazırlanamadı. İnternet bağlantısıyla tekrar aç.'));
render();

const screenKey='depo-last-screen',availableScreens=['home','prices'];
let currentScreen='home';
try{const savedScreen=localStorage.getItem(screenKey);if(availableScreens.includes(savedScreen))currentScreen=savedScreen;}catch{ /* Storage may be unavailable; start at home. */ }
function setScreen(screen){
  if(!availableScreens.includes(screen))return;
  if(screen!==currentScreen){try{localStorage.setItem(screenKey,screen);}catch{ /* Navigation still works without persistence. */ }}
  currentScreen=screen;
  const hasVehicle=state.vehicles.length>0;
  const titles={home:['Ana Sayfa','Aracının tüketimi, bir bakışta.'],reports:['Raporlar','Dolumların ve yakıt harcamaların.'],vehicles:['Araçlar','Garajını ve kayıtlarını yönet.'],prices:['Fiyatlar','Yakıt fiyatlarını takip et.']};
  $('screenTitle').textContent=titles[screen][0];$('screenDescription').textContent=titles[screen][1];
  document.querySelector('.intro').hidden=screen==='home';
  $('screenDescription').hidden=screen==='home';
  $('homeEmpty').hidden=screen!=='home'||hasVehicle;
  $('prices').hidden=screen!=='prices';
  if(screen==='prices')pricesScreen?.show();else pricesScreen?.hide();
  $('garage').hidden=screen!=='vehicles'&&(screen!=='reports'||!hasVehicle);
  $('homeCards').hidden=screen!=='home'||!hasVehicle;
  $('homeExpectations').hidden=screen!=='home'||!hasVehicle||!$('homeExpectations').innerHTML;
  $('overview').hidden=!hasVehicle||screen!=='reports';
  $('calculationHint').hidden=$('overview').hidden;
  $('history').hidden=screen!=='reports';

  $('help').hidden=screen!=='reports';
  $('editVehicle').hidden=screen!=='vehicles';
  $('addVehicle').hidden=screen!=='vehicles';
  $('addRecord').hidden=true;
  document.querySelectorAll('[data-screen]').forEach(b=>{if(b.dataset.screen===screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
}
for(const button of document.querySelectorAll('[data-screen]'))button.onclick=()=>{setScreen(button.dataset.screen);window.scrollTo({top:0,behavior:'instant'});};
$('navAdd').onclick=()=>{if(state.selected)openRecord();else{setScreen('home');toast('Önce garaja bir araç ekleyin.');$('homeAddVehicle').focus();}};
$('homeAddVehicle').onclick=()=>openVehicle();
function renderHomeExpectations(){
  const host=$('homeExpectations');
  const markup=homeExpectationMarkup(notificationCenter?.getExpectations()||[]);
  if(host.innerHTML!==markup)host.innerHTML=markup;
  host.hidden=currentScreen!=='home'||!state.vehicles.length||!markup;
}
const originalRender=render;
render=function(){originalRender();renderHomeCard({state,openVehicle,showVehicle:id=>panels.showVehicle(id),onInfo:()=>panels.showInfo(),selectVehicle:id=>commit({...state,selected:id})});renderHomeExpectations();setScreen(currentScreen);};
render();

import {initWelcome} from './ui/welcome.js';
initWelcome({hasVehicles:()=>state.vehicles.length>0||location.hash.startsWith('#depo-transfer='),goHome:()=>{setScreen('home');document.querySelector('[data-screen=home]').focus();}});

const vehicleWizard=createVehicleWizard({
  save(vehicle){const next=structuredClone(state);const index=next.vehicles.findIndex(v=>v.id===vehicle.id);if(index>=0)next.vehicles[index]=vehicle;else next.vehicles.push(vehicle);next.selected=vehicle.id;if(commit(next)){toast('Araç garaja eklendi.');return true;}return false;},
  remove(id){if(!confirm('Bu araç ve tüm yakıt kayıtları silinsin mi?'))return false;const next=structuredClone(state);next.vehicles=next.vehicles.filter(v=>v.id!==id);next.records=next.records.filter(r=>r.vehicle!==id);next.selected=next.vehicles[0]?.id||null;return commit(next);}
});

const panels=createPanels({getState:()=>state,editVehicle:id=>openVehicle(id),addVehicle:()=>openVehicle(),theme,onThemeStorageError:()=>toast('Tema uygulandı ancak bu tarayıcıda saklanamadı.'),openBackup:()=>backupPanel.open(),openClear:()=>backupPanel.openClear()});
$('openSettings').onclick=()=>panels.showSettings();

const quickRefill=createQuickRefill({getState:()=>state,save(record){const next=structuredClone(state);next.records.push(record);try{validate(next);}catch(error){toast(error.message);return false;}if(commit(next)){toast('Dolum kaydedildi.');return true;}return false;}});

pricesScreen=createPricesScreen({host:$('prices'),getVehicle:()=>state.vehicles.find(v=>v.id===state.selected),getExpectations:()=>notificationCenter?.getExpectations()||[],onPrices:(result,query)=>notificationCenter?.observePrices(result,query)});
notificationCenter=createNotificationCenter({button:$('notifications'),getQuery:()=>pricesScreen.getQuery(),onChange:()=>{pricesScreen.render();renderHomeExpectations();},notify:toast});
setScreen(currentScreen);

// Reveal the restored screen only after state, panels and onboarding are ready.
document.documentElement.removeAttribute('data-starting');

const backupPanel=createBackupPanel({getState:()=>state,validate,commit,notify:toast,onCleared:()=>setScreen('home')});
backupPanel.receiveLocation();
window.addEventListener('hashchange',()=>backupPanel.receiveLocation());

notificationCenter.start();

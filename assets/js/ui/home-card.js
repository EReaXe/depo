import {brands} from '../data/vehicles.js';
import {calculate} from '../core/calc.js';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(n,d=0)=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:d}).format(n);
const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export function homeCardMarkup(vehicle,records){
  const brand=brands.find(b=>b.name===vehicle.brand);
  const logo=brand?`./assets/brands/${brand.slug}.${brand.slug==='togg'?'svg':'png'}`:null;
  const m=calculate(records);
  const km=Math.max(vehicle.currentKm??0,...records.map(r=>r.km));
  const kmKnown=vehicle.currentKm!==undefined||records.length>0;
  const electric=vehicle.fuel==='Elektrik';
  return `<article class="vehicleCard" aria-label="${escape(vehicle.name)} araç özeti">
    ${logo?`<img class="vehicleWatermark" src="${logo}" alt="" aria-hidden="true">`:''}
    <div class="vehicleCardHeader"><div class="vehicleIdentity">${logo?`<img class="vehicleLogo" src="${logo}" alt="">`:icon('M3 10h18v9H3zM5 10l2-6h10l2 6M6 19v2M18 19v2M6 14h2M16 14h2')}<div><h2>${escape(vehicle.brand||vehicle.name)}</h2>${vehicle.model?`<p>${escape(vehicle.model)}</p>`:''}</div></div><button id="homeVehicleDetails" class="vehicleArrow" aria-label="Araç detaylarını aç">${icon('m9 6 6 6-6 6')}</button></div>
    <button id="homeVehiclePlate" class="vehiclePlate" aria-label="${vehicle.plate?'Plakayı düzenle':'Plaka ekle'}">${vehicle.plate?escape(vehicle.plate):'+ Plaka ekle'}</button>
    <div class="vehicleCardStats">
      <div><div>${icon('M4 18V9a8 8 0 0 1 16 0v9H4zM9 14l4-5')}<span>${kmKnown?number(km):'—'} <small>km</small></span></div><p>Kilometre</p></div>
      <div><div>${icon('M4 21V4h10v17M2 21h14M7 7h4v5H7zM14 10h3l4 5v4M18 4l3 3v8')}<span>${!electric&&m.consumption!==null?number(m.consumption,2):'—'} <small>${electric?'kWh':'L'}/100 km</small></span></div><p>Ort. tüketim <button id="homeConsumptionInfo" class="metricInfo" aria-label="Ortalama tüketim hesabı hakkında bilgi">i</button></p></div>
      <div><div>${icon('M3 6h18v14H3zM3 10h18M6 16h4')}<span>${!electric&&m.cost!==null?number(m.cost,2):'—'} <small>TL/km</small></span></div><p>Yakıt maliyeti</p></div>
    </div>
    ${m.mixedFuels?'<p class="mixedFuelNote">Farklı yakıtların dolumları kaydedildi. Birleşik tüketim hesabı henüz desteklenmiyor.</p>':''}
  </article>`;
}
export function renderHomeCard({state,openVehicle,showVehicle,onInfo,selectVehicle}){
  const host=document.getElementById('homeCards');
  const vehicle=state.vehicles.find(v=>v.id===state.selected);
  if(!vehicle){host.innerHTML='';return;}
  host.innerHTML=homeCardMarkup(vehicle,state.records.filter(r=>r.vehicle===vehicle.id));
  if(state.vehicles.length>1){const label=document.createElement('label');label.className='homeVehicleSwitch';label.textContent='Araç değiştir';const select=document.createElement('select');select.setAttribute('aria-label','Ana Sayfa aracı');for(const v of state.vehicles){const option=new Option(v.name,v.id);option.selected=v.id===vehicle.id;select.append(option);}select.onchange=()=>selectVehicle(select.value);label.append(select);host.append(label);}
  document.getElementById('homeVehicleDetails').onclick=()=>showVehicle(vehicle.id);
  document.getElementById('homeVehiclePlate').onclick=()=>openVehicle(vehicle.id,6);
  document.getElementById('homeConsumptionInfo').onclick=onInfo;
}

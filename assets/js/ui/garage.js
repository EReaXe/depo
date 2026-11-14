import {brands} from '../data/vehicles.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function withoutVehicle(state,id){
  const vehicles=state.vehicles.filter(v=>v.id!==id);
  return {...state,vehicles,records:state.records.filter(r=>r.vehicle!==id),selected:state.selected===id?vehicles[0]?.id||null:state.selected};
}
export function garageMarkup(state){
  if(!state.vehicles.length)return '<div class="garageEmpty"><h2>Garajınız henüz boş</h2><p>İlk aracınızı ekleyin, yakıt ve harcamalarınızı takip etmeye başlayın.</p></div>';
  return `<div class="garageList">${state.vehicles.map(v=>{
    const brand=brands.find(b=>b.name===v.brand),selected=state.selected===v.id;
    const rows=state.records.filter(r=>r.vehicle===v.id);
    const km=Math.max(v.currentKm??0,...rows.map(r=>r.km));
    return `<article class="garageVehicle${selected?' isSelected':''}"><button class="garageSelect" data-garage-select="${esc(v.id)}" aria-pressed="${selected}" aria-label="${esc(v.name)} aracını seç"><span class="garageIdentity">${brand?`<img src="./assets/brands/${brand.slug}.${brand.slug==='togg'?'svg':'png'}" alt="">`:''}<span><strong>${esc(v.name)}</strong><small>${esc([v.year,v.fuel].filter(Boolean).join(' · '))||'Araç bilgisi eklenmemiş'}</small></span></span><span class="garageSelected">${selected?'Seçili araç':'Seç'}</span></button><div class="garageMeta"><span>${esc(v.plate||'Plaka eklenmemiş')}</span><span>${v.currentKm!==undefined||rows.length?new Intl.NumberFormat('tr-TR').format(km)+' km':'— km'}</span></div><div class="garageActions"><button data-garage-details="${esc(v.id)}" aria-label="${esc(v.name)} araç detayları">Detaylar</button><button class="garageDelete" data-garage-delete="${esc(v.id)}" aria-label="${esc(v.name)} aracını sil">Aracı sil</button></div></article>`;
  }).join('')}</div>`;
}

import {brands,fuels,colors,transmissions,vehicleDetails} from '../data/vehicles.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=[1,2,3,4,5,6,8];
const titles={1:'Aracınızın markası nedir?',2:'Hangi modeli kullanıyorsunuz?',3:'Üretim yılı nedir?',4:'Hangi yakıtı kullanıyor?',5:'Güncel kilometresi nedir?',6:'Plaka eklemek ister misiniz?',8:'Aracınız ne renk?'};
export function createVehicleWizard({save,remove}){
  const dialog=document.createElement('dialog');dialog.className='vehicleWizard';dialog.setAttribute('aria-labelledby','wizardTitle');document.body.append(dialog);
  let draft={},original=null,index=0,dirty=false;
  const step=()=>steps[index];
  function open(vehicle,startStep=1){
    original=vehicle||null;draft={brand:'',model:'',year:'',fuel:'',currentKm:'',plate:'',color:'',transmission:'',...vehicle};index=vehicle?.brand?Math.max(0,steps.indexOf(startStep)):0;dirty=false;
    draw();dialog.showModal();dialog.querySelector('#wizardTitle').focus({preventScroll:true});
  }
  function close(){if(dirty&&!confirm('Kaydedilmemiş araç bilgileri kapatılsın mı?'))return;dialog.close();}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  function draw(){
    const s=step(),brand=brands.find(b=>b.name===draft.brand);
    let content='';
    if(s===1)content=`<label class="searchLabel">Marka ara<input id="brandSearch" type="search" placeholder="Örn. Renault" autocomplete="off"></label><div class="brandGrid">${brands.map(b=>`<button type="button" class="brandChoice ${draft.brand===b.name?'selected':''}" data-brand="${esc(b.name)}" aria-pressed="${draft.brand===b.name}"><img src="./assets/brands/${b.slug}.${b.slug==='togg'?'svg':'png'}" alt="" width="66" height="42"><span>${esc(b.name)}</span></button>`).join('')}</div><p id="noBrands" class="fieldHelp" hidden>Bu isimle marka bulunamadı. Aramanızı değiştirin.</p>`;
    if(s===2){const listed=brand?.models.includes(draft.model);content=`<p class="wizardContext">${esc(draft.brand)}</p><label>Model<select name="modelChoice" required><option value="">Model seçin</option>${(brand?.models||[]).map(m=>`<option ${draft.model===m?'selected':''}>${esc(m)}</option>`).join('')}<option value="__other" ${draft.model&&!listed?'selected':''}>Diğer / listede yok</option></select></label><label id="customModelLabel" ${draft.model&&!listed?'':'hidden'}>Model adı<input name="customModel" maxlength="60" placeholder="Aracınızın modelini yazın" value="${!listed?esc(draft.model):''}"></label><p class="fieldHelp">Liste başlangıç kataloğudur. Modelinizi bulamazsanız “Diğer / listede yok” seçin.</p>`;}
    if(s===3)content=`<label>Üretim yılı<select name="year" required><option value="">Yıl seçin</option>${Array.from({length:new Date().getFullYear()+2-1900},(_,i)=>new Date().getFullYear()+1-i).map(y=>`<option value="${y}" ${Number(draft.year)===y?'selected':''}>${y}</option>`).join('')}</select></label><p class="fieldHelp">Ruhsatta yazan üretim yılını seçin.</p>`;
    if(s===4)content=`<fieldset class="choiceList"><legend>Yakıt türü</legend>${fuels.map(f=>`<label><input type="radio" name="fuel" value="${esc(f)}" ${draft.fuel===f?'checked':''} required><span>${esc(f)}</span></label>`).join('')}</fieldset><p class="fieldHelp">Elektrikli araç kaydedilebilir. Elektrik tüketimi hesabı henüz desteklenmiyor.</p>`;
    if(s===5)content=`<label>Kilometre sayacı (km)<input name="currentKm" type="number" inputmode="decimal" min="0" max="99999999" step="0.1" required placeholder="Örn. 45200" value="${esc(draft.currentKm)}"></label><p class="fieldHelp">Gösterge panelindeki güncel toplam kilometreyi girin. Bu bilgi tek başına yakıt tüketimi oluşturmaz.</p>`;
    if(s===6)content=`<label>Plaka <span class="optional">İsteğe bağlı</span><input name="plate" type="text" maxlength="20" autocomplete="off" autocapitalize="characters" placeholder="Örn. 34 ABC 123" value="${esc(draft.plate)}"></label><p class="fieldHelp">Plaka yazmadan da devam edebilirsiniz.</p>`;
    if(s===8)content=`<fieldset class="colorChoices"><legend>Araç rengi</legend>${colors.map(([name,hex])=>`<label><input type="radio" name="color" value="${name}" required ${draft.color===name?'checked':''}><span class="colorDot" ${hex?`style="--swatch:${hex}"`:''}></span><span>${name}</span></label>`).join('')}</fieldset><details class="otherDetails" ${draft.transmission?'open':''}><summary>Diğer detaylar <span>İsteğe bağlı</span></summary><label>Vites türü<select name="transmission"><option value="">Belirtilmedi</option>${transmissions.map(t=>`<option ${draft.transmission===t?'selected':''}>${t}</option>`).join('')}</select></label></details><div class="vehicleReview"><strong>${esc(draft.brand)} ${esc(draft.model)}</strong><p>${esc(draft.year)} · ${esc(draft.fuel)} · ${Number(draft.currentKm).toLocaleString('tr-TR')} km${draft.plate?`<br>${esc(draft.plate)}`:''}</p></div><p class="fieldHelp">7. adım olan son yakıt alımı şimdilik atlandı.</p>`;
    dialog.innerHTML=`<form class="wizardForm"><div class="wizardHeader"><button type="button" id="wizardBack" ${index?'':'style="visibility:hidden" tabindex="-1" aria-hidden="true"'} aria-label="${index?'Önceki adım':'Kapat'}">${index?'Geri':'Kapat'}</button><strong>${original?'Aracı düzenle':'Araç ekle'}</strong><button type="button" id="wizardClose" aria-label="Araç eklemeyi kapat">Kapat</button></div><div class="wizardProgress"><span>Adım ${s} / 8</span><div role="progressbar" aria-label="Araç bilgileri" aria-valuemin="1" aria-valuemax="8" aria-valuenow="${s}"><span style="width:${s/8*100}%"></span></div></div><div class="wizardBody"><h2 id="wizardTitle" tabindex="-1">${titles[s]}</h2>${content}</div><div class="wizardActions"><p id="wizardError" role="alert"></p>${original&&s===8?'<button type="button" id="wizardDelete" class="danger">Aracı sil</button>':''}<button type="submit" class="primary" id="wizardNext">${s===8?(original?'Değişiklikleri kaydet':'Garaja ekle'):s===6?'Devam et · Renk':'Devam et'}</button></div></form>`;
    dialog.querySelector('#wizardClose').onclick=close;
    dialog.querySelector('#wizardBack').onclick=()=>{if(index){capture(false);index--;draw();}else close();};
    dialog.querySelector('#wizardDelete')?.addEventListener('click',()=>{if(remove(original.id))dialog.close();});
    dialog.querySelector('form').onsubmit=e=>{e.preventDefault();if(!capture(true))return;if(index<steps.length-1){index++;draw();}else{try{const details=vehicleDetails(draft);const vehicle={...(original||{}),...details,id:original?.id||crypto.randomUUID(),name:`${draft.brand} ${draft.model}`.slice(0,80)};if(save(vehicle))dialog.close();else dialog.querySelector('#wizardError').textContent='Kaydedilemedi. Depolama alanını kontrol edip tekrar deneyin.';}catch(err){dialog.querySelector('#wizardError').textContent=err.message;}}};
    dialog.querySelectorAll('[data-brand]').forEach(button=>button.onclick=()=>{if(draft.brand!==button.dataset.brand){draft.model='';draft.brand=button.dataset.brand;dirty=true;}dialog.querySelectorAll('[data-brand]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});dialog.querySelector('#wizardError').textContent='';});
    dialog.querySelector('#brandSearch')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('tr');let count=0;dialog.querySelectorAll('[data-brand]').forEach(b=>{b.hidden=!b.dataset.brand.toLocaleLowerCase('tr').includes(q);if(!b.hidden)count++;});dialog.querySelector('#noBrands').hidden=count>0;});
    dialog.querySelector('[name=modelChoice]')?.addEventListener('change',e=>{const custom=dialog.querySelector('#customModelLabel');custom.hidden=e.target.value!=='__other';custom.querySelector('input').required=!custom.hidden;if(!custom.hidden)custom.querySelector('input').focus();});
    dialog.querySelector('form').addEventListener('input',()=>dirty=true);
    dialog.querySelectorAll('img').forEach(img=>img.onerror=()=>img.hidden=true);
    dialog.querySelector('.wizardBody').scrollTop=0;
    if(dialog.open)dialog.querySelector('#wizardTitle').focus({preventScroll:true});
  }
  function capture(required){
    const form=dialog.querySelector('form'),data=new FormData(form),s=step();
    if(s===1){if(required&&!draft.brand){dialog.querySelector('#wizardError').textContent='Devam etmek için bir marka seçin.';return false;}}
    if(s===2)draft.model=(data.get('modelChoice')==='__other'?data.get('customModel'):data.get('modelChoice')||'').trim();
    if(s===3)draft.year=Number(data.get('year'));
    if(s===4)draft.fuel=data.get('fuel')||'';
    if(s===5)draft.currentKm=data.get('currentKm')===''?'':Number(data.get('currentKm'));
    if(s===6)draft.plate=data.get('plate').trim().toLocaleUpperCase('tr');
    if(s===8){draft.color=data.get('color')||'';draft.transmission=data.get('transmission')||'';}
    if(required&&s===2&&!draft.model){dialog.querySelector('#wizardError').textContent='Bir model seçin veya model adını yazın.';return false;}
    return true;
  }
  return {open};
}

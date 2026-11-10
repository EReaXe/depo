import {fuelChoices,parseDecimal,latestUnitPrice,createQuickRecord} from '../core/refill.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function today(){const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function createQuickRefill({getState,save}){
  const dialog=document.createElement('dialog');dialog.className='iosSheet quickRefill';dialog.setAttribute('aria-labelledby','refillTitle');document.body.append(dialog);
  let vehicle,dirty=false,previousFocus;
  function close(){if(dirty&&!confirm('Kaydedilmemiş dolum bilgileri kapatılsın mı?'))return;dialog.close();}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('sheetOpen');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
  function open(){
    const state=getState();vehicle=state.vehicles.find(v=>v.id===state.selected);if(!vehicle)return;
    previousFocus=document.activeElement;dirty=false;
    const fuels=fuelChoices(vehicle);
    if(!fuels.length){dialog.innerHTML=`<div class="refillToolbar"><button id="refillClose">Kapat</button><h2 id="refillTitle" tabindex="-1">Hızlı dolum</h2><span></span></div><div class="sheetContent sheetExplanation"><p>Elektrikli araçlar için şarj kaydı henüz desteklenmiyor.</p></div>`;}
    else dialog.innerHTML=`<form id="refillForm" novalidate><div class="refillToolbar"><button type="button" id="refillClose">Vazgeç</button><h2 id="refillTitle" tabindex="-1">Hızlı dolum</h2><span></span></div><div class="sheetContent refillContent"><p class="refillVehicle">${esc(vehicle.name)}</p><fieldset class="refillFuel"><legend>Alınan yakıt</legend>${fuels.map((fuel,i)=>`<label><input type="radio" name="fuel" value="${fuel}" ${i===0?'checked':''}><span>${fuel}</span></label>`).join('')}</fieldset><div class="refillInputs"><label>Ödenen tutar <span>TL</span><input name="amount" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off" required></label><label>Litre fiyatı <span>TL / L</span><input name="unitPrice" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off" required aria-describedby="refillPriceNote"></label><p id="refillPriceNote" class="refillNote"></p><label>Güncel kilometre <span>km</span><input name="km" type="text" inputmode="decimal" placeholder="${esc(vehicle.currentKm??'Örn. 45200')}" autocomplete="off" required></label></div><div class="refillLitres"><span>Alınan yakıt</span><output id="refillLitres" aria-live="polite">— L</output></div><label class="refillFull"><input name="full" type="checkbox"><span>Depoyu tam doldurdum<small>Seçilen yakıtın deposu tamamen dolduysa işaretleyin.</small></span></label><p class="refillNote">Kayıt bugünün tarihiyle eklenir. Konuma göre istasyon fiyatı henüz bağlı değil; pompadaki litre fiyatını girin.</p></div><div class="refillActions"><p id="refillError" role="alert"></p><button type="submit" class="primary">Kaydet</button></div></form>`;
    dialog.querySelector('#refillClose').onclick=close;
    const form=dialog.querySelector('form');
    if(form){
      function presetPrice(){const fuel=new FormData(form).get('fuel');const last=latestUnitPrice(getState().records,vehicle.id,fuel);form.elements.unitPrice.value=last?String(Number(last.price.toFixed(4))).replace('.',','):'';dialog.querySelector('#refillPriceNote').textContent=last?`Son kullandığınız fiyat · ${new Date(last.date+'T12:00:00').toLocaleDateString('tr-TR')}. Güncel pompa fiyatını kontrol edin.`:'Güncel istasyon fiyatı bulunmuyor. Litre fiyatını pompadan veya fişten girin.';updateLitres();}
      function updateLitres(){const amount=parseDecimal(form.elements.amount.value),price=parseDecimal(form.elements.unitPrice.value);dialog.querySelector('#refillLitres').textContent=amount>0&&price>0?`${new Intl.NumberFormat('tr-TR',{maximumFractionDigits:3}).format(amount/price)} L`:'— L';}
      form.addEventListener('input',()=>{dirty=true;updateLitres();dialog.querySelector('#refillError').textContent='';});
      form.querySelectorAll('[name=fuel]').forEach(input=>input.onchange=presetPrice);
      form.onsubmit=e=>{e.preventDefault();try{const data=new FormData(form);const record=createQuickRecord({vehicle,records:getState().records,values:{fuel:data.get('fuel'),amount:data.get('amount'),unitPrice:data.get('unitPrice'),km:data.get('km'),full:data.has('full')},id:crypto.randomUUID(),date:today()});if(save(record)){dirty=false;dialog.close();}else dialog.querySelector('#refillError').textContent='Kayıt saklanamadı. Tekrar deneyin.';}catch(error){dialog.querySelector('#refillError').textContent=error.message;}};
      presetPrice();
    }
    dialog.showModal();document.body.classList.add('sheetOpen');dialog.querySelector('#refillTitle').focus({preventScroll:true});
  }
  return {open};
}

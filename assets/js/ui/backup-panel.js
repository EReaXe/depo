import {makeBackup,parseBackup,makeTransferUrl,readTransfer,maxBackupBytes} from '../core/backup.js';
import {attachSheetDrag} from './sheet-drag.js';
import qrcodegen from '../vendor/qrcodegen.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=value=>value?new Date(value).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'}):'Eski yedek · tarih bilgisi yok';
export function qrMarkup(text){
  const qr=qrcodegen.QrCode.encodeSegments([qrcodegen.QrSegment.makeBytes([...new TextEncoder().encode(text)])],qrcodegen.QrCode.Ecc.MEDIUM,1,32,-1,true);
  let path='';for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))path+=`M${x+4},${y+4}h1v1h-1z `;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qr.size+8} ${qr.size+8}" role="img" aria-label="Diğer cihazla okutulacak veri aktarım QR kodu" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
export function createBackupPanel({getState,validate,commit,notify,onCleared}){
  const dialog=document.createElement('dialog');dialog.className='iosSheet backupSheet';dialog.setAttribute('aria-labelledby','backupTitle');document.body.append(dialog);
  let returnFocus=null,version=0;
  dialog.addEventListener('close',()=>{version++;document.body.classList.remove('sheetOpen');dialog.replaceChildren();if(returnFocus?.isConnected&&!document.querySelector('dialog[open]'))returnFocus.focus({preventScroll:true});});
  function draw(title,content){
    version++;dialog.classList.remove('expanded');
    dialog.innerHTML=`<div class="refillToolbar"><button type="button" id="backupBack">${title==='Yedekleme ve aktarım'?'Kapat':'Geri'}</button><h2 id="backupTitle" tabindex="-1">${title}</h2><span></span></div><div class="sheetContent backupContent">${content}<p id="backupError" role="alert" class="backupError"></p></div>`;
    dialog.querySelector('#backupBack').onclick=()=>title==='Yedekleme ve aktarım'?dialog.close():menu();
    if(!dialog.open){returnFocus=document.activeElement?.closest('dialog')?document.getElementById('openSettings'):document.activeElement;dialog.showModal();}
    document.body.classList.add('sheetOpen');attachSheetDrag(dialog);dialog.querySelector('#backupTitle').focus({preventScroll:true});
  }
  function error(message){const target=dialog.querySelector('#backupError');if(target)target.textContent=message;}
  function download(){
    try{
      const backup=makeBackup(getState(),validate),blob=new Blob([JSON.stringify(backup,null,2)+'\n'],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
      const now=new Date(),pad=n=>String(n).padStart(2,'0');a.download=`depo-yedek-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Yedek indirme başlatıldı. Dosyanın kaydedildiğini kontrol edin.');
    }catch(e){error('Yedek hazırlanamadı: '+e.message);}
  }
  function menu(){
    const state=getState();
    draw('Yedekleme ve aktarım',`<p class="backupLead">${state.vehicles.length} araç · ${state.records.length} dolum kaydı</p><div class="backupActions"><button id="backupDownload"><strong>Yedek indir</strong><small>Araçlarınızı ve dolumlarınızı JSON dosyası olarak saklayın.</small></button><button id="backupPickFile"><strong>Yedekten yükle</strong><small>Dosyayı inceleyin, ardından yüklemeyi onaylayın.</small></button><button id="backupTransfer" ${state.vehicles.length?'':'disabled'}><strong>Başka cihaza aktar</strong><small>QR kod veya bağlantıyla verilerinizin bir kopyasını aktarın.</small></button></div>${state.vehicles.length?'':'<p class="backupNote">QR ile aktarım için önce garaja bir araç ekleyin. Dosyadan yedek yükleyebilirsiniz.</p>'}<input id="backupFile" type="file" accept="application/json,.json" hidden><p class="backupNote">Veriler bu tarayıcıda tutulur. Yedek dosyasını bu cihazın dışında da saklayın. Aktarım sonrasındaki değişiklikler cihazlar arasında otomatik eşitlenmez.</p>`);
    dialog.querySelector('#backupDownload').onclick=download;
    const fileInput=dialog.querySelector('#backupFile');dialog.querySelector('#backupPickFile').onclick=()=>fileInput.click();
    fileInput.onchange=async()=>{const file=fileInput.files[0];if(!file)return;const token=++version;try{if(file.size>maxBackupBytes)throw Error('Dosya çok büyük. En fazla 5 MB yükleyebilirsiniz.');const result=parseBackup(await file.text(),validate);if(token===version&&dialog.open)preview(result,file.name);}catch(e){if(token===version)error(e.message);}finally{fileInput.value='';}};
    dialog.querySelector('#backupTransfer').onclick=transfer;
  }
  function preview(result,source){
    const current=getState(),incoming=result.state;
    draw('Yedeği incele',`<p class="backupLead">${esc(source)}</p><dl class="propertyList backupSummary"><div><dt>Oluşturulma</dt><dd>${esc(date(result.exportedAt))}</dd></div><div><dt>Araç</dt><dd>${incoming.vehicles.length}</dd></div><div><dt>Dolum kaydı</dt><dd>${incoming.records.length}</dd></div></dl>${incoming.vehicles.length?`<ul class="backupVehicles">${incoming.vehicles.slice(0,5).map(v=>`<li>${esc(v.name)}</li>`).join('')}</ul>`:''}<p class="backupWarning">Bu cihazdaki ${current.vehicles.length} araç ve ${current.records.length} dolum kaydı, bu yedekteki kayıtlarla değiştirilecek. Bu işlem birleştirme yapmaz.</p><button class="backupExisting" id="backupExisting">Önce mevcut yedeği indir</button><label class="backupConsent"><input type="checkbox" id="backupConsent"><span>Mevcut verilerin değişeceğini anladım.</span></label><button class="primary backupConfirm" id="backupConfirm" disabled>Verileri değiştir ve yükle</button>`);
    dialog.querySelector('#backupExisting').onclick=download;
    const consent=dialog.querySelector('#backupConsent'),button=dialog.querySelector('#backupConfirm');consent.onchange=()=>button.disabled=!consent.checked;
    button.onclick=()=>{if(!consent.checked)return;if(commit(incoming)){dialog.close();notify('Yedek yüklendi.');}else error('Yedek saklanamadı. Mevcut veriler korunuyor; depolama iznini ve boş alanı kontrol edin.');};
  }
  async function transfer(){
    draw('Başka cihaza aktar','<p class="backupLead" role="status">Aktarım hazırlanıyor…</p>');const token=version;
    try{
      const url=await makeTransferUrl(makeBackup(getState(),validate),location.href);if(token!==version||!dialog.open)return;
      const qr=qrMarkup(url),local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
      draw('Başka cihaza aktar',`<p class="backupNote">Diğer cihazın kamerasıyla QR kodu okutun. Açılan sayfada yedeği inceleyip yüklemeyi onaylayın.</p><div class="transferQr">${qr}</div>${local?'<p class="backupWarning">Bu bir yerel test adresidir; başka cihazda açılmaz. Cihazlar arası aktarım yayın adresinde kullanılabilir.</p>':''}<p class="backupWarning">Bu bağlantıyı bilen kişi yedekteki verilere erişebilir. Yalnızca kendi cihazlarınızla paylaşın.</p><label class="transferLink">Aktarım bağlantısı<textarea id="transferLink" readonly rows="3" spellcheck="false"></textarea></label><div class="transferButtons"><button id="copyTransfer">Bağlantıyı kopyala</button>${navigator.share?'<button id="shareTransfer">Paylaş</button>':''}</div><p class="backupNote">Bu, şu andaki verilerinizin bir kopyasıdır. Bağlantı kendiliğinden güncellenmez ve süresi dolmaz. Büyük yedeklerde JSON dosyasıyla aktarımı kullanın.</p>`);
      const field=dialog.querySelector('#transferLink');field.value=url;
      dialog.querySelector('#copyTransfer').onclick=async()=>{try{await navigator.clipboard.writeText(url);notify('Aktarım bağlantısı kopyalandı.');}catch{field.focus();field.select();error('Otomatik kopyalanamadı. Seçili bağlantıyı elle kopyalayın.');}};
      dialog.querySelector('#shareTransfer')?.addEventListener('click',async()=>{try{await navigator.share({title:'Depo veri aktarımı',url});}catch(e){if(e.name!=='AbortError')error('Paylaşım açılamadı. Bağlantıyı kopyalayabilirsiniz.');}});
    }catch(e){if(token===version&&dialog.open){draw('Başka cihaza aktar',`<p class="backupWarning">${esc(e.message)}</p><button class="primary backupConfirm" id="backupDownload">Yedek indir</button>`);dialog.querySelector('#backupDownload').onclick=download;}}
  }
  async function receiveLocation(){
    if(!location.hash.startsWith('#depo-transfer='))return;
    if(document.querySelector('dialog[open]')){notify('Aktarım için açık paneli kapatıp bağlantıyı yeniden açın.');return;}
    const fragment=location.hash;history.replaceState(history.state,'',location.pathname+location.search);
    draw('Yedeği incele','<p class="backupLead" role="status">Aktarım denetleniyor…</p>');const token=version;
    try{const result=await readTransfer(fragment,validate);if(token===version&&dialog.open)preview(result,'QR / bağlantı aktarımı');}
    catch(e){if(token===version&&dialog.open)error(e.message);}
  }
  function clearData(){
    const state=getState();
    draw('Tüm verileri temizle',`<p class="backupLead">Bu tarayıcıdaki ${state.vehicles.length} araç ve ${state.records.length} dolum kaydı kalıcı olarak silinecek.</p><p class="backupWarning">Bu işlem geri alınamaz. Garajınız boşaltılır. Tema, seçili il, tanıtım ve bildirim tercihleriniz korunur. İndirdiğiniz yedek dosyaları silinmez.</p><button class="backupExisting" id="clearBackup">Önce yedek indir</button><label class="backupConsent"><input type="checkbox" id="clearConsent"><span>Tüm araçlarımın ve dolum kayıtlarımın silineceğini anladım.</span></label><button class="primary backupConfirm clearDataConfirm" id="clearConfirm" disabled>Tüm verileri kalıcı olarak sil</button><button class="backupExisting" id="clearCancel">Vazgeç</button>`);
    dialog.querySelector('#clearBackup').onclick=download;
    dialog.querySelector('#clearCancel').onclick=()=>dialog.close();
    const consent=dialog.querySelector('#clearConsent'),button=dialog.querySelector('#clearConfirm');
    consent.onchange=()=>button.disabled=!consent.checked;
    button.onclick=()=>{
      if(!consent.checked)return;
      if(commit({vehicles:[],records:[],selected:null})){
        dialog.close();onCleared?.();notify('Tüm araçlar ve dolum kayıtları silindi.');
      }else error('Veriler temizlenemedi. Mevcut kayıtlar korunuyor; tarayıcının depolama iznini kontrol edin.');
    };
  }
  return {open:menu,openClear:clearData,receiveLocation};
}

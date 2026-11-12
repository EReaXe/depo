export function installationGuide({userAgent='',platform='',maxTouchPoints=0,secure=true}={}){
  if(!secure)return {steps:['Uygulamanın HTTPS ile başlayan yayın adresini açın.','Ayarlar bölümünden Uygulamayı yükle seçeneğine tekrar dokunun.'],note:'Bu bağlantıda kurulum kullanılamıyor. Güvenli yayın adresini veya localhost önizlemesini kullanın.'};
  const ios=/iPhone|iPad|iPod/i.test(userAgent)||(platform==='MacIntel'&&maxTouchPoints>1);
  if(ios)return {steps:['Bu sayfayı Safari’de açın.','Safari menüsündeki Paylaş düğmesine dokunun.','Ana Ekrana Ekle seçeneğini seçin. Görünüyorsa Web Uygulaması Olarak Aç seçeneğini açık bırakın.','Ekle düğmesine dokunun. Depo’yu Ana Ekranınızdaki simgeden açabilirsiniz.'],note:'iPhone ve iPad’de kurulum Safari menüsünden tamamlanır; uygulama bu menüyü otomatik açamaz.'};
  if(/Android/i.test(userAgent))return {steps:['Bu sayfayı Chrome veya PWA kurulumunu destekleyen bir tarayıcıda açın.','Tarayıcının menüsünden Uygulamayı yükle veya Ana ekrana ekle seçeneğini bulun.','Yükle seçeneği sunuluyorsa onaylayın ve Depo’yu eklenen simgeden açın.'],note:'Menü adları tarayıcıya göre değişebilir. Seçenek görünmüyorsa sayfayı yenileyin veya destekleyen bir tarayıcı kullanın.'};
  return {steps:['Bu sayfayı Chrome, Edge veya web uygulaması kurulumunu destekleyen bir tarayıcıda açın.','Adres çubuğundaki yükleme simgesini ya da tarayıcı menüsündeki Uygulamayı yükle seçeneğini kullanın.','Mac’te Safari kullanıyorsanız Dosya menüsünden Dock’a Ekle seçeneğini kullanabilirsiniz.'],note:'Kurulum seçenekleri cihaz ve tarayıcıya bağlıdır. Depo zaten yüklüyse uygulama simgesinden açabilirsiniz.'};
}
export function createInstallController({button,events=window,display=matchMedia('(display-mode: standalone)'),device=navigator,onGuide,onInstalled}={}){
  let pending=null,installed=false,busy=false;
  const label=button.querySelector('[data-install-label]')||button;
  function update(){const running=display.matches||device.standalone===true;button.hidden=false;button.disabled=busy||installed||running;label.textContent=installed||running?'Uygulama yüklü':busy?'Kurulum açılıyor…':'Uygulamayı yükle';}
  events.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;update();});
  events.addEventListener('appinstalled',()=>{pending=null;installed=true;update();onInstalled?.();});
  if(display.addEventListener)display.addEventListener('change',update);else display.addListener?.(update);
  button.addEventListener('click',async()=>{
    if(button.disabled)return;
    if(!pending){onGuide();return;}
    const event=pending;pending=null;busy=true;update();
    try{await event.prompt();}catch{onGuide();}finally{busy=false;update();}
  });
  update();
}

# Depo — geliştirme ve tasarım kuralları

Bu dosya tüm depoya uygulanır. Kullanıcının en son açık talimatı bu kurallardan önceliklidir. Değişiklikleri adım adım, istenen kapsamda yap; ilgisiz özellik, yeniden tasarım veya bağımlılık ekleme. Proje beta aşamasındadır. Uygulamanın mevcut adı **Depo**; yeni ad henüz kararlaştırılmadı.

## Teknoloji ve dağıtım

- Yalnızca HTML, CSS ve vanilla JavaScript ES modülleri kullan. Framework, derleme gereksinimi veya sunucu bağımlılığı getirme.
- **Sites becerisini ve Sites araçlarını kullanma.**
- Uygulama GitHub Pages üzerinde hem alan adı kökünde hem depo alt yolunda çalışmalı. Kaynaklarda `/assets/...` gibi alan adı köküne bağlı yollar kullanma.
- Node.js yalnız yerel geliştirme ve kontroller içindir. Yayındaki uygulama Node.js veya npm gerektirmez.
- PWA kurulumu, standalone görünüm, HTTPS/localhost ve çevrimdışı kullanım korunmalı. `sw.js` kökte kalmalı; kapsamı yanlışlıkla `assets/js` altına daraltma.
- Çalışma zamanı dosyası eklendiğinde/taşındığında HTML, modül importları, manifest ve service worker önbellek listesini birlikte güncelle. Yayına çıkacak kaynak değişikliklerinde `sw.js` içindeki `CACHE` sürümünü artır.
- Kullanıcı istemeden yayınlama, GitHub'a gönderme veya harici hizmet bağlama.

## Dosya düzeni

- `index.html`: uygulama kabuğu ve erişilebilir HTML.
- `manifest.webmanifest`, `sw.js`: kökteki PWA girişleri.
- `assets/css/style.css`: arayüz stilleri.
- `assets/js/app.js`: uygulama durumu, kayıt işlemleri ve ekran koordinasyonu.
- `assets/js/core/`: DOM'dan bağımsız hesaplama mantığı.
- `assets/js/data/`: marka/model kataloğu ve araç detay doğrulaması.
- `assets/js/ui/`: araç kartı, paneller, karşılama ve araç sihirbazı.
- `assets/icons/`: PWA ikonları; `assets/brands/`: gerçek marka logoları.
- `docs/`: güncel ürün/tasarım açıklamaları ve logo kaynakları.
- `scripts/`: bağımlılıksız yerel sunucu ve yapısal kontroller; `tests/`: anlamlı davranış testleri.
- Geçici önizleme, ekran görüntüsü, test verisi veya sunucu günlüklerini yayın dosyalarının arasına bırakma. Yeni dosyaları köke yığma.

## Ürün ve hesaplama

- Arayüz Türkçedir. Sayı/para biçimi `tr-TR`, kilometre `km`, yakıt litre, tüketim `L/100 km`, maliyet `TL/km`.
- Hesap açma zorunluluğu yoktur. Veriler cihazın tarayıcısında localStorage ile tutulur. Bulut senkronizasyonu mevcut değildir.
- Mevcut saklama anahtarları `depo-v1` ve `depo-welcome-v1` korunmalı. Şema değişirse eski araç ve yakıt kayıtları ile JSON yedekleri için geriye uyumluluk veya açık bir geçiş sağla.
- Yedek dışa/içe aktarma korunmalı. İçe aktarılan verileri doğrula; içe aktarmanın mevcut verileri değiştireceğini belirt. Saklama hatasında başarı mesajı verme ve mevcut veriyi sessizce silme.
- İlk tam dolum başlangıçtır; litre ve tutarı tüketim aralığına girmez. Sonraki tam doluma kadar olan kısmi dolumlar dahil tüm litre ve tutarları biriktir.
- Tamamlanan aralıkların toplam litresi / toplam mesafesi × 100 = tüketim; toplam tutarı / toplam mesafesi = kilometre maliyeti. Aralık ortalamalarının basit ortalamasını alma.
- Son tamamlanmamış aralık ortalamaya dahil edilmez. Toplam harcama/litre ise tüm kayıtları kapsar. İlk araç kilometresi tek başına bir tüketim veya yakıt kaydı oluşturmaz.
- Yetersiz veride `—` göster; sıfır veya örnek veriyi gerçek sonuç gibi sunma. Kilometre kartta başlangıç kilometresi ve yakıt kayıtlarının en yüksek kilometresi üzerinden gösterilir.
- Aynı kilometrede aynı yakıt için ikinci dolum ve kilometreyle çelişen tarih sırası reddedilir. Çift yakıtta aynı kilometrede farklı yakıtlar ayrı kaydedilebilir. Yakıt türü bilinmeyen eski kayıtla aynı kilometrede yeni kayıt açılmaz. Kayıtlar araçlara göre ayrılır.
- Elektrikli araç kaydı desteklenir; kWh hesabı henüz yoktur. Litre hesabını elektrik tüketimi gibi sunma.
- Fiyatlar ekranı Döviz.com il/marka tablolarını ve Shell resmî ilçe fiyatlarının il/yaka medyanını gösterir. Bu değerleri tek tek istasyonların kesin pompa fiyatı gibi sunma.

## Gezinme ve beta kapsamı

- Alt menü sırası: **Ana Sayfa, Raporlar, +, Araçlar, Fiyatlar**.
- **Raporlar ve Araçlar etkindir.** Araç seçimi ve yönetimi Araçlar sekmesindedir.
- Ortadaki `+` yakıt ekler. Araç yoksa Ana Sayfa'daki araç ekleme eylemine yönlendirir.
- Üstte uygulama adı ortalanır. Soldaki menü Ayarlar panelini açar. Sağdaki bildirim simgesi aktiftir ve bildirim panelini açar; rozet yalnızca gerçek okunmamış bildirim sayısını gösterir.
- Ana Sayfa'da **“Ana Sayfa” başlığı ve logo altı ayırıcı çizgi bulunmaz**.
- Araç yoksa ortalanmış **“Garaja araç ekleyin”** metni ve çalışan araç ekleme düğmesi gösterilir.
- Araç varsa Ana Sayfa kart düzenindedir. İlk kart marka logosu/adı, model, plaka veya plaka ekleme bağlantısı, kilometre, ortalama tüketim ve maliyet içerir.
- Araç kartındaki ok doğrudan düzenlemeye gitmez: araç özellikleri panelini açar. Panelin sağ üstündeki kalem/**Düzenle** araç düzenlemesini açar. Plaka bağlantısı mevcut aracın 6. adımına gider.
- Araç özelliklerinde motor, kasa tipi, depo hacmi ve şehir/yol tüketimi yalnız kaynaklı yerel katalogdaki kesin ortak eşleşmeyle gösterilir. Model adından tahmin edilmez. Ek motor/versiyon seçimi eklenmez; belirsiz alanlar `—` kalır. WLTP birleşik değer ayrı etiketlenir; dolum hesabına katılmaz.
- Ayarlardan tanıtımı yeniden açma ve yedek işlemlerine erişilir; araç ekleme Araçlar sekmesindedir. Uygulamayı yükle seçeneği Ayarlarda her zaman görünür; doğrudan kurulum desteklenmiyorsa cihaza uygun rehber açılır.

## Hızlı dolum

- Ortadaki +, Hızlı dolum panelini açar. Yakıt türü aracın yakıtına göre sunulur; Benzin + LPG için LPG ve Benzin ayrı seçeneklerdir.
- Kullanıcı ödenen TL, TL/L litre fiyatı ve güncel kilometre girer. Litre = tutar / litre fiyatı olarak hesaplanır; gösterimde yuvarlanır, kayıtta hassas değer korunur. Kayıt bugünün yerel tarihiyle eklenir.
- Seçilen yakıt için Depoyu tam doldurdum seçeneği korunur. Kilometre son bilinen değerden küçük olamaz.
- fuel ve unitPrice alanları JSON yedekleme, yeniden yükleme ve düzenlemede korunur. Eski türsüz kayıtlar geçerli kalır; yakıt türleri geriye dönük tahmin edilmez.
- Kullanıcının istediği otomatik fiyat konuma en yakın istasyona dayanmalıdır. İstasyon/fiyat servisi henüz bağlı değildir. Veri yoksa fiyat elle girilir veya aynı araç ve yakıtın son fiyatı tarihiyle önerilir; güncel diye sunulmaz.
- Birden fazla yakıt türünün dolumları aynı depo gibi birleştirilmez. Birleşik tüketim/maliyet hesabı henüz desteklenmediğinde — ve açıklama gösterilir; toplam harcama ve litre korunur.

## İlk giriş ve araç ekleme

- Araçsız ilk girişte özellikleri anlatan karşılama gösterilir. Tamamlanma bu tarayıcıda hatırlanır; mevcut araç sahipleri zorunlu tanıtıma sokulmaz.
- **Başlayalım** ve **Şimdilik keşfet** doğrudan Ana Sayfa'ya döner; otomatik araç formu açılmaz. Tanıtım Ayarlardan tekrar açılabilir.
- Araç ekleme/düzenleme tam ekran, mobil, adımlı akıştır:
  1. Gerçek marka ve logolu, aranabilir seçim.
  2. Markaya bağlı model; listede yoksa elle model adı.
  3. Üretim yılı.
  4. Yakıt türü.
  5. Güncel kilometre.
  6. İsteğe bağlı plaka.
  7. Son yakıt alımı: **şimdilik atlanır**; ekleme.
  8. Renk. **Diğer detaylar** içinde isteğe bağlı vites türü.
- Son eylem **Garaja ekle** (düzenlemede Değişiklikleri kaydet). Geri dönüşte taslak değerleri korunur; marka değişirse önceki model temizlenir. Kaydedilmemiş taslağı kapatırken mevcut uyarıyı koru.
- Katalog başlangıç listesidir; tüm yıl/model/yakıt kombinasyonlarının resmi doğrulaması değildir. Kullanıcıya kapsamı yanlış tanıtma.
- Gerçek logolar yerel dosyalardan ve çevrimdışı yüklenir; emoji veya uydurma logo kullanma. Kaynak/hak bilgilerini `docs/BRAND_ASSETS.md` ve `docs/brand-sources.json` içinde koru.

## Tasarım ve erişilebilirlik

- Görsel otorite kullanıcının verdiği referanslar ve [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines). Bir çelişkide kullanıcının açık tercihini koru ve istisnayı belgeleyerek ilerle.
- Tam yerel iOS bileşeni veya yüzde yüz HIG uyumluluğu iddiasında bulunma: bu bir web/PWA uygulamasıdır. Pasif sekmeler ve alt menüdeki eylem `+`, kullanıcının istediği HIG istisnalarıdır.
- Mobil öncelikli tek sütun; masaüstünde de en fazla **480 px** ortalanmış uygulama kabuğu. Yatay taşma oluşturma; dar ekran, klavye ve safe-area boşluklarını gözet.
- Sistem yazı tipi: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Zemin `#f2f2f7`, yüzey beyaz, ana metin `#1c1c1e`, ikincil `#62626a`, eylem `#0066cc`, çizgi `#d9d9df`.
- Ana araç kartı açık mavi, yaklaşık 22 px köşe yarıçaplı ve kompakt üç ölçümlüdür. Diğer yüzeylerde gruplanmış listeler ve ölçülü derinlik kullan. Yeni sayfalarda eski yeşil/masaüstü tasarımına geri dönme.
- Birincil dokunma hedefleri en az **44×44 CSS px**. Form yazıları iOS'ta odak zoom'unu önleyecek en az 16 px; okunur ölçek, sarılabilen içerik ve tabular sayılar kullan.
- Semantik düğme/label/başlık, ikonlara erişilebilir ad, görünür klavye odağı, hata bildirimleri ve yeterli renk kontrastı sağla. Rengi tek bilgi kanalı olarak kullanma.
- Kısa görevler ve araç detayları alttan açılan sheet/panel; uzun araç sihirbazı tam ekran. Tek anda bir panel göster. Düzenlemeye geçerken bilgi panelini kapat.
- Panel kapatma düğmesi, Escape, uygun arka plan tıklaması ve tutamaç davranışı korunur. Kaydırma içerikte olmalı; düğmeler erişilebilir kalmalı. Odak açılışta panele, kapanışta uygun tetikleyiciye döner.
- Tanıtım açıkken arka plan inert olur. Hareket azaltma, yüksek kontrast ve desteklenen azaltılmış saydamlık tercihlerini gözet. Animasyon kısa ve amaca yönelik olsun.
- Sahte işlev, tıklanabilir gibi duran çalışmayan kontrol veya kullanıcı verisi gibi görünen örnek kayıt ekleme. Devre dışı işlevleri açıkça belirt.

## Kontrol ve bakım

- Yapısal değişikliklerde `npm run check`; hesaplama/veri davranışı veya yol değişikliklerinde `npm test` çalıştır. Bu komutlar bağımlılık yüklemeden Node.js ile çalışır.
- Görsel değişiklikte ilgili ekranları telefon genişliğinde kontrol et; gerçek araçlı ve araçsız durumları, panel/form akışlarını ve taşmayı kapsa. Sadece sözdizimi kontrolü yapıldıysa tarayıcıda doğrulanmış gibi raporlama.
- PWA değişikliklerini HTTPS/localhost üzerinde kurulum, yenileme ve ilk yükleme sonrası çevrimdışı davranış açısından kontrol et. Yol değişikliğinde depo alt yolu çözümlemesini kontrol et.
- Test sırasında gerçek localStorage kayıtlarını veya yedekleri silme. Test verisini kullanıcı verileri arasına bırakma.
- `docs/PRODUCT.md`, `docs/DESIGN.md` ve README'yi yalnız güncel durumu anlatacak şekilde tut; terk edilen tasarım kararlarını üst üste ekleme. Kalıcı kullanıcı kararı değiştiğinde bu dosyayı da güncelle.

## Fiyatlar ekranı ve veri yenileme

- Fiyat kaynağı Döviz.com il/marka tabloları ve Shell resmî fiyat servisidir. scripts/sync-prices.mjs 81 il için İstanbul yakalarını ayırarak 82 tabloyu ve Shell API’sini alır; tarayıcı yalnız yerel assets/data/brand-prices.json dosyasını okur. Döviz.com satır tarihleri korunur. Shell’de yayın tarihi yoktur; kontrol tarihi gösterilir ve ilçe fiyatlarının il/yaka medyanı açıkça belirtilir. Eksik fiyat tahminle doldurulmaz. 24 saatten eski gözlemler ve 10 günden eski Döviz.com tarihleri karşılaştırmaya alınmaz. Hatalı yenilemede eski satırın tarihi korunur. Fiyatlar istasyon pompa fiyatı garantisi değildir. Mevcut 6 saatlik kaynak kontrolü ve 5 dakikalık tarayıcı yenilemesi korunur.
- Kaynaklar görünür ve tıklanabilir olmalı: https://www.doviz.com/akaryakit-fiyatlari ve https://pompafiyat.turkiyeshell.com/. Shell ürün kodları resmî yanıttan doğrulanır. İstanbul yakaları ilçe adına göre ayrılır, bilinmeyen ilçe tahmin edilmez. İl/yakıt medyanından %25’ten fazla sapan kaynak değerleri değiştirilmez; kontrol etiketiyle en düşük seçiminden çıkarılır.
- 81 il elle seçilebilir. GPS yerel il sınırlarında eşleştirilir; kesin koordinatlar dış servislere gönderilmez. İl seçimi depo-price-city anahtarında saklanır; coğrafi kaynak/lisans belgeleri korunur.

## Fiyatlar için güncel marka seçimi

- Fiyatlar ekranında ana markalar Petrol Ofisi, Opet, Shell, TotalEnergies, Aytemiz, Lukoil ve Alpet'tir. GO, Kadoil, Sunpet ve M Oil kapalı başlayan “Diğer markalar” bölümünde yer alır. Diğer markalar listelenmez; en düşük fiyat seçimi ve fiyat vurgusu yalnızca 7 ana marka arasında yapılır. Diğer markalar bölümünde fiyat vurgusu bulunmaz. Gerçek logolar assets/brands/fuel altında yerel ve çevrimdışı yüklenir.
- LPG de Döviz.com ve Shell kaynaklarından alınır. Kaynakta olmayan fiyat — gösterilir; başka markadan fiyat eşlenmez. Eski Turkpidya/PO/Aytemiz dosya biçimleri önbellek geçişi için okunabilir; yeni eşitleme bunları çağırmaz.

## Sekmeyi hatırlama

- Son açık sekme bu tarayıcıda depo-last-screen anahtarıyla hatırlanır. Yenilemede veya uygulama yeniden açıldığında Ana Sayfa, Raporlar, Araçlar ya da Fiyatlar sekmesine dönülür; kayıt yoksa, değer geçersizse veya depolama kullanılamıyorsa Ana Sayfa açılır. Geçersiz sekmeler geri yüklenmez.
- Tanıtımı tamamlama Ana Sayfa'ya döndürür. + ve paneller sekme olarak saklanmaz.

## Panel sürükleme

- Alttan açılan Ayarlar, araç özellikleri, tüketim açıklaması, Hızlı dolum ve il seçimi panelleri ortak tutamaçtan sürüklenir. Panel hareketi parmağı takip eder; yukarı sürükleme genişletir, aşağı sürükleme geniş paneli küçültür veya kapatır. İçerik kaydırması ayrıdır; tutamaç klavyeyle de kullanılabilir. Kaydedilmemiş dolum uyarısı sürükleyerek kapatmada da korunur.

## Tema tercihi

- Görünüm varsayılan olarak cihaz temasını izler. Ayarlar > Görünüm içinde Cihaz teması, Açık ve Koyu seçenekleri bulunur. Seçim depo-theme anahtarında bu tarayıcıda saklanır; Cihaz teması seçiliyken sistem değişiklikleri anında uygulanır. Tercih ilk çizimden önce uygulanarak ters tema parlaması önlenir. Depolama engelliyse tema o oturumda uygulanır ve saklanamadığı belirtilir.
- Açık tema mevcut renklerini korur. Koyu tema zemin #1c1c1e, yüzey #2c2c2e, ana metin #f2f2f7 kullanır; tasarım renkleri assets/css/theme.css değişkenleriyle yönetilir. Marka logoları renklendirilmez. PWA tarayıcı tema rengi etkin temayla güncellenir.

## Yedekleme ve aktarım

- Ayarlar > Yedekleme ve aktarım panelinde Yedek indir, Yedekten yükle ve Başka cihaza aktar bulunur. JSON yedekleri format/sürüm ve oluşturulma tarihi içerir; eski sürümsüz ve version:1 yedekleri desteklenir. Dosya veya QR bağlantısı önce tarih, araç ve dolum sayısıyla önizlenir. Yükleme mevcut verilerin yerini alır; onay kutusu ve açık yükleme eylemi olmadan veri yazılmaz. Önizlemeden mevcut yedek indirilebilir. Büyük yedekler JSON dosyasıyla aktarılır. QR/bağlantı bir anlık kopyadır, senkronizasyon değildir.
- JSON içe aktarma en fazla 5 MB kabul eder; gerçek takvim tarihi, kayıt ilişkileri, yakıt/fiyat alanları ve sıra tutarlılığı doğrulanır. Saklama hatasında mevcut veriler korunur.
- QR cihazda yerel kodlayıcıyla oluşturulur; lisans docs/THIRD_PARTY.md içindedir. Aktarım verisi URL fragment bölümünde taşınır; açılınca adres çubuğundan temizlenir. Bağlantıyı bilen veriye erişebilir; şifreli veya süresi dolan bağlantı iddiası kullanma.
- localhost bağlantısının başka cihazda açılmayacağı panelde belirtilir; üretimde o anki kök/alt yol korunur. Bulut hizmeti veya arka plan senkronizasyonu bağlanmaz.

## PWA kurulum seçeneği

- Ayarların en üstünde Uygulamayı yükle seçeneği her zaman görünür. Tarayıcı beforeinstallprompt olayını sağlıyorsa düğme doğrudan gerçek kurulum penceresini açar; destek yoksa cihaz/tarayıcıya uygun kurulum adımları gösterilir. iPhone/iPad için Safari > Paylaş > Ana Ekrana Ekle akışı anlatılır. Standalone görünümde veya doğrulanmış appinstalled olayı sonrasında seçenek Uygulama yüklü olarak pasiftir; iptal edilen istek kurulum başarısı sayılmaz.
- Kullanıcı onayı olmadan tarayıcı kurulum onayı atlanmaz. Gerçek cihaz kurulumu ve çevrimdışı kontrolü yapılmadıysa test edilmiş gibi raporlama.

## Beklenti haberleri ve bildirimler

- Fiyatlar ekranının üstünde yalnızca güncel, süresi dolmamış zam/indirim beklentisi haberi varsa kaynak ve yayın tarihiyle bir alan görünür. Beklenti kesin fiyat gibi sunulmaz. Üstteki bildirim paneli beklenti haberlerini ve seçili ildeki gerçek fiyat değişikliklerini gösterir; yalnız kaynak kontrol tarihi değişince veya bir il ilk kez yüklenince bildirim oluşturulmaz. Okunmamış rozet, okundu durumu ve iki bildirim türünün tercihleri bu tarayıcıda saklanır. Bildirimler uygulama açık ve görünürken kontrol edilir; kapalı uygulamaya push gönderilmez.
- Beklenti kaynağı NTV ve TRT Haber RSS/Atom akışlarıdır. Haber tarihi ileri taşınmaz; süre bitince üst alan gizlenir. Örnek haber veya fiyat gerçek içerik olarak eklenmez. Ayrıntılar docs/NOTIFICATIONS.md içindedir.
- Bildirim durumu depo-notifications-v1 anahtarındadır; araç/yakıt verilerinden ayrıdır. İzin isteme, kapalıyken push veya arka plan hizmeti mevcut kapsamda yoktur.

Ayarlar > Veriler ve uygulama > Tüm verileri temizle, araç ve dolum sayılarını gösteren onay panelini açar. Önce yedek indirilebilir; onay kutusu ve kalıcı silme düğmesi olmadan veri silinmez. Başarılı işlem garajı boşaltıp Ana Sayfa’ya döner; saklama hatasında mevcut kayıtlar korunur. Tema, seçili il, tanıtım ve bildirim tercihleri ile indirilmiş yedekler korunur.

Fiyatın yanında aynı il/yaka, marka, yakıt ve kaynaktaki son farklı fiyata göre artışta yeşil yukarı, düşüşte kırmızı aşağı ok gösterilir (kullanıcının açık renk tercihi). Okun erişilebilir açıklaması önceki fiyatı içerir. İlk gözlemde, kaynak değişince ve eski/geçersiz fiyatta ok yoktur. Fiyat sabit kaldığında son değişim yönü korunur; yenileme kendi başına ok oluşturmaz. Geçmiş veri kaynağın geçmiş servisi değildir; bundan sonraki eşitlemelerle birikir.

Ana Sayfa’da Ana Sayfa özet kartlarının altında yalnız geçerli zam/indirim beklentisi haberi olduğunda SON DAKİKA şeridi görünür. Mevcut NTV/TRT haber akışı, kaynak doğrulaması ve süre sonu kuralları kullanılır; kaynak ve özgün yayın tarihi gösterilir. Haber yokken veya süre dolunca alan gizlenir. Birden fazla geçerli haber aynı alanda listelenir; otomatik kayan/yanıp sönen metin yoktur. Beklenti kesin fiyat olarak sunulmaz.

Beklenti haberleri SON DAKİKA şeridinde, Fiyatlar beklenti alanında ve Bildirimlerde kaynaktan açıkça çıkarılabilen tutarı da gösterir. Zam/indirim miktarı TL/L olarak etiketlenir; kaynak beklenen litre fiyatını açıkça veriyorsa ayrı belirtilir. Mevcut il fiyatına zam eklenerek tahmini yeni fiyat üretilmez. RSS başlık/özetindeki geleceğe yönelik açık tutar cümleleri kullanılır; yakıt eşleşmesi belirsiz veya tutarlar çelişkiliyse gösterilmez. Tutar çıkarılamazsa “Tutar bilgisi alınamadı.” yazılır. Eski haber kayıtları geçerli kalır; aynı haber güncellenirse mevcut bildirim metni güncellenir, yeniden okunmamış bildirim oluşturulmaz.


Ana Sayfa araç kartını Aylık harcama, Yaklaşan işler ve Son işlemler kartları izler. Aylık harcama seçili aracın bu ayki tüm yakıt tutarlarını toplar; MTV, bakım, lastik, muayene ve diğer giderler henüz kaydedilemediği için — gösterilir. Yaklaşan işler şimdilik açıkça boş durumdur; iş ekleme/tamamlama yoktur. Son işlemler en yeni üç yakıt kaydını gösterir. Harcama ve son işlemler kartının tamamı Raporlar içindeki ilgili bölüme gider. Raporlar ay seçimiyle yakıt harcamalarını, tüm zamanların yakıt özetini ve düzenlenebilir dolum geçmişini sunar. Araçlar etkindir. SON DAKİKA alanı bu üç karttan sonra gösterilir.


Kullanıcının sabit ölçek tercihiyle viewport 1× olarak sınırlandırılır; dokunmatik pinch/çift dokunma yakınlaştırması, uygulama içindeki Ctrl/Cmd + tekerlek ve yakınlaştırma klavye kısayolları engellenir. Normal kaydırma korunur. Bu, yakınlaştırma erişilebilirliği açısından açık kullanıcı tercihidir; tarayıcının menüsünü, erişilebilirlik geçersiz kılmalarını veya işletim sistemi büyütecini web uygulaması denetleyemez.


Araçlar sekmesi kayıtlı araçları gerçek marka logosu, araç adı, yıl/yakıt, plaka ve kilometreyle listeler. Seçili araç hafif mavi çevre parıltısı, belirgin çerçeve, Seçili araç metni ve aria-pressed ile belirtilir; parıltı kullanıcının açık görsel tercihidir. Araçlar arasında geçiş burada yapılır; Ana Sayfa ve Raporlar araç seçicileri kaldırılmıştır. Yeni araç ekle mevcut sihirbazı, Detaylar mevcut özellikler panelini açar. Aracı sil araç adı ve dolum sayısıyla onay ister; yalnız ilgili araç/dolumlar silinir. Seçilmeyen araç silinince seçim korunur, seçili araç silinince kalan ilk araç seçilir. Saklama hatasında kayıtlar korunur. Ayarlarda araç ekleme bulunmaz.

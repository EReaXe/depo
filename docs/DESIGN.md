# Depo · Güncel tasarım sistemi

Tek görsel yön Apple iOS Human Interface Guidelines ve kullanıcının referanslarıdır. Eski yeşil/masaüstü tasarım güncel yön değildir. Ayrıntılı davranış ve bakım kuralları kökteki AGENTS.md içindedir.

## Temel değerler

- En fazla 480 px, ortalanmış mobil uygulama kabuğu; her ekranda tek sütun.
- Sistem fontu: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.
- Açık tema: zemin #f2f2f7, yüzey #fff, metin #1c1c1e, ikincil #62626a, eylem #0066cc, çizgi #d9d9df.
- En az 44 px ana dokunma hedefleri, mobil form girdilerinde en az 16 px yazı.
- Safe-area boşlukları, görünür klavye odağı, semantik etiketler, metin sarma ve hareket/kontrast tercihleri.

## Ekranlar

Uygulama adı üstte ortalanır; sol menü Ayarları açar, sağ bildirim simgesi aktif bildirim panelini açar. Ana Sayfa başlığı ve logo altında ayırıcı yoktur. Araçsız durumda ortada Garaja araç ekleyin metni ve düğme bulunur.

Ana Sayfa'nın ilk kartı kullanıcının açık mavi referansını izler: 22 px köşeler, gerçek marka logosu, marka/model, plaka bağlantısı, sağ ok ve üç ölçüm. Sağ ok özellikler panelini açar; düzenleme panel içindedir. Kesin kaynak eşleşmesi olmayan teknik özellikler — gösterilir.

Alt gezinme sırası Ana Sayfa / Raporlar / + / Araçlar / Fiyatlar. Raporlar ve Araçlar etkin; + kayıt eylemidir. Devre dışı sekmeler ve sekme çubuğundaki eylem, kullanıcı tarafından istenen HIG istisnalarıdır. Web/PWA için yerel iOS veya yüzde yüz HIG uyumluluğu iddiası yoktur.

Kısa görevler alttan açılan panelde, çok adımlı araç akışı tam ekran sunulur. Bilgi panelinin sağ üstünde Düzenle vardır. Paneller birikmez; kapatma, Escape, arka plan ve tutamaç davranışları korunur. İçerik kayar, eylemler erişilebilir kalır.

Araç akışı 1–6 ve 8. adımları kullanır; 7. adım atlanır. Marka araması, markaya bağlı model ve manuel model, yıl, yakıt, kilometre, isteğe bağlı plaka, renk; son adımda isteğe bağlı vites ve özet. Geri dönüşte taslak korunur.

Tanıtım mevcut sisteme uyumlu tam ekran sunulur; arka plan inert olur. Başlayalım ve Şimdilik keşfet Ana Sayfa'ya döner. Ayarlardan tekrar açılır.

Rehber: https://developer.apple.com/design/human-interface-guidelines

Hızlı dolum kısa görev panelidir: Vazgeç / Hızlı dolum başlığı, araca uygun segmentli yakıt seçimi, ödenen tutar, litre fiyatı, güncel kilometre, otomatik litre özeti ve tam dolum seçeneği. Kaydet alt alanda sabit kalır; içerik kayar. Sayısal girişler Türkçe virgül ve nokta ondalığını destekler. Güncel fiyat yoksa açık bilgi, son kullanılan fiyat varsa tarih gösterilir.


Fiyat kaynağı Döviz.com il/marka tabloları ve Shell resmî fiyat servisidir. scripts/sync-prices.mjs 81 il için İstanbul yakalarını ayırarak 82 tabloyu ve Shell API’sini alır; tarayıcı yalnız yerel assets/data/brand-prices.json dosyasını okur. Döviz.com satır tarihleri korunur. Shell’de yayın tarihi yoktur; kontrol tarihi gösterilir ve ilçe fiyatlarının il/yaka medyanı açıkça belirtilir. Eksik fiyat tahminle doldurulmaz. 24 saatten eski gözlemler ve 10 günden eski Döviz.com tarihleri karşılaştırmaya alınmaz. Hatalı yenilemede eski satırın tarihi korunur. Fiyatlar istasyon pompa fiyatı garantisi değildir. Mevcut 6 saatlik kaynak kontrolü ve 5 dakikalık tarayıcı yenilemesi korunur.


Fiyatlar ekranında ana markalar Petrol Ofisi, Opet, Shell, TotalEnergies, Aytemiz, Lukoil ve Alpet'tir. GO, Kadoil, Sunpet ve M Oil kapalı başlayan “Diğer markalar” bölümünde yer alır. Diğer markalar listelenmez; en düşük fiyat seçimi ve fiyat vurgusu yalnızca 7 ana marka arasında yapılır. Diğer markalar bölümünde fiyat vurgusu bulunmaz. Gerçek logolar assets/brands/fuel altında yerel ve çevrimdışı yüklenir.

Son açık sekme bu tarayıcıda depo-last-screen anahtarıyla hatırlanır. Yenilemede veya uygulama yeniden açıldığında Ana Sayfa, Raporlar, Araçlar ya da Fiyatlar sekmesine dönülür; kayıt yoksa, değer geçersizse veya depolama kullanılamıyorsa Ana Sayfa açılır. Geçersiz sekmeler geri yüklenmez.

Alttan açılan Ayarlar, araç özellikleri, tüketim açıklaması, Hızlı dolum ve il seçimi panelleri ortak tutamaçtan sürüklenir. Panel hareketi parmağı takip eder; yukarı sürükleme genişletir, aşağı sürükleme geniş paneli küçültür veya kapatır. İçerik kaydırması ayrıdır; tutamaç klavyeyle de kullanılabilir. Kaydedilmemiş dolum uyarısı sürükleyerek kapatmada da korunur.

Görünüm varsayılan olarak cihaz temasını izler. Ayarlar > Görünüm içinde Cihaz teması, Açık ve Koyu seçenekleri bulunur. Seçim depo-theme anahtarında bu tarayıcıda saklanır; Cihaz teması seçiliyken sistem değişiklikleri anında uygulanır. Tercih ilk çizimden önce uygulanarak ters tema parlaması önlenir. Depolama engelliyse tema o oturumda uygulanır ve saklanamadığı belirtilir.
Koyu tema: zemin #1c1c1e, yüzey #2c2c2e, metin #f2f2f7, ikincil #b1b1ba, eylem #70b5ff, çizgi #48484c. Mavi kartlar koyu mavi tonlarını korur; dolu eylem düğmeleri beyaz metinle koyu mavi kalır. Renkler ortak CSS değişkenlerinden gelir. Gerçek logoların görünürlüğü için gerektiğinde beyaz logo zemini kullanılır. Sistem form kontrolleri color-scheme ile temaya uyum sağlar.

Ayarlar > Yedekleme ve aktarım panelinde Yedek indir, Yedekten yükle ve Başka cihaza aktar bulunur. JSON yedekleri format/sürüm ve oluşturulma tarihi içerir; eski sürümsüz ve version:1 yedekleri desteklenir. Dosya veya QR bağlantısı önce tarih, araç ve dolum sayısıyla önizlenir. Yükleme mevcut verilerin yerini alır; onay kutusu ve açık yükleme eylemi olmadan veri yazılmaz. Önizlemeden mevcut yedek indirilebilir. Büyük yedekler JSON dosyasıyla aktarılır. QR/bağlantı bir anlık kopyadır, senkronizasyon değildir.
Yedek paneli ortak sürüklenebilir sheet yapısını ve etkin açık/koyu renk değişkenlerini kullanır. QR kod, her temada beyaz sessiz alan ve siyah modüllerle çizilir; kodun renkleri tema tarafından değiştirilmez. Kaydetme hatası önizlemeyi kapatmaz ve başarı mesajı üretmez.

Ayarların en üstünde Uygulamayı yükle seçeneği her zaman görünür. Tarayıcı beforeinstallprompt olayını sağlıyorsa düğme doğrudan gerçek kurulum penceresini açar; destek yoksa cihaz/tarayıcıya uygun kurulum adımları gösterilir. iPhone/iPad için Safari > Paylaş > Ana Ekrana Ekle akışı anlatılır. Standalone görünümde veya doğrulanmış appinstalled olayı sonrasında seçenek Uygulama yüklü olarak pasiftir; iptal edilen istek kurulum başarısı sayılmaz.

Fiyatlar ekranının üstünde yalnızca güncel, süresi dolmamış zam/indirim beklentisi haberi varsa kaynak ve yayın tarihiyle bir alan görünür. Beklenti kesin fiyat gibi sunulmaz. Üstteki bildirim paneli beklenti haberlerini ve seçili ildeki gerçek fiyat değişikliklerini gösterir; yalnız kaynak kontrol tarihi değişince veya bir il ilk kez yüklenince bildirim oluşturulmaz. Okunmamış rozet, okundu durumu ve iki bildirim türünün tercihleri bu tarayıcıda saklanır. Bildirimler uygulama açık ve görünürken kontrol edilir; kapalı uygulamaya push gönderilmez.

Ayarlar > Veriler ve uygulama > Tüm verileri temizle, araç ve dolum sayılarını gösteren onay panelini açar. Önce yedek indirilebilir; onay kutusu ve kalıcı silme düğmesi olmadan veri silinmez. Başarılı işlem garajı boşaltıp Ana Sayfa’ya döner; saklama hatasında mevcut kayıtlar korunur. Tema, seçili il, tanıtım ve bildirim tercihleri ile indirilmiş yedekler korunur.

Fiyatın yanında aynı il/yaka, marka, yakıt ve kaynaktaki son farklı fiyata göre artışta yeşil yukarı, düşüşte kırmızı aşağı ok gösterilir (kullanıcının açık renk tercihi). Okun erişilebilir açıklaması önceki fiyatı içerir. İlk gözlemde, kaynak değişince ve eski/geçersiz fiyatta ok yoktur. Fiyat sabit kaldığında son değişim yönü korunur; yenileme kendi başına ok oluşturmaz. Geçmiş veri kaynağın geçmiş servisi değildir; bundan sonraki eşitlemelerle birikir.

Araç özellikleri paneli, yerel kaynaklı teknik katalogda marka/model/yıl/yakıt ve varsa mevcut vites bilgisiyle eşleşen ortak alanları otomatik gösterir; ek motor/versiyon seçimi yoktur. Birden çok versiyonda farklı olan veya doğrulanmayan motor, kasa, depo ve şehir/yol bilgileri — kalır. Şehir/yol yalnız ayrı NEDC değerleri doğrulanırsa gösterilir; WLTP birleşik tüketim ayrı Fabrika birleşik satırıdır ve gerçek dolum hesabına katılmaz. Veriler cihazda eşleşir, araç kayıtlarına yazılmaz; eski araçlar ve yedek şeması korunur. Başlangıç kapsamı: Clio 2024/2025 için belgelenen yakıt/vitesler, Tiggo 7 ve Tiggo 8 2026 benzinli. Tüm katalog için teknik veri iddiası yoktur. Ayrıntılar docs/VEHICLE_SPECS.md.

Ana Sayfa’da Ana Sayfa özet kartlarının altında yalnız geçerli zam/indirim beklentisi haberi olduğunda SON DAKİKA şeridi görünür. Mevcut NTV/TRT haber akışı, kaynak doğrulaması ve süre sonu kuralları kullanılır; kaynak ve özgün yayın tarihi gösterilir. Haber yokken veya süre dolunca alan gizlenir. Birden fazla geçerli haber aynı alanda listelenir; otomatik kayan/yanıp sönen metin yoktur. Beklenti kesin fiyat olarak sunulmaz.

Beklenti haberleri SON DAKİKA şeridinde, Fiyatlar beklenti alanında ve Bildirimlerde kaynaktan açıkça çıkarılabilen tutarı da gösterir. Zam/indirim miktarı TL/L olarak etiketlenir; kaynak beklenen litre fiyatını açıkça veriyorsa ayrı belirtilir. Mevcut il fiyatına zam eklenerek tahmini yeni fiyat üretilmez. RSS başlık/özetindeki geleceğe yönelik açık tutar cümleleri kullanılır; yakıt eşleşmesi belirsiz veya tutarlar çelişkiliyse gösterilmez. Tutar çıkarılamazsa “Tutar bilgisi alınamadı.” yazılır. Eski haber kayıtları geçerli kalır; aynı haber güncellenirse mevcut bildirim metni güncellenir, yeniden okunmamış bildirim oluşturulmaz.


Ana Sayfa araç kartını Aylık harcama, Yaklaşan işler ve Son işlemler kartları izler. Aylık harcama seçili aracın bu ayki tüm yakıt tutarlarını toplar; MTV, bakım, lastik, muayene ve diğer giderler henüz kaydedilemediği için — gösterilir. Yaklaşan işler şimdilik açıkça boş durumdur; iş ekleme/tamamlama yoktur. Son işlemler en yeni üç yakıt kaydını gösterir. Harcama ve son işlemler kartının tamamı Raporlar içindeki ilgili bölüme gider. Raporlar ay seçimiyle yakıt harcamalarını, tüm zamanların yakıt özetini ve düzenlenebilir dolum geçmişini sunar. Araçlar etkindir. SON DAKİKA alanı bu üç karttan sonra gösterilir.


Kullanıcının sabit ölçek tercihiyle viewport 1× olarak sınırlandırılır; dokunmatik pinch/çift dokunma yakınlaştırması, uygulama içindeki Ctrl/Cmd + tekerlek ve yakınlaştırma klavye kısayolları engellenir. Normal kaydırma korunur. Bu, yakınlaştırma erişilebilirliği açısından açık kullanıcı tercihidir; tarayıcının menüsünü, erişilebilirlik geçersiz kılmalarını veya işletim sistemi büyütecini web uygulaması denetleyemez.


Araçlar sekmesi kayıtlı araçları gerçek marka logosu, araç adı, yıl/yakıt, plaka ve kilometreyle listeler. Seçili araç hafif mavi çevre parıltısı, belirgin çerçeve, Seçili araç metni ve aria-pressed ile belirtilir; parıltı kullanıcının açık görsel tercihidir. Araçlar arasında geçiş burada yapılır; Ana Sayfa ve Raporlar araç seçicileri kaldırılmıştır. Yeni araç ekle mevcut sihirbazı, Detaylar mevcut özellikler panelini açar. Aracı sil araç adı ve dolum sayısıyla onay ister; yalnız ilgili araç/dolumlar silinir. Seçilmeyen araç silinince seçim korunur, seçili araç silinince kalan ilk araç seçilir. Saklama hatasında kayıtlar korunur. Ayarlarda araç ekleme bulunmaz.

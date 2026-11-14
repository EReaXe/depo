# Depo · Beta

HTML, CSS ve vanilla JavaScript ile hazırlanmış, mobil öncelikli yakıt takip PWA uygulaması. Hesap veya sunucu gerektirmez; veriler bu tarayıcıda saklanır. Düzenli JSON yedeği alın.

## Dosya düzeni

```text
index.html                 Uygulama girişi
manifest.webmanifest       PWA tanımı
sw.js                      Çevrimdışı önbellek
AGENTS.md                  Geliştirme ve tasarım kuralları
assets/
  css/style.css            Arayüz stilleri
  js/
    app.js                 Durum ve ekran koordinasyonu
    core/calc.js           Yakıt hesapları
    data/vehicles.js       Marka/model ve doğrulama
    ui/                    Kart, paneller, tanıtım, araç akışı
  icons/                   PWA ikonları
  brands/                  Yerel marka logoları
docs/                      Ürün, tasarım ve kaynak belgeleri
scripts/                   Yerel sunucu ve kontrol aracı
tests/                     Davranış ve yayın yolu testleri
```

## Yerelde çalıştırma

Node.js 20 veya üzeriyle, proje kökünde:

```sh
npm run dev
```

http://localhost:8081 adresini açın. Port doluysa `npm run dev -- 8082` kullanın. Paket kurulumu veya `npm install` gerekmez. Alternatif: `python -m http.server 8081`. ES modülleri/PWA nedeniyle HTML dosyasını çift tıklayarak açmayın.

```sh
npm run check
npm test
```

Kontroller HTML, modül importları, manifest ikonları, önbellek kapsamı ve GitHub Pages alt yollarını inceler. Testler tam/kısmi dolum hesaplarını, araç detaylarını, yedek uyumluluğunu ve beta kilitlerini kapsar. Tarayıcıda kurulum ve çevrimdışı kontrolünün yerini tutmaz.

## GitHub Pages ile beta yayınlama

1. Projeyi GitHub deposuna ekleyin. Settings → Pages → Source alanını **GitHub Actions** seçin.
2. Ana dal main veya master ise push işlemi yayın iş akışını başlatır. Farklı dal adı için .github/workflows/pages.yml içindeki push.branches listesini güncelleyin.
3. Actions → Publish beta and refresh national prices → Run workflow ile elle de çalıştırabilirsiniz. Ortam onayı istenirse GitHub üzerindeki onayı tamamlayın.
4. İş akışı ücretsiz il/marka bildirimlerini alır, kontrolleri çalıştırır ve yalnız index, PWA dosyaları ve assets klasörünü Pages'e yayınlar. Derleme bağımlılığı yoktur.
5. İlk HTTPS yüklemesinden sonra çevrimdışı açılışı kontrol edin. Android tarayıcısında yükleme veya iOS Safari → Paylaş → Ana Ekrana Ekle kullanılabilir.

Marka verisi 6 saatte bir kontrol edilip site yeniden yayınlanır. GitHub zamanlanmış işler gecikebilir; bu bir gerçek zaman garantisi değildir. Uzak servis hatasında önceki veri korunur ve fiyatın asıl tarihi değişmez. Siteyi dal kökünden manuel yayınlamak mümkündür ancak zamanlanmış güncellemeler için GitHub Actions yayını gerekir.

Yerelde ücretsiz marka verisini yenilemek için npm run prices:sync çalıştırın. Sayfa açıkken fiyat dosyası 5 dakikada bir kontrol edilir. İl ve marka bazlı karşılaştırma Döviz.com ve Shell verilerini kullanır. Tek istasyonun pompa fiyatı garantisi yoktur. Ayrıntılar: [Fiyat verileri](docs/PRICES.md).

sw.js ve manifest kökte kalır. Kaynak dosyası değiştiğinde CACHE sürümünü artırın ve önbellek listesini güncelleyin. Yeni worker eski sekmeler kapanana kadar bekleyebilir. Fiyat JSON'u network-first alınır; çevrimdışıyken eski kopyasının tarihi görünür.

## Beta kapsamı

- Araç ekleme/düzenleme, yakıt kaydı, Ana Sayfa araç kartı, özellikler paneli ve JSON yedekleme çalışır.
- Raporlar ve Araçlar sekmeleri pasiftir; bildirim paneli aktiftir.
- Fiyatlar Döviz.com il/marka tablolarını ve Shell resmî ilçe medyanlarını karşılaştırır. Bunlar istasyon bazlı kesin pompa fiyatı değildir; LPG kaynaktaysa gösterilir.
- Araç eklemenin 7. adımı (son yakıt alımı) atlanır. Vites son adımda isteğe bağlıdır.
- Elektrikli araç kaydı vardır; kWh tüketim hesabı yoktur.
- Katalog başlangıç listesidir; model/yıl/yakıt uyumluluğunu doğrulamaz.

## Veriler ve hesaplama

Veriler `depo-v1`, tanıtım durumu `depo-welcome-v1` anahtarlarında tutulur. Dosya düzenlemesi bu anahtarları değiştirmez. Tarayıcı verilerinin silinmesi kayıtları da kaldırır. Farklı alan adı veya yerel/yayın adresleri ayrı tarayıcı depolarıdır; geçişte JSON yedeğini indirip yeni adreste yükleyin.

İlk tam dolum başlangıçtır. Sonraki tam doluma kadar kısmi dolumlar dahil alınan litre ve tutarlar toplanır. Tamamlanan aralıkların toplam litresi / toplam mesafesi × 100 = L/100 km; aynı aralıkların toplam tutarı / mesafesi = TL/km. İlk dolum ve son tamamlanmamış aralık ortalamaya dahil edilmez. Toplam harcama ve litre tüm kayıtları kapsar.

Güncel kararlar: [AGENTS.md](AGENTS.md), [ürün](docs/PRODUCT.md), [tasarım](docs/DESIGN.md). Logo kaynakları: [marka dosyaları](docs/BRAND_ASSETS.md).

## Hızlı dolum

Alt menüde + ile açılır. Yakıt seçilir; tutar ve litre fiyatından litre hesaplanır. Güncel kilometre ve tam dolum durumu ile kayıt eklenir. Aynı kilometrede farklı yakıtlar ayrı kaydedilebilir. Yakıt türü ve fiyat yedekte korunur. Farklı yakıt türleri tek depo hesabında birleştirilmez.

Konuma göre en yakın istasyon fiyatını otomatik doldurmak için bir istasyon/fiyat API bağlantısı gerekiyor; mevcut sürümde bağlı değil. İlk dolumda fiyat elle girilir; sonraki dolumlarda aynı araç ve yakıtın son fiyatı tarihiyle önerilir. Son fiyat güncel fiyat garantisi değildir. Konum izni otomatik istenmez, konum dış servislere gönderilmez.

Fiyat kaynağı Döviz.com il/marka tabloları ve Shell resmî fiyat servisidir. scripts/sync-prices.mjs 81 il için İstanbul yakalarını ayırarak 82 tabloyu ve Shell API’sini alır; tarayıcı yalnız yerel assets/data/brand-prices.json dosyasını okur. Döviz.com satır tarihleri korunur. Shell’de yayın tarihi yoktur; kontrol tarihi gösterilir ve ilçe fiyatlarının il/yaka medyanı açıkça belirtilir. Eksik fiyat tahminle doldurulmaz. 24 saatten eski gözlemler ve 10 günden eski Döviz.com tarihleri karşılaştırmaya alınmaz. Hatalı yenilemede eski satırın tarihi korunur. Fiyatlar istasyon pompa fiyatı garantisi değildir. Mevcut 6 saatlik kaynak kontrolü ve 5 dakikalık tarayıcı yenilemesi korunur.

Beta adresi: https://ereaxe.github.io/depo/
Kaynak deposu: https://github.com/EReaXe/depo

Fiyatlar ekranında ana markalar Petrol Ofisi, Opet, Shell, TotalEnergies, Aytemiz, Lukoil ve Alpet'tir. GO, Kadoil, Sunpet ve M Oil kapalı başlayan “Diğer markalar” bölümünde yer alır. Diğer markalar listelenmez; en düşük fiyat seçimi ve fiyat vurgusu yalnızca 7 ana marka arasında yapılır. Diğer markalar bölümünde fiyat vurgusu bulunmaz. Gerçek logolar assets/brands/fuel altında yerel ve çevrimdışı yüklenir.
LPG kapsamı: Döviz.com il/marka tabloları ve Shell resmî servisi. Kaynakta fiyat bulunmadığında — gösterilir.

Son açık sekme bu tarayıcıda depo-last-screen anahtarıyla hatırlanır. Yenilemede veya uygulama yeniden açıldığında Ana Sayfa ya da Fiyatlar sekmesine dönülür; kayıt yoksa, değer geçersizse veya depolama kullanılamıyorsa Ana Sayfa açılır. Beta için pasif sekmeler geri yüklenmez.

Görünüm varsayılan olarak cihaz temasını izler. Ayarlar > Görünüm içinde Cihaz teması, Açık ve Koyu seçenekleri bulunur. Seçim depo-theme anahtarında bu tarayıcıda saklanır; Cihaz teması seçiliyken sistem değişiklikleri anında uygulanır. Tercih ilk çizimden önce uygulanarak ters tema parlaması önlenir. Depolama engelliyse tema o oturumda uygulanır ve saklanamadığı belirtilir.

Ayarlar > Yedekleme ve aktarım panelinde Yedek indir, Yedekten yükle ve Başka cihaza aktar bulunur. JSON yedekleri format/sürüm ve oluşturulma tarihi içerir; eski sürümsüz ve version:1 yedekleri desteklenir. Dosya veya QR bağlantısı önce tarih, araç ve dolum sayısıyla önizlenir. Yükleme mevcut verilerin yerini alır; onay kutusu ve açık yükleme eylemi olmadan veri yazılmaz. Önizlemeden mevcut yedek indirilebilir. Büyük yedekler JSON dosyasıyla aktarılır. QR/bağlantı bir anlık kopyadır, senkronizasyon değildir.

Ayarların en üstünde Uygulamayı yükle seçeneği her zaman görünür. Tarayıcı beforeinstallprompt olayını sağlıyorsa düğme doğrudan gerçek kurulum penceresini açar; destek yoksa cihaz/tarayıcıya uygun kurulum adımları gösterilir. iPhone/iPad için Safari > Paylaş > Ana Ekrana Ekle akışı anlatılır. Standalone görünümde veya doğrulanmış appinstalled olayı sonrasında seçenek Uygulama yüklü olarak pasiftir; iptal edilen istek kurulum başarısı sayılmaz.

Fiyatlar ekranının üstünde yalnızca güncel, süresi dolmamış zam/indirim beklentisi haberi varsa kaynak ve yayın tarihiyle bir alan görünür. Beklenti kesin fiyat gibi sunulmaz. Üstteki bildirim paneli beklenti haberlerini ve seçili ildeki gerçek fiyat değişikliklerini gösterir; yalnız kaynak kontrol tarihi değişince veya bir il ilk kez yüklenince bildirim oluşturulmaz. Okunmamış rozet, okundu durumu ve iki bildirim türünün tercihleri bu tarayıcıda saklanır. Bildirimler uygulama açık ve görünürken kontrol edilir; kapalı uygulamaya push gönderilmez.

Ayarlar > Veriler ve uygulama > Tüm verileri temizle, araç ve dolum sayılarını gösteren onay panelini açar. Önce yedek indirilebilir; onay kutusu ve kalıcı silme düğmesi olmadan veri silinmez. Başarılı işlem garajı boşaltıp Ana Sayfa’ya döner; saklama hatasında mevcut kayıtlar korunur. Tema, seçili il, tanıtım ve bildirim tercihleri ile indirilmiş yedekler korunur.

Araç özellikleri paneli, yerel kaynaklı teknik katalogda marka/model/yıl/yakıt ve varsa mevcut vites bilgisiyle eşleşen ortak alanları otomatik gösterir; ek motor/versiyon seçimi yoktur. Birden çok versiyonda farklı olan veya doğrulanmayan motor, kasa, depo ve şehir/yol bilgileri — kalır. Şehir/yol yalnız ayrı NEDC değerleri doğrulanırsa gösterilir; WLTP birleşik tüketim ayrı Fabrika birleşik satırıdır ve gerçek dolum hesabına katılmaz. Veriler cihazda eşleşir, araç kayıtlarına yazılmaz; eski araçlar ve yedek şeması korunur. Başlangıç kapsamı: Clio 2024/2025 için belgelenen yakıt/vitesler, Tiggo 7 ve Tiggo 8 2026 benzinli. Tüm katalog için teknik veri iddiası yoktur. Ayrıntılar docs/VEHICLE_SPECS.md.

Ana Sayfa’da araç kartının hemen altında yalnız geçerli zam/indirim beklentisi haberi olduğunda SON DAKİKA şeridi görünür. Mevcut NTV/TRT haber akışı, kaynak doğrulaması ve süre sonu kuralları kullanılır; kaynak ve özgün yayın tarihi gösterilir. Haber yokken veya süre dolunca alan gizlenir. Birden fazla geçerli haber aynı alanda listelenir; otomatik kayan/yanıp sönen metin yoktur. Beklenti kesin fiyat olarak sunulmaz.

Beklenti haberleri SON DAKİKA şeridinde, Fiyatlar beklenti alanında ve Bildirimlerde kaynaktan açıkça çıkarılabilen tutarı da gösterir. Zam/indirim miktarı TL/L olarak etiketlenir; kaynak beklenen litre fiyatını açıkça veriyorsa ayrı belirtilir. Mevcut il fiyatına zam eklenerek tahmini yeni fiyat üretilmez. RSS başlık/özetindeki geleceğe yönelik açık tutar cümleleri kullanılır; yakıt eşleşmesi belirsiz veya tutarlar çelişkiliyse gösterilmez. Tutar çıkarılamazsa “Tutar bilgisi alınamadı.” yazılır. Eski haber kayıtları geçerli kalır; aynı haber güncellenirse mevcut bildirim metni güncellenir, yeniden okunmamış bildirim oluşturulmaz.

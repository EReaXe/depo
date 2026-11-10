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
- Fiyatlar ekranı Turkpidya ücretsiz il/marka EPDK bildirimlerini gösterir. Bu değerleri tek tek istasyonların kesin pompa fiyatı gibi sunma.

## Gezinme ve beta kapsamı

- Alt menü sırası: **Ana Sayfa, Raporlar, +, Araçlar, Fiyatlar**.
- **Raporlar ve Araçlar beta için görünür fakat disabled** kalır; kullanıcı açılmasını istemeden etkinleştirme. Erişilebilir adlarında geliştirme durumu belirtilir.
- Ortadaki `+` yakıt ekler. Araç yoksa Ana Sayfa'daki araç ekleme eylemine yönlendirir.
- Üstte uygulama adı ortalanır. Soldaki menü Ayarlar panelini açar. Sağdaki bildirim simgesi görünür ancak beta için pasiftir; sahte bildirim sayısı gösterme.
- Ana Sayfa'da **“Ana Sayfa” başlığı ve logo altı ayırıcı çizgi bulunmaz**.
- Araç yoksa ortalanmış **“Garaja araç ekleyin”** metni ve çalışan araç ekleme düğmesi gösterilir.
- Araç varsa Ana Sayfa kart düzenindedir. İlk kart marka logosu/adı, model, plaka veya plaka ekleme bağlantısı, kilometre, ortalama tüketim ve maliyet içerir.
- Araç kartındaki ok doğrudan düzenlemeye gitmez: araç özellikleri panelini açar. Panelin sağ üstündeki kalem/**Düzenle** araç düzenlemesini açar. Plaka bağlantısı mevcut aracın 6. adımına gider.
- Araç özelliklerinde kaydedilmemiş motor, kasa tipi, depo hacmi ve şehir/yol tüketimi gibi bilgiler `—` gösterilir; modele bakarak tahmin edilmez.
- Ayarlardan araç ekleme, tanıtımı yeniden açma ve yedek işlemlerine erişilir. Kurulum destekleniyorsa yükleme düğmesi Ayarlarda sunulur.

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

- Ücretsiz, anahtarsız kaynak Turkpidya fuel-brands veri kümesidir: https://turkpidya.com/wp-json/turkpidya-data/v1/tools/datasets/fuel-brands. Kaynağı görünür ve tıklanabilir biçimde belirt; API belgesindeki atıf bağlantısını koru.
- Bunlar son 30 günlük il/marka EPDK bildirimleridir; tek istasyonun fiyatı, canlı pompa verisi veya fiyat garantisi değildir. İstanbul Anadolu/Avrupa ayrı satırlardır. Kocaeli ve Sakarya kaynak adları eşleştirilir. Kaynakta olmayan LPG — gösterilir.
- Kaynak kuruş değerlerini TL'ye çevir; her satırın bildirildiği tarihi koru. Veri kümesi eskidiyse en düşük seçimine katma. İl/yakıt medyanından %25'ten fazla sapan değerler kontrol etiketiyle gösterilir ve en düşük seçiminden çıkarılır; kaynak sayıları sessizce değiştirilmez.
- scripts/sync-prices.mjs veriyi assets/data/brand-prices.json içine alır. İş akışı 6 saatte bir kontrol edip Pages'e yayınlar; tarayıcı görünür Fiyatlar ekranında 5 dakikada bir yerel dosyayı kontrol eder. Ücretli servis/anahtar gerekmez.
- 81 il elle seçilebilir. GPS il sınırı poligonlarıyla cihazda eşleşir; kesin koordinatlar üçüncü tarafa gönderilmez. Seçili il depo-price-city anahtarında tutulur. Sınır verisinin kaynağı/lisansı docs/GEO_SOURCE.json ve docs/GEO_LICENSE.md içinde korunur.
- Son bilinen marka fiyatını Hızlı doluma en yakın istasyon fiyatı diye aktarma. Ayrıntılar docs/PRICES.md içindedir.
- Kullanıcı beta yayını için EReaXe/depo GitHub deposu ve GitHub Pages yayınını açıkça yetkilendirdi. Gelecek yayınlarda o anki kullanıcı kapsamını esas al.

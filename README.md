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

Yerelde ücretsiz marka verisini yenilemek için npm run prices:sync çalıştırın. Sayfa açıkken fiyat dosyası 5 dakikada bir kontrol edilir. İl ve marka bazlı karşılaştırma ücretsiz Turkpidya verisini kullanır. Tek istasyonun pompa fiyatı garantisi yoktur. Ayrıntılar: [Fiyat verileri](docs/PRICES.md).

sw.js ve manifest kökte kalır. Kaynak dosyası değiştiğinde CACHE sürümünü artırın ve önbellek listesini güncelleyin. Yeni worker eski sekmeler kapanana kadar bekleyebilir. Fiyat JSON'u network-first alınır; çevrimdışıyken eski kopyasının tarihi görünür.

## Beta kapsamı

- Araç ekleme/düzenleme, yakıt kaydı, Ana Sayfa araç kartı, özellikler paneli ve JSON yedekleme çalışır.
- Raporlar ve Araçlar sekmeleri ile bildirim simgesi pasiftir.
- Fiyatlar ücretsiz Turkpidya il/marka bildirimlerini karşılaştırır. Bunlar istasyon bazlı kesin pompa fiyatı değildir; LPG kaynaktaysa gösterilir.
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

Güncel fiyat sağlayıcısı Turkpidya: anahtarsız il/marka EPDK bildirimleri, 6 saatlik kaynak kontrolü, tarihli marka listesi. Eski ulusal tahmin modu kullanılmaz. Konum, yerel il poligonlarında eşleştirilir ve dış servise gönderilmez. Ayrıntılar docs/PRICES.md (belgeler klasöründen PRICES.md).

Beta adresi: https://ereaxe.github.io/depo/
Kaynak deposu: https://github.com/EReaXe/depo

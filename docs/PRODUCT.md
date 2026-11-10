# Depo · Güncel ürün kapsamı

Türkçe, mobil öncelikli yakıt takip PWA'sı; HTML/CSS/vanilla JS, GitHub Pages ve çevrimdışı kullanım. Sites kullanılmaz. Bağlayıcı geliştirme ve tasarım kuralları kökteki AGENTS.md içindedir.

Kullanıcı marka/model, yıl, yakıt türü, kilometre, isteğe bağlı plaka, renk ve isteğe bağlı vites bilgisiyle araç ekler. Son yakıt alımı olan 7. adım beta süresince atlanır. Katalog başlangıç listesidir ve elle model girişine izin verir.

Hızlı dolumda yakıt türü, ödenen TL, TL/L fiyatı ve güncel kilometre girilir; litre otomatik hesaplanır. Kayıt bugünün tarihi ve tam dolum seçeneğiyle saklanır. Tam dolum aralıklarından mesafeye göre ağırlıklı tüketim ve maliyet hesaplanır. Kısmi dolumlar desteklenir; eksik aralıklar sonuç üretmez. Elektrikli araçlar için kWh hesabı yoktur.

Ana Sayfa araçsızken garaja araç ekleme çağrısı, araç varken özet kartını gösterir. Kartın oku özellikler panelini, paneldeki Düzenle araç akışını açar. Tanıtım tamamlandığında Ana Sayfa'ya dönülür.

Alt menü Ana Sayfa, Raporlar, +, Araçlar, Fiyatlar sırasındadır. Raporlar/Araçlar ve bildirimler beta için pasiftir; istasyon fiyatı kaynağı henüz bağlı değildir. Sol menü Ayarları açar: araç ekleme, tanıtım, yedekleme ve tarayıcı destekliyorsa PWA kurulumu.

Kayıtlar cihazdaki localStorage alanındadır; hesap ve bulut senkronizasyonu yoktur. JSON yedekleme vardır. Kullanıcı verileri örnek verilerle karıştırılmaz ve eksik özellikler tahmin edilmez. Mevcut uygulama adı Depo; yeni isim henüz onaylanmamıştır.

Çift yakıtta LPG ve benzin ayrı kayıtlardır. Aynı kilometrede farklı yakıtlar kaydedilebilir. Farklı yakıt dolumları için birleşik tüketim/maliyet hesabı henüz yoktur; toplamlar korunur. Konuma en yakın istasyonun fiyatı için API bağlantısı henüz sağlanmadı; son kullanılan fiyat açık tarih etiketiyle önerilir veya kullanıcı elle girer.

Fiyatlar ekranında ücretsiz ulusal tahminler gerçek kaynaktan tarihleriyle gösterilir; eski veriler işaretlidir. 81 il seçimi ve konum isteği vardır; bu seçimler ulusal fiyatları şehir fiyatına dönüştürmez. İstasyon/marka fiyat tablosu veri bağlantısı gelene kadar önizlemedir. Pages iş akışı marka dosyasını 6 saatte bir kontrol eder.

Güncel fiyat sağlayıcısı Turkpidya: anahtarsız il/marka EPDK bildirimleri, 6 saatlik kaynak kontrolü, tarihli marka listesi. Eski ulusal tahmin modu kullanılmaz. Konum, yerel il poligonlarında eşleştirilir ve dış servise gönderilmez. Ayrıntılar docs/PRICES.md (belgeler klasöründen PRICES.md).

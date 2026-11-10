# Depo · Güncel tasarım sistemi

Tek görsel yön Apple iOS Human Interface Guidelines ve kullanıcının referanslarıdır. Eski yeşil/masaüstü tasarım güncel yön değildir. Ayrıntılı davranış ve bakım kuralları kökteki AGENTS.md içindedir.

## Temel değerler

- En fazla 480 px, ortalanmış mobil uygulama kabuğu; her ekranda tek sütun.
- Sistem fontu: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.
- Zemin #f2f2f7, yüzey #fff, metin #1c1c1e, ikincil #62626a, eylem #0066cc, çizgi #d9d9df.
- En az 44 px ana dokunma hedefleri, mobil form girdilerinde en az 16 px yazı.
- Safe-area boşlukları, görünür klavye odağı, semantik etiketler, metin sarma ve hareket/kontrast tercihleri.

## Ekranlar

Uygulama adı üstte ortalanır; sol menü Ayarları açar, sağ bildirim simgesi pasiftir. Ana Sayfa başlığı ve logo altında ayırıcı yoktur. Araçsız durumda ortada Garaja araç ekleyin metni ve düğme bulunur.

Ana Sayfa'nın ilk kartı kullanıcının açık mavi referansını izler: 22 px köşeler, gerçek marka logosu, marka/model, plaka bağlantısı, sağ ok ve üç ölçüm. Sağ ok özellikler panelini açar; düzenleme panel içindedir. Eklenmeyen teknik özellikler — gösterilir.

Alt gezinme sırası Ana Sayfa / Raporlar / + / Araçlar / Fiyatlar. Raporlar ve Araçlar görünür ancak disabled; + kayıt eylemidir. Devre dışı sekmeler ve sekme çubuğundaki eylem, kullanıcı tarafından istenen HIG istisnalarıdır. Web/PWA için yerel iOS veya yüzde yüz HIG uyumluluğu iddiası yoktur.

Kısa görevler alttan açılan panelde, çok adımlı araç akışı tam ekran sunulur. Bilgi panelinin sağ üstünde Düzenle vardır. Paneller birikmez; kapatma, Escape, arka plan ve tutamaç davranışları korunur. İçerik kayar, eylemler erişilebilir kalır.

Araç akışı 1–6 ve 8. adımları kullanır; 7. adım atlanır. Marka araması, markaya bağlı model ve manuel model, yıl, yakıt, kilometre, isteğe bağlı plaka, renk; son adımda isteğe bağlı vites ve özet. Geri dönüşte taslak korunur.

Tanıtım mevcut sisteme uyumlu tam ekran sunulur; arka plan inert olur. Başlayalım ve Şimdilik keşfet Ana Sayfa'ya döner. Ayarlardan tekrar açılır.

Rehber: https://developer.apple.com/design/human-interface-guidelines

Hızlı dolum kısa görev panelidir: Vazgeç / Hızlı dolum başlığı, araca uygun segmentli yakıt seçimi, ödenen tutar, litre fiyatı, güncel kilometre, otomatik litre özeti ve tam dolum seçeneği. Kaydet alt alanda sabit kalır; içerik kayar. Sayısal girişler Türkçe virgül ve nokta ondalığını destekler. Güncel fiyat yoksa açık bilgi, son kullanılan fiyat varsa tarih gösterilir.

Fiyatlar: yatay kaydırılabilir konum/il çipleri, açık mavi üç yakıtlı karşılaştırma kartı ve altında gruplanmış istasyon tablosu. Ücretsiz modda kart başlığı Ulusal referans / Türkiye olur; ≈ işareti, her yakıtın tarihi, eski tahmin etiketi ve kaynak bağlantısı gösterilir. Seçili yakıt mavi sınırla vurgulanır. Fiyatı olmayan istasyon satırları — ve önizleme açıklaması taşır. İl seçimi aramalı sheet, 81 il, dokunulabilir satırlardır.

Güncel fiyat sağlayıcısı Turkpidya: anahtarsız il/marka EPDK bildirimleri, 6 saatlik kaynak kontrolü, tarihli marka listesi. Eski ulusal tahmin modu kullanılmaz. Konum, yerel il poligonlarında eşleştirilir ve dış servise gönderilmez. Ayrıntılar docs/PRICES.md (belgeler klasöründen PRICES.md).

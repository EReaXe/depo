# Fiyat kaynakları

Fiyat kaynağı Döviz.com il/marka tabloları ve Shell resmî fiyat servisidir. scripts/sync-prices.mjs 81 il için İstanbul yakalarını ayırarak 82 tabloyu ve Shell API’sini alır; tarayıcı yalnız yerel assets/data/brand-prices.json dosyasını okur. Döviz.com satır tarihleri korunur. Shell’de yayın tarihi yoktur; kontrol tarihi gösterilir ve ilçe fiyatlarının il/yaka medyanı açıkça belirtilir. Eksik fiyat tahminle doldurulmaz. 24 saatten eski gözlemler ve 10 günden eski Döviz.com tarihleri karşılaştırmaya alınmaz. Hatalı yenilemede eski satırın tarihi korunur. Fiyatlar istasyon pompa fiyatı garantisi değildir. Mevcut 6 saatlik kaynak kontrolü ve 5 dakikalık tarayıcı yenilemesi korunur.

## Kaynaklar ve kapsam

- Döviz.com: https://www.doviz.com/akaryakit-fiyatlari — her ilin benzin, motorin, LPG tablosu; orijinal satır tarihi korunur. İstanbul Anadolu/Avrupa ayrı alınır. Kocaeli ve Sakarya mevcut yerel bölge kimliklerine eşlenir.
- Shell: https://pompafiyat.turkiyeshell.com/api/Public/prices — resmî ürün listesinde TRY olarak doğrulanan 37 (95 oktan benzin), 34 (motorin), 5 (LPG) kodları. İlçe fiyatlarının medyanı hesaplanır; İstanbul yakaları ayrı tutulur. Servis yayın tarihi sağlamadığı için yalnız kontrol tarihi sunulur. İlçe medyanı gerçek bir istasyon fiyatı değildir.

Ücretli API veya anahtar kullanılmaz. Kaynakların herkese açık olması sınırsız kullanım garantisi değildir; HTML yapısı, erişim ve koşullar değişebilir. Üç eşzamanlı istek sınırı vardır. Kaynak metinleri/scriptleri çalıştırılmaz; yalnız beklenen tablo ve ürün alanları okunur. Sütun veya ürün yapısı değişirse işlem reddedilir.

## Veri bütünlüğü

Eksik fiyatlar başka marka veya il ortalamasıyla doldurulmaz. %25 üzeri il/yakıt sapması işaretlenir; kaynak değeri değiştirilmez ve en düşük seçimine alınmaz. Gelecek tarihli, eski veya tahmini fiyatlar karşılaştırılmaz. Başarısız il yenilemesinde eski satırlar kendi kaynak ve tarihleriyle korunur. Tüm il istekleri başarısızsa veya toplam kapsam 70 bölgenin altındaysa dosya yazılmaz. Shell başarısızsa o ilde alınabilen Döviz.com Shell satırı kullanılır.

## Yenileme ve gizlilik

npm run prices:sync statik dosyayı günceller. Mevcut Pages iş akışı fiyat kaynağını en az 6 saat arayla kontrol eder; açık ve görünür Fiyatlar ekranı yerel dosyayı 5 dakikada bir kontrol eder. Bu değişiklik kendiliğinden GitHub’a gönderilmez veya yayınlanmaz.

GPS il sınırı poligonlarıyla cihazda eşleştirilir; kesin konum üçüncü tarafa gönderilmez. Kaynak/lisans: GEO_SOURCE.json ve GEO_LICENSE.md. 7 ana marka/4 diğer marka düzeni korunur; yalnız ana markalar en düşük karşılaştırmasına girer.

Eski Turkpidya ile PO/Aytemiz LPG dosyaları önbellek geçişi için okunabilir; yeni eşitleme bu kaynakları kullanmaz. Beklenti haberleri ve bildirimler ayrı akış olarak korunur.

Fiyatın yanında aynı il/yaka, marka, yakıt ve kaynaktaki son farklı fiyata göre artışta yeşil yukarı, düşüşte kırmızı aşağı ok gösterilir (kullanıcının açık renk tercihi). Okun erişilebilir açıklaması önceki fiyatı içerir. İlk gözlemde, kaynak değişince ve eski/geçersiz fiyatta ok yoktur. Fiyat sabit kaldığında son değişim yönü korunur; yenileme kendi başına ok oluşturmaz. Geçmiş veri kaynağın geçmiş servisi değildir; bundan sonraki eşitlemelerle birikir.

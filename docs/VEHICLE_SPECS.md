# Kaynaklı araç teknik bilgileri

Araç özellikleri paneli, yerel kaynaklı teknik katalogda marka/model/yıl/yakıt ve varsa mevcut vites bilgisiyle eşleşen ortak alanları otomatik gösterir; ek motor/versiyon seçimi yoktur. Birden çok versiyonda farklı olan veya doğrulanmayan motor, kasa, depo ve şehir/yol bilgileri — kalır. Şehir/yol yalnız ayrı NEDC değerleri doğrulanırsa gösterilir; WLTP birleşik tüketim ayrı Fabrika birleşik satırıdır ve gerçek dolum hesabına katılmaz. Veriler cihazda eşleşir, araç kayıtlarına yazılmaz; eski araçlar ve yedek şeması korunur. Başlangıç kapsamı: Clio 2024/2025 için belgelenen yakıt/vitesler, Tiggo 7 ve Tiggo 8 2026 benzinli. Tüm katalog için teknik veri iddiası yoktur. Ayrıntılar docs/VEHICLE_SPECS.md.

## Kaynak kapsamı

| Marka/model | Katalog yılı | Eşleşme kapsamı |
|---|---|---|
| Renault Clio | 2024 | 1.0 SCe/TCe benzin, manuel/otomatik; 1.6 E-Tech benzinli hibrit |
| Renault Clio | 2025 | 1.0 TCe benzin, manuel/otomatik |
| Chery Tiggo 7 | 2026 | 1.6 turbo benzin, 7DCT; 4x2/4x4 ortak alanları |
| Chery Tiggo 8 | 2026 | 1.6 turbo benzin, 7DCT |

Bunlar Türkiye pazarı broşürlerine ait sınırlı katalog eşleşmeleridir. Aynı adın farklı ülke, ithalat, üretim dönemi veya sonradan dönüşüm versiyonları için doğrulama garantisi değildir. Kapsam rastgele yıl aralığıyla genişletilmez. Benzin + LPG seçimi sonradan dönüşümü ayırt etmediği için fabrika LPG deposu otomatik atanmaz. Tiggo 7'de çekiş bilinmediğinden 51/57 L arasından seçim yapılmaz. Clio 2024 benzin manuelde SCe/TCe tüketimleri farklı olduğundan tüketim boş kalır. Kimo 2024 dizel hibrit kaydı başka Kimo sürümünün değerleriyle doldurulmaz.

## Belgeler

- Renault Clio 24.12.2024: https://cdn.group.renault.com/ren/tr/brochures/clio-bja-ph2/CLIO-E-TECH-TEKNIK-BROSUR-24122024.pdf.asset.pdf/ce1b9e7e4e.pdf
- Renault Clio 11.08.2025: https://cdn.group.renault.com/ren/tr/brochures/clio-bja-ph2/CLIO-E-TECH-TEKNIK-BROSUR-11082025.pdf.asset.pdf/e459ef4b8b.pdf
- Chery Tiggo 7 2026: https://chery.com.tr/wp-content/uploads/2026/06/T7-Katalog.pdf
- Chery Tiggo 8: https://chery.com.tr/wp-content/uploads/2025/12/chery-tiggo-8-katalog.pdf

Renault arşiv broşürlerinin indekslenmiş üretici metinleri kullanıldı. Doğrudan PDF bağlantıları 14.11.2026 kontrolünde HTTP 410 döndürüyor; panel bu belgeleri adlarıyla belirtip üreticinin güncel teknik sayfasına bağlantı verir. Güncel sayfa eski model yılının doğrulama belgesi olarak sunulmaz. Yerel katalog verisi çevrimdışı kullanılabilir; dış belge bağlantılarını açmak internet gerektirir. Katalog genişletilirken belge sürümü, model yılı, yakıt/vites kapsamı ve varsa test standardı doğrulanmalıdır.

## Gösterim ve veri saklama

Araç tipi, motor ve depo ayrı alanlarda; NEDC şehir içi/şehir dışı varsa L/100 km cinsinde gösterilir. Mevcut başlangıç belgeleri ayrı NEDC şehir/yol tüketimi sağlamadığından bu satır — kalır. WLTP düşük/yüksek hız fazları şehir/yola dönüştürülmez. Kaynağın WLTP birleşik aralığı tek sayıya indirgenmez. Eşleşen tüm versiyonlarda aynı olmayan değer gizlenir. Yeni model/yıl verisi eklemek katalog bakımı gerektirir; web sorgusuyla araç bilgileri dışarı gönderilmez.

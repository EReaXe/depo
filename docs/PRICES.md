# Ücretsiz fiyat kaynağı

Uygulama Turkpidya'nın anahtarsız ve ücretsiz API'sini kullanır:
https://turkpidya.com/wp-json/turkpidya-data/v1/tools/datasets/fuel-brands

Belge ve kullanım koşulları: https://turkpidya.com/developers/
Görünür atıf: https://turkpidya.com/en/tools?utm_source=api&utm_medium=credit&utm_campaign=tools

Bu veri son 30 günde markalar tarafından EPDK'ya bildirilmiş il bazlı fiyatları içerir. Markalar değişiklik olduğunda bildirim yapar. Dolayısıyla satır tarihi kaynak kontrol tarihinden eski olabilir. Kuruş cinsindeki değerler TL'ye çevrilir. İl ve marka bazlı bildirimler tek bir istasyonun garantili pompa fiyatı değildir. Kaynakta LPG yoksa boş gösterilir; başka yakıt fiyatından türetilmez.

İstanbul Anadolu ve Avrupa ayrı satırlardır. Kocaeli-İzmit ve Sakarya-Adapazarı il seçimiyle eşleştirilir. Veri kümesi tazeliği hem kaynağın freshness işareti hem kaynak fetched_at tarihi üzerinden kontrol edilir. 30 günden eski, gelecek tarihli, tahmini veya geçersiz kayıtlar en düşük seçimine girmez. İl/yakıt medyanından %25'ten fazla sapan değerler kontrol etiketiyle tutulur, en düşük seçiminden çıkarılır. Bu basit tutarlılık kontrolü doğruluk garantisi değildir; fiyatın asıl bildirim tarihi satırda gösterilir.

## Yenileme ve yayın

`npm run prices:sync` doğrulanmış veriyi assets/data/brand-prices.json içine alır. Başarısız istek veya eksik il kapsamı eski dosyayı silmez. Gizli anahtar veya ücretli servis gerekmez. Tarayıcı sadece bu dosyayı okur.

.github/workflows/pages.yml main/master push, manuel tetikleme ve 6 saatlik zamanlama ile veriyi yeniler, testleri çalıştırır ve statik dosyaları GitHub Pages'e dağıtır. GitHub Pages Source ayarı GitHub Actions olmalıdır. GitHub zamanlanmış görevleri gecikebilir. Güncelleme anlık pompa fiyatı garantisi vermez.

## Konum gizliliği

81 il elle seçilebilir. Konum izni kullanıcı tarafından verildikten sonra GPS koordinatları yerel il sınırı poligonlarıyla eşleştirilir. Kesin koordinatlar üçüncü tarafa gönderilmez veya localStorage'a yazılmaz. İl eşleşmezse manuel seçim sunulur. Kaynak/lisans bilgileri GEO_SOURCE.json ve GEO_LICENSE.md içindedir.

Eski UcuzYakıtBul ulusal tahmin dosyası kullanılmaz. Gerçek istasyon bazlı veri ileride farklı bir sağlayıcı gerektirebilir; statik uygulamaya API sırları konmaz.

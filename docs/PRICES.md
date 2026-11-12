# Ücretsiz fiyat kaynağı

Uygulama Turkpidya'nın anahtarsız ve ücretsiz API'sini kullanır:
https://turkpidya.com/wp-json/turkpidya-data/v1/tools/datasets/fuel-brands

Belge ve kullanım koşulları: https://turkpidya.com/developers/
Görünür atıf: https://turkpidya.com/en/tools?utm_source=api&utm_medium=credit&utm_campaign=tools

Bu veri son 30 günde markalar tarafından EPDK'ya bildirilmiş il bazlı fiyatları içerir. Markalar değişiklik olduğunda bildirim yapar. Dolayısıyla satır tarihi kaynak kontrol tarihinden eski olabilir. Kuruş cinsindeki değerler TL'ye çevrilir. İl ve marka bazlı bildirimler tek bir istasyonun garantili pompa fiyatı değildir. Turkpidya veri kümesinde bulunmayan LPG için Petrol Ofisi ve Aytemiz resmî il listeleri ek kaynak olarak kullanılır. Başka markanın fiyatından veya başka yakıttan fiyat türetilmez.

İstanbul Anadolu ve Avrupa ayrı satırlardır. Kocaeli-İzmit ve Sakarya-Adapazarı il seçimiyle eşleştirilir. Veri kümesi tazeliği hem kaynağın freshness işareti hem kaynak fetched_at tarihi üzerinden kontrol edilir. 30 günden eski, gelecek tarihli, tahmini veya geçersiz kayıtlar en düşük seçimine girmez. İl/yakıt medyanından %25'ten fazla sapan değerler kontrol etiketiyle tutulur, en düşük seçiminden çıkarılır. Bu basit tutarlılık kontrolü doğruluk garantisi değildir; fiyatın asıl bildirim tarihi satırda gösterilir.

## Yenileme ve yayın

`npm run prices:sync` doğrulanmış veriyi assets/data/brand-prices.json içine alır. Başarısız istek veya eksik il kapsamı eski dosyayı silmez. Gizli anahtar veya ücretli servis gerekmez. Tarayıcı sadece bu dosyayı okur.

.github/workflows/pages.yml main/master push, manuel tetikleme ve yaklaşık 30 dakikalık zamanlama ile haberleri yeniler. Fiyatlar son yayın dosyası üzerinden en az altı saatlik aralıkla yenilenir; tüm kontrollerden sonra statik dosyalar GitHub Pages'e dağıtılır. GitHub Pages Source ayarı GitHub Actions olmalıdır. GitHub zamanlanmış görevleri gecikebilir. Güncelleme anlık pompa fiyatı garantisi vermez.

## Konum gizliliği

81 il elle seçilebilir. Konum izni kullanıcı tarafından verildikten sonra GPS koordinatları yerel il sınırı poligonlarıyla eşleştirilir. Kesin koordinatlar üçüncü tarafa gönderilmez veya localStorage'a yazılmaz. İl eşleşmezse manuel seçim sunulur. Kaynak/lisans bilgileri GEO_SOURCE.json ve GEO_LICENSE.md içindedir.

Eski UcuzYakıtBul ulusal tahmin dosyası kullanılmaz. Gerçek istasyon bazlı veri ileride farklı bir sağlayıcı gerektirebilir; statik uygulamaya API sırları konmaz.

## Seçili markalar ve LPG

Fiyatlar ekranında ana markalar Petrol Ofisi, Opet, Shell, TotalEnergies, Aytemiz, Lukoil ve Alpet'tir. GO, Kadoil, Sunpet ve M Oil kapalı başlayan “Diğer markalar” bölümünde yer alır. Diğer markalar listelenmez; en düşük fiyat seçimi ve fiyat vurgusu yalnızca 7 ana marka arasında yapılır. Diğer markalar bölümünde fiyat vurgusu bulunmaz. Gerçek logolar assets/brands/fuel altında yerel ve çevrimdışı yüklenir.

LPG listeleri resmî kaynaklardan alınır:

- https://www.petrolofisi.com.tr/akaryakit-fiyatlari — KDV dahil PO/gaz sütunu. Geçerlilik tarihi verilmediği için yalnız “Kontrol” tarihi gösterilir.
- https://www.aytemiz.com.tr/akaryakit-fiyatlari/lpg-fiyatlari — KDV dahil tavsiye edilen il listesi ve sayfanın bildirdiği geçerlilik tarihi.

Her kaynak kendi marka/il satırına bağlanır; İstanbul yakaları ayrı korunur. Bunlar tek istasyonun kesin pompa fiyatı değildir. LPG fiyatları aynı brand-prices.json dosyasının lpgReports alanında, kaynak adresi ve özgün gözlem tarihiyle saklanır. Yenileme mevcut 6 saatlik iş akışına dahildir; tarayıcı üçüncü taraf sitelere istek göndermez. LPG kaynağı hatasında önceki rapor ve tarihi korunur; 24 saatten eski gözlemler en düşük seçimine girmez. Sayfa yapısı veya kapsam değişirse hatalı sütun alınmaz. Diğer markaların LPG hücreleri doğrulanmış veri olmadığı sürece — kalır. Kontrol tarihi fiyatın değiştiği tarih diye sunulmaz.

## Beklenti ve bildirim kontrolü

scripts/sync-market-data.mjs planlı çalışmada son yayın dosyalarını geri alır; fiyat kontrolü altı saat dolduğunda scripts/sync-prices.mjs çalışır. Haberler scripts/sync-fuel-news.mjs ile her planlı çalışmada kontrol edilir. Haber akışının ayrıntıları ve süre kuralları docs/NOTIFICATIONS.md içindedir.

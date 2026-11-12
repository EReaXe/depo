# Beklenti haberleri ve uygulama içi bildirimler

Kapsam uygulama açık ve görünürken çalışan bildirimlerdir. Telefonun sistem bildirim izni istenmez; Push API veya abonelik sunucusu yoktur. Uygulama kapalıyken bildirim gönderilmez.

## Beklenti kaynağı

- NTV Ekonomi: https://www.ntv.com.tr/ekonomi.rss
- TRT Haber Ekonomi: https://www.trthaber.com/ekonomi_articles.rss

Bu akışların kapsadığı haberler izlenir; internetteki tüm beklenti haberlerini kapsama veya gerçek zaman garantisi verilmez. Haber akışında konu bulunmaması, piyasada kesinlikle beklenti bulunmadığı anlamına gelmez. Kaynakta tutar başlığa yazılmamışsa uygulama tutar tahmin etmez. Haber içeriği fiyat hesaplamalarına veya Hızlı dolum fiyatına aktarılmaz.

`scripts/sync-fuel-news.mjs` yayın tarihi bulunan, yakıt ile zam/indirim ve gelecek beklentisi anlatan başlıkları seçer. Soru başlıkları, geçmişte gerçekleşmiş değişiklikler, iptal başlıkları ve 72 saatten eski haberler beklenti olarak alınmaz. Aynı bağlantıda iptal bildirimi görülürse önceki kayıt kaldırılır. Yalnız kısa başlık, kaynak, bağlantı, yakıt ve tarihler saklanır; haber metni yayımlanmaz.

Haber metnindeki açık Türkçe tarih, “yarın”, “bu gece” veya desteklenen haftanın günü ifadesi Türkiye saatine göre geçerlilik sonunu belirler. Birden fazla tarih varsa eski bir beklenti taşımamak için en erken tarih esas alınır. Güvenilir geçerlilik tarihi bulunamazsa haber en fazla 12 saat ve yayınlandığı günün sonuna kadar tutulur. Hiçbir haber yayın tarihinden 72 saat sonrasına taşınmaz. Yayın veya kaynak kontrol tarihi yenilenerek eski haber güncel gibi gösterilmez. Kaynak hatasında yalnız süresi dolmamış eski kayıtlar korunur.

Fiyatlar üst alanı yalnız geçerli haber varsa görünür. Her haberin kaynağı tıklanabilir ve yayın tarihi görünürdür. “Beklentidir; kesinleşmiş pompa fiyatı değildir” açıklaması bulunur. Aynı yakıtın birden fazla haberi varsa en yeni haber önceliklidir.

## Yenileme

Pages iş akışı yaklaşık 30 dakikada bir çalışacak şekilde planlanmıştır. GitHub planlı işleri gecikebilir. `sync-market-data.mjs` önce son yayımlanan haber ve fiyat dosyalarını alır; böylece her Git checkout'u eski Git kopyasını yeniden yayımlamaz. Fiyat kaynağı altı saat dolduğunda yenilenir; haber kontrolü her çalışmada yapılır. Push ve elle çalıştırma fiyatları da yeniler.

Tarayıcı yalnız yerel `fuel-news.json` ve `brand-prices.json` dosyalarını beş dakikada bir, görünürken kontrol eder. Bildirim panelinde elle yenileme vardır. Süresi dolan üst alan zamanlayıcıyla ve görünürlük değişiminde kaldırılır. Tarayıcıdan haber sitelerine veya bir bildirim hizmetine veri gönderilmez; haber kaynakları yayın sırasında alınır. Kullanıcı kaynak bağlantısını açarsa ilgili siteye normal gezinme gerçekleşir.

## Fiyat değişikliği ve geçmiş

Seçili ilde uygulamada gösterilen 11 markanın geçerli fiyatları önceki kontrolle karşılaştırılır. İlk yükleme yalnız karşılaştırma başlangıcıdır. Aynı tutarın yeniden indirilmesi, yalnız bildirim/kontrol tarihinin değişmesi, daha eski dosyanın gelmesi veya ilk kez fiyatı görülen bir satır yeni değişiklik bildirimi üretmez. Tutar değişirse tek bildirimde ilgili yakıtlar ve marka sayısı belirtilir. İstasyonun kesin pompa fiyatı iddia edilmez. Kullanılan veri kaynakları bildirimde bağlantıyla gösterilir.

`depo-notifications-v1` anahtarı geçmişi, okundu durumunu, görülen haber kimliklerini, il bazlı fiyat karşılaştırmalarını ve tercihleri saklar. Araç/yakıt kayıtları ve JSON yedekleriyle karıştırılmaz. Geçmiş en fazla 50 kayıt ve 30 gün tutulur. Panel açılınca kayıtlar okundu sayılır. Beklenti ve fiyat bildirimleri ayrı kapatılabilir; kapalıyken görülen eski olaylar sonradan topluca bildirilmez. Tercihler üstteki haber alanını değil, yeni bildirim oluşmasını kontrol eder.

Saklama hatası geçmişin kaydedilemediği bilgisiyle panelde belirtilir; araç/yakıt verileri silinmez veya değiştirilmez. Örnek bildirim sayısı kullanılmaz.

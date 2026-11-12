# Depo · Güncel ürün kapsamı

Türkçe, mobil öncelikli yakıt takip PWA'sı; HTML/CSS/vanilla JS, GitHub Pages ve çevrimdışı kullanım. Sites kullanılmaz. Bağlayıcı geliştirme ve tasarım kuralları kökteki AGENTS.md içindedir.

Kullanıcı marka/model, yıl, yakıt türü, kilometre, isteğe bağlı plaka, renk ve isteğe bağlı vites bilgisiyle araç ekler. Son yakıt alımı olan 7. adım beta süresince atlanır. Katalog başlangıç listesidir ve elle model girişine izin verir.

Hızlı dolumda yakıt türü, ödenen TL, TL/L fiyatı ve güncel kilometre girilir; litre otomatik hesaplanır. Kayıt bugünün tarihi ve tam dolum seçeneğiyle saklanır. Tam dolum aralıklarından mesafeye göre ağırlıklı tüketim ve maliyet hesaplanır. Kısmi dolumlar desteklenir; eksik aralıklar sonuç üretmez. Elektrikli araçlar için kWh hesabı yoktur.

Ana Sayfa araçsızken garaja araç ekleme çağrısı, araç varken özet kartını gösterir. Kartın oku özellikler panelini, paneldeki Düzenle araç akışını açar. Tanıtım tamamlandığında Ana Sayfa'ya dönülür.

Alt menü Ana Sayfa, Raporlar, +, Araçlar, Fiyatlar sırasındadır. Raporlar/Araçlar beta için pasiftir; uygulama içi bildirimler aktiftir; istasyon fiyatı kaynağı henüz bağlı değildir. Sol menü Ayarları açar: araç ekleme, tanıtım, yedekleme ve PWA kurulumu veya cihaza uygun kurulum rehberi.

Kayıtlar cihazdaki localStorage alanındadır; hesap ve bulut senkronizasyonu yoktur. JSON yedekleme vardır. Kullanıcı verileri örnek verilerle karıştırılmaz ve eksik özellikler tahmin edilmez. Mevcut uygulama adı Depo; yeni isim henüz onaylanmamıştır.

Çift yakıtta LPG ve benzin ayrı kayıtlardır. Aynı kilometrede farklı yakıtlar kaydedilebilir. Farklı yakıt dolumları için birleşik tüketim/maliyet hesabı henüz yoktur; toplamlar korunur. Konuma en yakın istasyonun fiyatı için API bağlantısı henüz sağlanmadı; son kullanılan fiyat açık tarih etiketiyle önerilir veya kullanıcı elle girer.


Güncel fiyat sağlayıcısı Turkpidya: anahtarsız il/marka EPDK bildirimleri, 6 saatlik kaynak kontrolü, tarihli marka listesi. Eski ulusal tahmin modu kullanılmaz. Konum, yerel il poligonlarında eşleştirilir ve dış servise gönderilmez. Ayrıntılar docs/PRICES.md (belgeler klasöründen PRICES.md).


Fiyatlar ekranında ana markalar Petrol Ofisi, Opet, Shell, TotalEnergies, Aytemiz, Lukoil ve Alpet'tir. GO, Kadoil, Sunpet ve M Oil kapalı başlayan “Diğer markalar” bölümünde yer alır. Diğer markalar listelenmez; en düşük fiyat seçimi ve fiyat vurgusu yalnızca 7 ana marka arasında yapılır. Diğer markalar bölümünde fiyat vurgusu bulunmaz. Gerçek logolar assets/brands/fuel altında yerel ve çevrimdışı yüklenir.

Son açık sekme bu tarayıcıda depo-last-screen anahtarıyla hatırlanır. Yenilemede veya uygulama yeniden açıldığında Ana Sayfa ya da Fiyatlar sekmesine dönülür; kayıt yoksa, değer geçersizse veya depolama kullanılamıyorsa Ana Sayfa açılır. Beta için pasif sekmeler geri yüklenmez.

Alttan açılan Ayarlar, araç özellikleri, tüketim açıklaması, Hızlı dolum ve il seçimi panelleri ortak tutamaçtan sürüklenir. Panel hareketi parmağı takip eder; yukarı sürükleme genişletir, aşağı sürükleme geniş paneli küçültür veya kapatır. İçerik kaydırması ayrıdır; tutamaç klavyeyle de kullanılabilir. Kaydedilmemiş dolum uyarısı sürükleyerek kapatmada da korunur.

Görünüm varsayılan olarak cihaz temasını izler. Ayarlar > Görünüm içinde Cihaz teması, Açık ve Koyu seçenekleri bulunur. Seçim depo-theme anahtarında bu tarayıcıda saklanır; Cihaz teması seçiliyken sistem değişiklikleri anında uygulanır. Tercih ilk çizimden önce uygulanarak ters tema parlaması önlenir. Depolama engelliyse tema o oturumda uygulanır ve saklanamadığı belirtilir.

Ayarlar > Yedekleme ve aktarım panelinde Yedek indir, Yedekten yükle ve Başka cihaza aktar bulunur. JSON yedekleri format/sürüm ve oluşturulma tarihi içerir; eski sürümsüz ve version:1 yedekleri desteklenir. Dosya veya QR bağlantısı önce tarih, araç ve dolum sayısıyla önizlenir. Yükleme mevcut verilerin yerini alır; onay kutusu ve açık yükleme eylemi olmadan veri yazılmaz. Önizlemeden mevcut yedek indirilebilir. Büyük yedekler JSON dosyasıyla aktarılır. QR/bağlantı bir anlık kopyadır, senkronizasyon değildir.

Ayarların en üstünde Uygulamayı yükle seçeneği her zaman görünür. Tarayıcı beforeinstallprompt olayını sağlıyorsa düğme doğrudan gerçek kurulum penceresini açar; destek yoksa cihaz/tarayıcıya uygun kurulum adımları gösterilir. iPhone/iPad için Safari > Paylaş > Ana Ekrana Ekle akışı anlatılır. Standalone görünümde veya doğrulanmış appinstalled olayı sonrasında seçenek Uygulama yüklü olarak pasiftir; iptal edilen istek kurulum başarısı sayılmaz.

Fiyatlar ekranının üstünde yalnızca güncel, süresi dolmamış zam/indirim beklentisi haberi varsa kaynak ve yayın tarihiyle bir alan görünür. Beklenti kesin fiyat gibi sunulmaz. Üstteki bildirim paneli beklenti haberlerini ve seçili ildeki gerçek fiyat değişikliklerini gösterir; yalnız kaynak kontrol tarihi değişince veya bir il ilk kez yüklenince bildirim oluşturulmaz. Okunmamış rozet, okundu durumu ve iki bildirim türünün tercihleri bu tarayıcıda saklanır. Bildirimler uygulama açık ve görünürken kontrol edilir; kapalı uygulamaya push gönderilmez.

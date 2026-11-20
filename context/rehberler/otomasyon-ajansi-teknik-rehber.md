# Otomasyon Ajansı -- Teknik Çözüm Rehberi

## Yapay zekâ asistanı ve farklı otomasyon projeleri için ana çalışma dosyası

Bu dosyanın amacı: Bir müşteri yeni bir otomasyon istediğinde, teknik
bilgisi sınırlı olsa bile projeyi anlayabilmek, müşteriye doğru soruları
sorabilmek, uygun araçları seçebilmek ve adım adım nasıl kurulacağını
öğrenmek.

Bu rehber bir teknoloji listesi değildir. Her projede önce ihtiyacı
anla, sonra en basit güvenilir çözümü seç. Gereksiz servis ekleme. Bir
aracın popüler olması onu her projede gerekli yapmaz.

------------------------------------------------------------------------

# 1. Bana nasıl cevap verilmesini istiyorum?

Bir otomasyon fikri veya müşteri talebi verdiğimde açıklamayı şu
formatta yap:

1.  **Müşteri ne istiyor?**\
    Teknik terim kullanmadan, günlük dille 2-4 cümlede açıkla.

2.  **Sistem nasıl çalışacak?**\
    Müşterinin yaptığı işlemden başlayarak sonuca kadar numaralı akış
    göster. Örneğin: Form doldurulur → webhook tetiklenir → backend
    veriyi işler → yapay zekâ karar/yanıt üretir → veritabanına
    kaydedilir → bildirim gider.

3.  **Hangi araçları kullanacağız?**\
    Her aracın görevini tek cümleyle açıkla. Zorunlu olanlarla isteğe
    bağlı olanları ayır. Kullanıcının zaten sahip olduğu araçları önce
    değerlendir.

4.  **Kurulum adımları neler?**\
    Sıfırdan başlayarak sırayla anlat. Her adımda nereye girileceğini,
    hangi hesabın gerektiğini, hangi bilgilerin alınacağını ve neyin
    test edileceğini söyle. Benim bilmediğim varsayılan ayarları varmış
    gibi davranma.

5.  **Müşterinin hesabı veya onayı gerekiyor mu?**\
    Meta, Google, Microsoft, WhatsApp, e-posta sağlayıcısı gibi üçüncü
    taraflarda hesap açılması, işletme doğrulaması, uygulama incelemesi,
    izin veya bekleme süresi varsa bunu en başta belirt. Müşterinin
    hesabı yoksa seçenekleri ve riskleri açıkla.

6.  **En kolay yol ve daha profesyonel yol nedir?**\
    Örneğin hızlı prototip için kolay yöntem; uzun vadeli, kurumsal ve
    ölçeklenebilir kullanım için daha sağlam yöntem. Aralarındaki
    maliyet, bakım, güvenilirlik ve platform kurallarını karşılaştır.

7.  **Maliyet ve devamlı bakım**\
    Sunucu, API kullanımı, mesaj başına ücret, lisans, alan adı,
    yedekleme ve bakım gibi maliyetleri ayrı ayrı belirt. Güncel fiyat
    bilinmiyorsa kesin rakam uydurma; kontrol edilmesi gerektiğini
    söyle.

8.  **Müşteriye teslim ve test**\
    Canlıya almadan önce hangi senaryoların denenmesi gerektiğini
    listele. Hata durumunda ne olacağını açıkla.

9.  **Müşteriye anlatacağım kısa açıklama**\
    Teknik olmayan, dürüst ve anlaşılır 3-5 cümlelik bir özet hazırla.

Yanıtlar Türkçe, sade ve adım adım olsun. Teknik terim geçtiğinde hemen
parantez içinde ne anlama geldiğini açıkla. Uzun seçenek listeleriyle
kafamı karıştırma; önce önerdiğin temel mimariyi anlat, sonra gerçekten
gerekli alternatifleri ekle.

Kod yazmak gerekiyorsa önce hangi dosyanın ve bileşenin ne yapacağını
açıkla. Ben istemeden büyük kod blokları verme. Bilmediğim bir hesabın
açılmış veya onaylanmış olduğunu varsayma.

------------------------------------------------------------------------

# 2. Ajans için genel otomasyon altyapısı

Birçok farklı müşteri projesinde tekrar kullanılabilecek temel yapı:

``` text
Müşteri / Kullanıcı
       |
Kanal veya Tetikleyici
(WhatsApp, web formu, e-posta, dosya, takvim vb.)
       |
Webhook / Backend
       |
İş kuralları ve yapay zekâ (gerekiyorsa)
       |
Veritabanı
       |
Aksiyonlar
(e-posta, WhatsApp, CRM, rapor, görev, dosya vb.)
       |
Yönetim Paneli ve Loglar
```

## Temel bileşenler

  -----------------------------------------------------------------------
  Bileşen                 Ne işe yarar?           Kullanılabilecek
                                                  araçlar
  ----------------------- ----------------------- -----------------------
  Sunucu                  Uygulamayı 7/24         Hostinger VPS, Oracle
                          çalıştırır              Cloud veya başka VPS

  Sunucu yönetimi         Uygulamaları dağıtır ve Coolify
                          yönetir                 

  Backend                 Gelen istekleri işler,  Node.js, Python,
                          sistemin mantığını      FastAPI
                          yürütür                 

  Veritabanı              Müşteri ve işlem        PostgreSQL, Supabase
                          kayıtlarını saklar      

  Yönetim paneli          Müşterinin sistemi      Next.js
                          kullanmasını sağlar     

  Yapay zekâ              Metin anlar, yanıt      OpenAI modelleri,
                          üretir, araç çağırır    Anthropic Claude

  Dosya işleme            Excel, CSV ve PDF       XLSX kütüphaneleri, PDF
                          okur/yazar              araçları

  Bildirim                Ekibe bilgi gönderir    E-posta, Telegram Bot
                                                  API, WhatsApp

  Zamanlanmış işler       Belirli saatte veya     Coolify Scheduled Tasks
                          aralıkla görev          / cron
                          çalıştırır              

  Hata takibi             Hataları ve işlemleri   Uygulama logları,
                          kaydeder                Sentry gibi araçlar

  Dosya depolama          Belgeleri ve ekleri     S3 uyumlu depolama veya
                          saklar                  uygun dosya servisi
  -----------------------------------------------------------------------

**Önemli:** Her projede bu araçların hepsini kullanmak gerekmez. Örneğin
sadece bir web formundan e-posta gönderilecekse yapay zekâ, WhatsApp,
ayrı panel veya karmaşık veritabanı gerekmeyebilir.

## Sunucu tercihi

-   **Hostinger VPS + Coolify:** Yönetimi görece kolay, sabit aylık
    sunucu maliyeti olan bir seçenek. Kaynakları ve yedeklemeyi takip
    et.
-   **Oracle Cloud + Coolify:** Uygun ücretsiz/deneme kaynakları
    bulunabilir; ancak uygunluk, kapasite, hesap doğrulaması ve kaynak
    sürekliliği koşullarını kontrol et. Ücretsiz kaynakları ticari
    sistemin garantili altyapısı gibi varsayma.
-   **Coolify:** Sunucunun kendisi değildir. VPS üzerine kurulan,
    uygulamaları dağıtmayı, ortam değişkenlerini, alan adlarını, SSL'i
    ve zamanlanmış işleri yönetmeyi kolaylaştıran araçtır.

Canlı müşteri sisteminde tek sunucu kullanılıyorsa o sunucunun arızası
tüm hizmeti durdurabilir. Düzenli veritabanı yedeği, yedekten geri dönme
testi, izleme ve güvenlik güncellemeleri planlanmalıdır.

------------------------------------------------------------------------

# 3. Örnek proje: 7/24 WhatsApp AI müşteri ve satış asistanı

## Müşterinin istediği

Firma WhatsApp'tan gelen soruların günün her saatinde yanıtlanmasını
ister. Asistan ürün ve hizmet bilgisi verir, potansiyel müşterinin
bilgilerini toplar, satış ekibine devreder ve görüşmeleri raporlar.

Bu sadece chatbot değildir. Doğru geliştirildiğinde müşteri taleplerini
kaydeden ve satış sürecini takip etmeye yardımcı olan bir sistemdir.

## Önerilen temel mimari

``` text
Müşteri
  |
WhatsApp
  |
WhatsApp bağlantı katmanı
(Evolution API veya Meta Cloud API)
  |
Webhook
  |
Node.js Backend
  |
OpenAI modeli (ör. GPT-4o mini veya güncel uygun model)
  |
İş kuralları ve araçlar
  |-------------------------|
  |                         |
PostgreSQL              Temsilciye devir
  |                         |
Özel yönetim paneli      WhatsApp / panel bildirimi
  |
Excel içe/dışa aktarma
```

Model seçimi projeye göre yapılır. Claude zorunlu değildir. OpenAI'nin
uygun maliyetli modelleri de müşteri sorularını yanıtlama, bilgi toplama
ve araç çağırma görevlerini yapabilir. Modelin gerçek başarısı firmanın
verileriyle test edilmelidir.

## Kullanılacak araçlar

  -----------------------------------------------------------------------
  Görev                   İlk tercih / seçenek    Açıklama
  ----------------------- ----------------------- -----------------------
  WhatsApp                Evolution API veya Meta Mesajları almak ve
                          WhatsApp Cloud API      göndermek

  Backend                 Node.js                 Mesaj akışını ve
                                                  kuralları yönetmek

  AI                      OpenAI API              Müşteri mesajını
                                                  anlamak ve yanıt
                                                  oluşturmak

  Veritabanı              PostgreSQL              Müşteri, mesaj, talep
                                                  ve ürün kayıtları

  Panel                   Next.js                 Firma çalışanlarının
                                                  sistemi yönetmesi

  Sunucu                  VPS + Coolify           Uygulamaları 7/24
                                                  çalıştırmak

  Excel                   XLSX/CSV içe ve dışa    Firma dosyalarını içeri
                          aktarma                 almak ve rapor indirmek

  Bildirim                Panel içi bildirim /    Ekibe yeni talep haber
                          e-posta / Telegram      vermek; ihtiyaca göre
  -----------------------------------------------------------------------

İlk sürümde Chatwoot, Microsoft Graph, Resend, Telegram ve ayrı bir
otomasyon platformu zorunlu değildir. Sadece ihtiyaç varsa eklenir.

## WhatsApp bağlantısı: Evolution mı, Meta Cloud API mı?

Bu karar müşterinin hesabına, kullanım amacına ve risk toleransına göre
verilmelidir.

### Seçenek A -- Evolution API ve WhatsApp Web bağlantısı (Baileys)

Evolution API, kendi sunucunda çalıştırabileceğin bir WhatsApp
entegrasyon katmanıdır. Baileys tabanlı bağlantıda genellikle QR kod
okutularak WhatsApp hesabı bağlanır. Webhook ile gelen mesajlar
backend'e aktarılır.

**Avantajları** - Prototip hazırlamak ve denemek hızlı olabilir. -
Müşteri Meta Business Manager ve Cloud API kurulumunu bilmiyorsa ilk
teknik bağlantı daha kolay olabilir. - Kendi sunucunda
barındırılabilir. - Webhook ile kendi paneline bağlanabilir.

**Riskleri** - Bu yöntem resmî WhatsApp Business Platform API'si
değildir; WhatsApp Web oturumuna dayanır. - Oturum düşmesi, yeniden QR
okutma, bağlantı kopması veya WhatsApp tarafındaki değişiklikler
olabilir. - Kullanım koşulları ve hesap kısıtlaması riski vardır. Ticari
müşterinin ana numarasını riske atmadan önce bu risk açıkça
anlatılmalıdır. - 7/24 hizmet için bağlantı sağlığı, yeniden bağlanma ve
mesaj kuyruğu yönetimi gerekir.

**Ne zaman düşünülür?** İç test, demo veya müşteri riskleri anlayıp
kabul ettiğinde sınırlı bir pilot. Kritik müşteri hattında otomatik
olarak güvenli/garantili çözüm gibi sunulmaz.

### Seçenek B -- Evolution API üzerinden resmî WhatsApp Cloud API

Evolution API bazı kurulumlarda Meta'nın resmî WhatsApp Cloud API
bağlantısını da yönetebilir. Burada WhatsApp mesajlaşması Meta'nın resmî
platformundan geçer; Evolution uygulama katmanı olarak kullanılabilir.

**Avantajları** - Resmî WhatsApp Business Platform altyapısını
kullanır. - Ticari kullanım ve mesaj şablonları gibi Meta kuralları
çerçevesinde ilerler. - Kendi backend ve panelinle entegre edilebilir.

**Dezavantajları** - Meta Business hesabı, WhatsApp Business hesabı,
telefon numarası ve gerekli izin/kurulum adımları gerekir. - İşletme
doğrulaması veya numara/hesap incelemesi gerekebilir. - Müşterinin
hesabı ve erişimleri hazır değilse süreç uzayabilir. - Meta'nın
mesajlaşma ve ücretlendirme kurallarına uymak gerekir.

### Seçenek C -- Meta Cloud API'ye doğrudan bağlanmak

Evolution kullanmadan backend'in Meta Graph API ve webhook'larıyla
doğrudan konuşur.

Bu, aradaki bir entegrasyon katmanını kaldırır; ancak webhook, token,
imza doğrulama, mesaj gönderme, hata yönetimi ve API değişikliklerini
sen geliştirip yönetirsin.

### Müşteriye nasıl karar verdirilir?

İlk görüşmede şu soruları sor: 1. Şu anda WhatsApp Business uygulaması
kullanıyor musunuz? 2. Kullanılacak mevcut bir telefon numarası var mı?
3. Bu numara müşterilerle aktif olarak kullanılıyor mu? 4. Numaranın
aynı anda telefondaki WhatsApp uygulamasında da çalışması gerekiyor mu?
5. Resmî Meta Business hesabınız ve gerekli işletme bilgileriniz hazır
mı? 6. Hesap kurulum/doğrulama süreci için zaman ayırabilir misiniz? 7.
Ana müşteri hattında bağlantı kesintisi riskini kabul edebilir misiniz?

Müşterinin Meta hesabı yoksa bunu saklama. İki yolu anlat: Resmî Cloud
API kurulumu için müşteriye hesap açma ve doğrulama adımlarında
rehberlik etmek; veya riskleri açıkça belirtilmiş, resmî olmayan
QR/WhatsApp Web tabanlı pilot seçeneğini değerlendirmek. Müşterinin
haberi olmadan ana numarasını resmî olmayan bağlantıya taşıma.

**Önemli:** Evolution API kullanmak Meta kurulumunu her zaman ortadan
kaldırmaz. Baileys/QR yöntemi ile resmî Cloud API farklı bağlantı
yöntemleridir. Ayrıca WhatsApp uygulamasının aynı numarayla kullanılmaya
devam etmesi (coexistence) her kurulumda otomatik olarak mümkün
değildir; desteklenen kayıt yöntemi, ülke, hesap ve sağlayıcı koşulları
doğrulanmalıdır.

## AI asistanı nasıl çalışır?

Firmadan onaylı bilgiler alınır: - Ürün ve hizmet açıklamaları - Güncel
fiyatlar - Stok veya teslimat bilgileri - İade ve garanti şartları -
Çalışma saatleri - Sık sorulan sorular - Satış ekibine ne zaman
aktarılacağı

İlk sürümde bilgi miktarı az ve düzenliyse ürünler PostgreSQL'de
tutulabilir ve AI ihtiyacı olan kayıtları backend araçlarıyla
sorgulayabilir.

Örnek araçlar: - `search_products`: Ürün bilgisi arar. - `create_lead`:
Potansiyel müşteri kaydı oluşturur. - `handoff_to_human`: Görüşmeyi
temsilciye devreder. - `get_business_hours`: Çalışma saatlerini getirir.

Modelin müşteriye kendi kendine fiyat veya stok uydurmasına izin
verilmez. Fiyat/stok gibi kritik bilgiler doğrudan veritabanından
alınır. Bilgi yoksa asistan bunu söyler veya temsilciye aktarır.

### RAG ne zaman gerekir?

RAG (Retrieval-Augmented Generation), AI'ın büyük doküman arşivinden
ilgili parçaları bulup yanıt oluşturmasına yarayan yöntemdir.

Başlangıçta şart değildir: - Az sayıda ürün - Kısa SSS - Birkaç basit
doküman

RAG'i düşün: - Çok sayıda PDF ve doküman varsa - Bilgiler sık
değişiyorsa - Ürün kataloğu büyükse - Kullanıcının sorusu farklı
belgelerdeki bilgileri birleştirmeyi gerektiriyorsa

Vektör veritabanı da ilk günden şart değildir. Önce PostgreSQL araması
veya basit filtreleme yeterli mi test et. Gerekirse PostgreSQL +
pgvector gibi bir seçenek değerlendir.

## Excel'i nasıl yönetiriz?

Microsoft Graph API zorunlu değildir.

Bu örnekte önerilen yol:

1.  Firma mevcut Excel veya CSV dosyasını panelden yükler.
2.  Sistem dosyayı okur ve önizleme gösterir.
3.  Sütunlar eşleştirilir: ürün adı, fiyat, stok, telefon, müşteri adı
    vb.
4.  Hatalı veya eksik satırlar kullanıcıya gösterilir.
5.  Onaydan sonra kayıtlar PostgreSQL'e aktarılır.
6.  Bundan sonraki müşteri ve satış kayıtları doğrudan veritabanına
    yazılır.
7.  Firma panelden istediği zaman Excel/CSV raporu indirir.

**Ana kayıt kaynağı veritabanıdır; Excel yalnızca içe/dışa aktarma
aracıdır.**

Microsoft Graph API ne zaman gerekir? - Firma Excel dosyasının
OneDrive/SharePoint üzerinde canlı kalmasını istiyorsa - Birden fazla
çalışan aynı Microsoft dosyasıyla çalışıyorsa - Değişikliklerin otomatik
olarak iki yönlü senkronize olması gerekiyorsa - Firmanın mevcut
Microsoft 365 süreçleriyle entegre olunacaksa

Bu durumda Graph API veya uygun bir entegrasyon aracı
değerlendirilebilir. Composio gibi servisler entegrasyonu
kolaylaştırabilir; ancak ek maliyet, izinler, bağlantı yönetimi ve veri
erişimi incelenmelidir.

## İnsan temsilciye devir

Panelde her konuşmanın bir durumu olsun: - AI aktif - Temsilci
bekleniyor - Temsilci devraldı - Görüşme tamamlandı

Temsilci devraldığında AI otomatik yanıt göndermeyi durdurmalıdır.
Temsilci işi bitirdiğinde AI tekrar etkinleştirilebilir.

İlk sürümde temsilciye panel içi bildirim veya e-posta göndermek yeterli
olabilir. Ekip aynı WhatsApp konuşmasını panelden yönetmek istiyorsa
hazır bir ortak gelen kutusu (ör. Chatwoot) veya kendi panelinde
mesajlaşma arayüzü geliştirmek gerekir.

**Chatwoot nedir?** Birden fazla çalışanın aynı kanallardan gelen
müşteri konuşmalarını gördüğü, atadığı ve yanıtladığı hazır müşteri
destek panelidir. Kullanmak zorunlu değildir. Kendi panelinde aynı
özellikleri geliştirmek mümkün; ancak mesaj atama, kullanıcı rolleri,
gerçek zamanlı güncelleme ve konuşma geçmişi gibi işlerin bakımını da
sen üstlenirsin.

## 24 saat WhatsApp mesajlaşma penceresi

WhatsApp Business Platform'da müşteri işletmeye mesaj gönderdiğinde
müşteri hizmetleri penceresi açılır. Genel kural olarak son kullanıcı
mesajından itibaren 24 saat içinde serbest biçimli yanıt verilebilir.
Pencere dışında işletmenin başlatacağı mesajlar için uygun, onaylı
şablon mesaj gerekir.

Örnek şablon kullanımları: - Teklif takibi - Randevu hatırlatması -
Sipariş güncellemesi

Bu kuralı teklif ve sistem tasarımında hesaba kat. Resmî olmayan
WhatsApp Web bağlantısının davranışını Cloud API kurallarıyla aynı
varsayma; kullanılan yöntemin güncel şartlarını ayrıca kontrol et.

## Canlıya çıkmadan önce testler

-   Aynı mesaj webhook'a iki kez gelirse iki kez kayıt/yanıt oluşuyor
    mu?
-   WhatsApp bağlantısı koparsa sistem bunu fark ediyor mu?
-   AI bilinmeyen fiyat veya stok uyduruyor mu?
-   Müşteri temsilci isterse AI duruyor mu?
-   Temsilci devralınca bot tekrar araya giriyor mu?
-   Veritabanına kayıt başarısız olursa mesaj kayboluyor mu?
-   Sunucu yeniden başlarsa sistem kaldığı yerden çalışıyor mu?
-   Yedekten veritabanı geri yüklenebiliyor mu?
-   Mesaj gönderme hatası olursa kontrollü tekrar deneniyor mu?
-   Müşterinin kişisel verileri yalnızca yetkili kişilerce görülebiliyor
    mu?
-   24 saat penceresi ve şablon mesaj senaryosu test edildi mi?

------------------------------------------------------------------------

# 4. Diğer otomasyon türleri için tekrar kullanılabilir çözüm kalıpları

Aşağıdaki örnekler müşteri talebine göre uyarlanır. Hepsinde AI
kullanmak zorunlu değildir.

## A. Web sitesinden gelen müşteri taleplerini otomatik yönetme

**İstek:** Web sitesindeki form doldurulunca müşteriye cevap gitsin ve
firma bilgilendirilsin.

Akış: 1. Müşteri formu doldurur. 2. Backend form verisini alır. 3.
PostgreSQL'e kaydeder. 4. Müşteriye otomatik e-posta gönderir. 5. Satış
ekibine bildirim gönderir. 6. Panelde talep görünür.

Araçlar: Web formu, Next.js veya mevcut site, Node.js backend,
PostgreSQL, e-posta sağlayıcısı. AI yalnızca mesajı sınıflandırmak veya
yanıt taslağı oluşturmak gerekiyorsa eklenir.

## B. Gelen e-postaları sınıflandırma ve cevap taslağı hazırlama

**İstek:** Gelen e-postalar konusuna göre ayrılsın, önemli olanlar
ilgili kişiye atansın.

Akış: 1. E-posta sağlayıcısından yeni mesaj alınır. 2. Backend mesajı
kaydeder. 3. AI mesajı sınıflandırır: satış, destek, fatura, spam vb. 4.
İlgili kişiye görev/bildirim oluşturulur. 5. Gerekirse cevap taslağı
hazırlanır. 6. İnsan onayından sonra cevap gönderilir.

Araçlar: Gmail/Outlook API veya uygun entegrasyon, backend, veritabanı,
AI. İlk aşamada otomatik gönderim yerine insan onayı tercih edilebilir.

## C. Fatura ve belge işleme

**İstek:** Gelen faturalar okunsun, bilgiler tabloya kaydedilsin.

Akış: 1. PDF veya fotoğraf alınır. 2. Dosya güvenli depolamaya
kaydedilir. 3. OCR/belge okuma ile metin çıkarılır. 4. Tutar, tarih,
firma ve fatura numarası gibi alanlar ayrıştırılır. 5. Kontroller
yapılır. 6. İnsan onayından sonra muhasebe sistemine aktarılır.

Araçlar: Dosya yükleme, OCR veya belge işleme servisi, backend,
PostgreSQL, panel. Finansal kayıtlar doğrulama olmadan otomatik
kesinleştirilmemelidir.

## D. Randevu ve takvim otomasyonu

**İstek:** Müşteri uygun saat seçsin, randevu oluşturulsun ve hatırlatma
gönderilsin.

Akış: 1. Müşteri formdan veya sohbetten talep oluşturur. 2. Takvim
uygunluğu kontrol edilir. 3. Müşteri saat seçer. 4. Takvim etkinliği
oluşturulur. 5. Onay ve hatırlatma gönderilir. 6. İptal/değişiklik
takvime işlenir.

Araçlar: Google Calendar veya Microsoft Calendar API, backend,
veritabanı, WhatsApp/e-posta. Takvim çakışması ve saat dilimi özellikle
test edilir.

## E. Sosyal medya içerik hazırlama ve onay akışı

**İstek:** İçerikler hazırlansın, yönetici onaylasın, sonra planlı
yayınlansın.

Akış: 1. Konu veya içerik takvimi alınır. 2. AI taslak oluşturur. 3.
Görsel/video gerekiyorsa uygun üretim aracı kullanılır. 4. İçerik
panelde onaya sunulur. 5. Onaylanan içerik platformun izin verdiği resmî
API ile planlanır/yayınlanır. 6. Yayın sonucu kaydedilir.

Araçlar: AI API, dosya depolama, panel, veritabanı, ilgili sosyal
platform API'leri. Her platformun yayın izinleri ve hesap türü şartları
önceden kontrol edilir. Platform kurallarını aşan otomasyon vaat
edilmez.

## F. Web araştırması ve potansiyel müşteri listesi oluşturma

**İstek:** Belirli sektördeki işletmeler bulunsun, uygun şirketler
listelensin.

Akış: 1. Hedef sektör, bölge ve şirket ölçütleri belirlenir. 2. İzin
verilen kaynaklardan şirket bilgileri toplanır. 3. Tekrarlı kayıtlar
temizlenir. 4. Bilgiler doğrulanır ve kaynağıyla kaydedilir. 5. Panelde
liste oluşturulur. 6. İletişim ve pazarlama için geçerli yasal
dayanak/kurallar kontrol edilir.

Araçlar: Resmî API'ler, lisanslı veri sağlayıcılar veya izin verilen web
kaynakları, backend, PostgreSQL, panel. Kişisel e-posta ve telefonların
toplanması/kullanılması için GDPR, ePrivacy ve ilgili ülke kuralları
ayrıca değerlendirilir. Herkese açık olması veriyi sınırsız kullanma
izni vermez.

## G. WhatsApp üzerinden sipariş veya talep takibi

**İstek:** Müşteri sipariş numarasını yazınca durumunu öğrensin.

Akış: 1. WhatsApp mesajı alınır. 2. Müşteri doğrulanır. 3. Backend
sipariş sisteminden bilgiyi alır. 4. AI veya sabit şablonla anlaşılır
cevap hazırlanır. 5. Yanıt WhatsApp'tan gönderilir. 6. İşlem loglanır.

Araçlar: WhatsApp bağlantısı, backend, firmanın sipariş sistemi/API'si,
veritabanı. Sipariş bilgisi modelin tahminine bırakılmaz; gerçek
sistemden sorgulanır.

------------------------------------------------------------------------

# 5. Müşteri görüşmesinde sorulacak temel sorular

Her otomasyon projesinden önce şu konuları netleştir:

## İş ihtiyacı

-   Şu anda bu işi nasıl yapıyorsunuz?
-   En çok zaman alan veya hata çıkaran bölüm hangisi?
-   Sistem tam olarak hangi işlemi otomatik yapmalı?
-   Hangi durumlarda insan müdahalesi gerekli?

## Mevcut hesaplar ve sistemler

-   Hangi yazılımları kullanıyorsunuz?
-   WhatsApp Business, Microsoft 365, Google Workspace veya CRM
    hesabınız var mı?
-   Hesapların yöneticisi kim?
-   API erişimi veya entegrasyon izni verebilir misiniz?
-   Hesap doğrulaması gerekiyorsa bunu kim tamamlayacak?

## Veri

-   Hangi bilgiler kullanılacak?
-   Veriler Excel, PDF, e-posta veya başka sistemde mi?
-   Verinin sahibi kim?
-   Hangi veriler kişisel veya gizli?
-   Veriler nerede saklanmalı ve ne kadar süre tutulmalı?

## Kullanıcılar ve yetki

-   Sistemi kaç çalışan kullanacak?
-   Her çalışan tüm müşterileri görebilecek mi?
-   Yönetici ve çalışan yetkileri farklı mı?
-   İşlem geçmişi tutulmalı mı?

## Başarı ölçütü

-   Sistem hangi işi ne kadar azaltmalı?
-   Hangi hata kabul edilemez?
-   İnsan onayı gereken adımlar hangileri?
-   Proje hangi testler geçince tamamlanmış sayılacak?

------------------------------------------------------------------------

# 6. Müşteri hesapları, doğrulama ve bekleme süreleri

Bu konu teklif öncesinde mutlaka konuşulmalıdır. Bazı projeler kod
yazmaktan çok müşteri hesaplarının hazırlanması nedeniyle uzar.

Örnekler: - Meta Business ve WhatsApp Business Platform kurulumu -
Telefon numarasının uygunluğu ve doğrulanması - Meta işletme doğrulaması
veya uygulama izinleri - Google/Microsoft API izinleri ve yönetici
onayı - E-posta alan adı doğrulaması - Ödeme sağlayıcısı hesap
incelemesi - Sosyal medya API erişim izinleri

Her proje için şu tabloyu hazırla:

  -----------------------------------------------------------------------
  Gereken şey       Müşteride hazır   Kim yapacak?      Tahmini bekleme
                    mı?                                 
  ----------------- ----------------- ----------------- -----------------
  İşletme hesabı    Kontrol et        Müşteri + ajans   Sağlayıcıya bağlı
                                      rehberliği        

  Telefon/alan adı  Kontrol et        Müşteri           Sağlayıcıya bağlı
  doğrulaması                                           

  API erişim izni   Kontrol et        Müşteri           Sağlayıcıya bağlı
                                      yöneticisi        

  Test verisi       Kontrol et        Müşteri           Müşteriye bağlı
  -----------------------------------------------------------------------

Kesin süre garantisi verme. Hesap incelemesi ve onay süresinin üçüncü
tarafın kontrolünde olduğunu sözleşmede belirt. Müşterinin şifresini
istemek yerine güvenli yetkilendirme veya müşterinin kendi ekranından
işlem yapması tercih edilir.

------------------------------------------------------------------------

# 7. Güvenlik, gizlilik ve ticari teslimat

Canlı müşteri sistemi geliştirirken:

-   Her müşterinin verisini diğer müşterilerden ayır (tenant
    izolasyonu).
-   API anahtarlarını kodun içine yazma; ortam değişkenlerinde sakla.
-   Webhook imzasını ve istek kaynağını doğrula.
-   Tekrarlanan webhook mesajlarının çift kayıt oluşturmasını engelle
    (idempotency).
-   Kullanıcı rolleri ve erişim kontrolleri oluştur.
-   Veritabanı yedeklerini düzenli al ve geri yüklemeyi test et.
-   Kişisel verileri gereğinden uzun saklama.
-   Loglarda şifre, token ve gereksiz kişisel veri tutma.
-   Müşteriye veri işleme, saklama, silme ve erişim süreçlerini açıkla.
-   GDPR/KVKK ve gerekiyorsa ePrivacy/iletişim kurallarını proje ve ülke
    bazında değerlendir.
-   Üçüncü taraf AI ve bulut servislerinin veri işleme şartlarını
    kontrol et.

Almanya ve AB müşterilerinde GDPR; Türkiye müşterilerinde KVKK ve ilgili
iletişim mevzuatı değerlendirilmelidir. Sunucunun Almanya'da olması tek
başına bütün hukuki sorumlulukları ortadan kaldırmaz. Gerekli sözleşme
ve hukuki değerlendirme için uzman desteği alınmalıdır.

------------------------------------------------------------------------

# 8. Proje teslim modeli

Her müşteriye aynı temel süreç uygulanabilir:

1.  **Keşif:** İhtiyaç, mevcut sistemler, hesaplar ve veriler öğrenilir.
2.  **Teknik plan:** En basit güvenilir mimari çizilir.
3.  **Hesap hazırlığı:** Müşterinin sahip olması gereken hesaplar ve
    izinler tamamlanır.
4.  **Prototip:** Önce temel senaryo çalışır hale getirilir.
5.  **Test:** Normal, hatalı ve istisnai senaryolar denenir.
6.  **Canlıya geçiş:** İzleme, yedekleme ve hata bildirimi açılır.
7.  **Eğitim:** Müşteriye panelin kullanımı anlatılır.
8.  **Bakım:** Güncelleme, hata takibi, yedek ve API değişiklikleri
    yönetilir.

## Teklifte ayrı gösterilecek kalemler

-   İlk kurulum ve geliştirme
-   Üçüncü taraf hesap/abonelik ücretleri
-   Sunucu ve altyapı giderleri
-   AI ve mesajlaşma API kullanım ücretleri
-   Aylık bakım ve destek
-   Yeni özellik veya kapsam dışı değişiklikler

Müşterinin kendi hesabı üzerinden ödemesi gereken servisleri mümkünse
müşterinin adına aç. Ajansın verdiği hizmet bedeliyle üçüncü taraf
kullanım ücretlerini birbirine karıştırma.

------------------------------------------------------------------------

# 9. Her yeni müşteri talebinde kullanılacak ana talimat

Yeni bir otomasyon fikri verdiğimde bu dosyadaki yaklaşımı uygula.

Bana önce talebi sade Türkçeyle anlat. Sonra önerdiğin en basit
güvenilir sistemi çiz. Kullanacağımız araçları ve her birinin görevini
açıkla. Müşterinin açması gereken hesapları, doğrulama ve bekleme
ihtimallerini en başta söyle. Resmî API ile QR/oturum tabanlı veya
üçüncü taraf entegrasyon seçeneklerini birbirine karıştırma; güvenlik,
kullanım koşulları ve kesinti risklerini dürüstçe açıkla.

Benim için yalnızca teorik mimari verme. Sıfırdan nasıl kuracağımı,
hangi servise gireceğimi, hangi bilgileri müşteriden isteyeceğimi, hangi
bileşeni önce geliştireceğimi ve nasıl test edeceğimi adım adım anlat.

Gereksiz araç ekleme. Excel yerine veritabanı yeterliyse bunu söyle.
Chatwoot gerekmiyorsa ekleme. Telegram veya e-posta gerekmiyorsa ekleme.
AI gerekmiyorsa AI kullanma. Cron görevi Coolify ile yapılabiliyorsa
ayrı servis önermeden önce bunu değerlendir.

Birden fazla yol varsa önce önerdiğin yolu açıkla; diğer yolu yalnızca
gerçek bir avantajı varsa karşılaştır. Maliyetleri ve riskleri saklama.
Bilinmeyen veya güncel olması gereken konularda kontrol etmeden kesin
konuşma.

Amacım her müşteri talebini anlayabileceğim, müşteriye doğru soruları
sorabileceğim ve projeyi adım adım kendim kurabilecek seviyede öğrenmek.

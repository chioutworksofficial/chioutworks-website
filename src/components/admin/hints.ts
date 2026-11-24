import { AlertTriangle, BarChart3, BellRing, Briefcase, Calendar, CalendarDays, ClipboardList, FileText, FolderKanban, Inbox, KeyRound, LayoutDashboard, Mail, Megaphone, Mic, PhoneCall, Radar, Server, Sparkles, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import type { Tab } from '../../pages/Admin';

/** Per-tab help (owner, 2026-11-24): what it is for, when to look, what to try. Turkish only. */
export interface Hint { what: string; when: string; tips: string[] }
export type GroupId = 'gen' | 'in' | 'biz' | 'plan' | 'mkt' | 'sys';

export const GROUP_ID: Record<string, GroupId> = {
  Genel: 'gen', Gelenler: 'in', 'Satış ve işler': 'biz', Planlama: 'plan', Pazarlama: 'mkt', 'Site ve sistem': 'sys',
};

export const HINTS: Record<Tab, Hint> = {
  overview: { what: 'Bütün alanların özeti ve bugün yapılacaklar.', when: 'Her sabah', tips: ['"Bugün ne yapmalıyım?" kutusundaki ilk maddeden başlayın.', 'Alan kartlarından istediğiniz bölüme geçin.'] },
  leads: { what: 'Bülten, site kontrolü, sesli asistan, sohbet ve formlardan gelen tüm kişiler; aynı e-posta veya telefon tek kayıtta birleşir.', when: 'Her sabah ve yeni aday gelince', tips: ['Bir adaya tıklayıp durum ve not girin.', 'Aranmasını istemediğiniz kişiyi "aranmasın" olarak işaretleyin.', '"Anonim" sekmesi kişi bırakmayan görüşmelerin konu özetini gösterir.'] },
  requests: { what: 'Form, sohbet, hesaplayıcı ve paket sayfasından gelen yazılı talepler.', when: 'Yeni talep gelince (en geç gün sonunda)', tips: ['Okunmamış talepler rozetle görünür; açınca okundu olur.', 'Ayrıntıdan analiz formu veya teklif hazırlayabilirsiniz.', 'İşi biten talebi arşive alın.'] },
  voice: { what: 'Sesli asistanla ve yazılı sohbetle yapılan görüşmelerin kayıtları.', when: 'Haftada birkaç kez', tips: ['Bir görüşmeyi açıp asistanın ne söylediğini okuyun.', 'Kişi iletişim bıraktıysa görüşmeden talebe geçebilirsiniz.'] },
  intakes: { what: 'Müşterinin doldurduğu ayrıntılı analiz formu: sürecini, araçlarını ve hedeflerini anlatır.', when: 'Müşteri formu doldurunca', tips: ['Formu bir talebin ayrıntısından oluşturun.', 'Dolu formdan "Teklif hazırla" ile teklife geçin.'] },
  newsletter: { what: 'Aylık fikir e-postası: her abonenin kendi dilinde tek kısa fikir. Yalnızca çift onaylı aboneler alır.', when: 'Ayda bir (ay başında)', tips: ['"Bu ayın taslağını üret" ile yapay zekâ taslağını hazırlayın.', 'Metni okuyup düzeltin, sonra "Şimdi gönder".', 'Sorun varsa gönderimi ayarlardan duraklatın.'] },
  offers: { what: 'Teklif hazırlama, müşteriye gönderme, onay ve ödeme takibi. Planlama bölümünü müşteri görmez.', when: 'Teklif bekleyen müşteri olduğunda; müşteri mesajı gelince', tips: ['Teklif, analiz formundan veya talepten "Teklif hazırla" ile açılır.', 'Rozet müşterinin yeni mesajını veya onayını gösterir.', 'Durum çipinden taslak, gönderildi, onaylandı, ödendi aşamasını izleyin.'] },
  projects: { what: 'Ödemesi gelen işlerin proje sayfası: ilerleme, mesajlar, dosyalar ve test sitesi; müşteri bunları görür.', when: 'Her gün, aktif iş varken', tips: ['İlerlemeyi güncelleyince müşteri de görür.', 'Rozet müşteriden okunmamış mesaj var demektir.'] },
  sales: { what: 'Bir firmanın herkese açık sitesini tarar, A-E notu verir ve potansiyel müşteri listesi tutar.', when: 'Haftada bir, yeni müşteri ararken', tips: ['"Yeni analiz" ile bir alan adı tarayın; eksikler satış konuşmasının konusu olur.', 'Listeyi nota ve duruma göre filtreleyip sıralayın.', 'Makul sebep yoksa aramayın; yalnızca herkese açık veri okunur.'] },
  voiceAgent: { what: 'Telefonda arayan yapay zekâ asistanı (Vapi): ayarlar, arama kuyruğu, kayıtlar ve randevular.', when: 'Ayarlarken; sonra haftada bir', tips: ['Varsayılan mod "Simülasyon": gerçek arama yapılmaz, güvenle deneyebilirsiniz.', 'Anahtar ve ID\'leri girip "Test bağlantısı"na basın, sonra Canlı\'ya geçin.', 'Aramalar bittikten sonra özet ve randevu burada görünür.'] },
  calendar: { what: 'Dolu günler, kimliği belli adaylar için takip girdileri ve randevular.', when: 'Her sabah (bugünün takipleri)', tips: ['Dolu olduğunuz güne tıklayın; ziyaretçi o günü seçemez.', '"Takip girdileri" bugün kimi aramanız gerektiğini söyler.'] },
  appointments: { what: 'Randevu kayıtları (Takvim içinde).', when: 'Randevu günü', tips: ['Sunucudaki Voice Agent randevuları Voice Agent bölümündedir.'] },
  marketing: { what: 'Yapay zekâ taslakları: site denetimi, metin, SEO, e-posta dizisi, teklif ve sosyal plan.', when: 'Haftada bir veya yeni içerik gerekince', tips: ['Çıktı taslaktır; yayımlamadan önce okuyup düzeltin.', '"Geçmiş" listesinden önceki çıktılara dönün.'] },
  trend: { what: 'Son 30 günün trendleri (Reddit, Hacker News, Polymarket, GitHub): içerik fikri, görüşme hazırlığı, rakip izleme.', when: 'Pazartesi sabahı', tips: ['Bir konu yazıp arayın; özet ve içerik fikirleri çıkar.', 'Beğendiğiniz raporu kaydedin; "Kayıtlı raporlar"dan açın.', 'Yalnızca sizin içindir; sitede görünmez.'] },
  analytics: { what: 'Sitenin gerçek ziyaret verisi: ziyaretçiler, ülkeler, sayfalar, ortak sitelere tıklamalar. Çerezsiz, IP saklanmaz.', when: 'Haftada bir', tips: ['Tarih aralığını değiştirip önceki haftayla karşılaştırın.', 'En çok bakılan sayfa, ne anlattığınızın işe yaradığını gösterir.'] },
  errors: { what: 'Sunucu ve tarayıcı hataları (son 200, 30 gün) ve hata bildirim e-postası ayarı.', when: 'Haftada bir; bildirim gelince hemen', tips: ['Bildirim e-postanızı bir kez girin; hata olunca haber gelir.', 'Aynı hata sayaçla birleşir; sayısı hızla artıyorsa önce onu inceleyin.'] },
  providers: { what: 'Kullandığınız tüm hesap ve API\'ler: anahtar tanımlı mı, hangi paket, ne kadar ücret; maliyet kontrolü.', when: 'Ayda bir ve yenileme tarihi yaklaşınca', tips: ['Her kartta "Ücret bilgisini düzenle" ile paket, ücret ve yenileme tarihini girin.', 'ElevenLabs, Apify ve Resend için canlı kullanım okunur; diğerleri için "Faturalama sayfası"na gidin.', 'Anahtar değerleri burada görünmez; yalnızca son 4 karakter.'] },
};

export const WEEK: { day: string; text: string; tab: Tab }[] = [
  { day: 'Pazartesi', text: 'Trend Radar: haftanın içerik fikirleri', tab: 'trend' },
  { day: 'Salı', text: 'Satış ve site kontrolleri: yeni potansiyel müşteri', tab: 'sales' },
  { day: 'Çarşamba', text: 'Pazarlama araçları: bir metin veya sosyal plan', tab: 'marketing' },
  { day: 'Perşembe', text: 'Ziyaret analizi: hangi sayfa çalışıyor', tab: 'analytics' },
  { day: 'Cuma', text: 'Hatalar ve e-posta, sonra Müşteri adayları', tab: 'errors' },
];

export const TAB_ICON: Record<Tab, LucideIcon> = {
  overview: LayoutDashboard, leads: Users, requests: Inbox, voice: Mic, intakes: ClipboardList, newsletter: Mail, offers: FileText, projects: FolderKanban,
  sales: TrendingUp, voiceAgent: PhoneCall, calendar: Calendar, marketing: Megaphone, trend: Radar, analytics: BarChart3, errors: AlertTriangle, appointments: Calendar, providers: KeyRound,
};
export const GROUP_ICON: Record<GroupId, LucideIcon> = { gen: LayoutDashboard, in: BellRing, biz: Briefcase, plan: CalendarDays, mkt: Sparkles, sys: Server };

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Mail, Phone, MapPin, Menu, X, Bike, Car, ShieldCheck, Shield, Sparkles } from 'lucide-react';
import { referencesStore } from '@/lib/store/referencesStore';
import { blogStore } from '@/lib/store/blogStore';
import { ReferencesCarousel } from '@/components/landing/ReferencesCarousel';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';

const NAV = [
  { label: 'Biz Kimiz', href: '#hakkimizda' },
  { label: 'Hizmetlerimiz', href: '#hizmetlerimiz' },
  { label: 'Referanslarımız', href: '#referanslarimiz' },
  { label: 'Blog', href: '#blog' },
  { label: 'İletişim', href: '#iletisim' },
];

const STATS = [
  { target: 7000, suffix: '+', label: 'Kurye Çalışanı', color: 'primary' as const },
  { target: 7, suffix: 'M+', label: 'Aylık Dağıtım', useThousandsSeparator: false, color: 'accent' as const },
  { target: 30, suffix: '+', label: 'Bölge', useThousandsSeparator: false, color: 'primary' as const },
  { target: 5000, suffix: '+', label: 'Mutlu Müşteri', color: 'accent' as const },
];

const SERVICES = [
  {
    icon: Bike,
    title: 'Moto / Bisiklet Kurye',
    description: 'Acil ve kısa mesafe teslimatlar için hızlı çözüm.',
    points: ['Yoğun trafikte hızlı ilerleme', 'Belge ve küçük paketler için ideal', 'Uygun maliyet'],
  },
  {
    icon: Car,
    title: 'Araçlı Kurye',
    description: 'Büyük ve ağır paketlerin güvenli taşınması.',
    points: ['Büyük paketler için uygun', 'Güvenli taşıma', 'E-ticaret için ideal'],
  },
  {
    icon: Truck,
    title: 'Yaya / Ekspres Kurye',
    description: 'Şehir merkezinde kısa mesafe ve acil teslimat.',
    points: ['Kısa mesafe hızı', 'Çevre dostu seçenek', 'Şeffaf takip'],
  },
];

export default function HomePage() {
  const [references, setReferences] = useState(referencesStore.getAll());
  const [blogPosts, setBlogPosts] = useState(blogStore.getAll());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setReferences(referencesStore.getAll());
    setBlogPosts(blogStore.getAll());
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setStatsInView(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header - Paket Taxi tarzı: logo, menü, 2 CTA */}
      <header className="bg-white/95 backdrop-blur border-b sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="Pakethane Lojistik"
              className="h-14 sm:h-16 w-auto flex-shrink-0 object-contain"
            />
            <span className="text-lg font-bold text-gray-900 truncate sm:hidden">Pakethane</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate hidden sm:inline">Pakethane Lojistik</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/basvuru/kurye-hizmeti-al">
              <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Kurye Hizmeti Al
              </Button>
            </Link>
            <Link to="/basvuru/kurye-ol">
              <Button size="sm">Pakethane Kuryesi Ol</Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t px-4 py-4 flex flex-col gap-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-2 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link to="/basvuru/kurye-hizmeti-al" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-accent text-accent">Kurye Hizmeti Al</Button>
              </Link>
              <Link to="/basvuru/kurye-ol" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Pakethane Kuryesi Ol</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero - Web: slogan+CTA solda, resim sağda paralel | Mobil: önce CTA sonra resim */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Sol: Logo + Slogan + alt metin + CTA butonları (mobilde önce) */}
          <div className="order-1 lg:order-1 text-center lg:text-left">
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="Pakethane Lojistik"
              className="h-[12rem] sm:h-[14rem] lg:h-[15rem] w-auto object-contain mx-auto lg:mx-0 mb-4"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Pakethane geniş filomuzla sizlere hizmet etmeye geldik!
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-5">
              Güvenilir kurye hizmeti. Hizmet alın veya kurye ekibimize katılın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/basvuru/kurye-hizmeti-al" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  Kurye Hizmeti Al
                </Button>
              </Link>
              <Link to="/basvuru/kurye-ol" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Pakethane Kuryesi Ol
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Sorunsuz teslimat ile işlerinizi büyütün.
            </p>
          </div>
          {/* Sağ: Resim (mobilde altta) */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-end lg:items-start">
            <img
              src={`${import.meta.env.BASE_URL}hero-kurye.png`}
              alt="Pakethane kurye ekibi"
              className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Bizi Anlatan Rakamlar - görünür olduğunda sayılar yukarı sayar */}
      <section ref={statsRef} className="bg-white border-y py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 sm:mb-14 text-center">
            Bizi Anlatan Rakamlar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 ${
                    stat.color === 'primary' ? 'text-primary' : 'text-accent'
                  }`}
                >
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={1600}
                    useThousandsSeparator={stat.useThousandsSeparator ?? true}
                    start={statsInView}
                  />
                </div>
                <div className="text-base sm:text-lg text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hakkımızda / Biz Kimiz */}
      <section id="hakkimizda" className="py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
            Biz Kimiz?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-center leading-relaxed mb-12">
            İşletmelerin kurye ve dağıtım süreçlerini güvenle yönetebilmesi için modern ve sürdürülebilir çözümler üretiyoruz.
            E-ticaret gönderilerinden restoran siparişlerine kadar geniş bir yelpazede, hızlı, planlı ve teknoloji destekli lojistik hizmet sunuyoruz.
            Amacımız yalnızca paket taşımak değil; markanızın operasyonel gücünü artıran bir iş ortağı olmaktır.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-primary/20 transition">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kalite</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Geniş operasyon ağı, disiplinli çalışma sistemi ve güçlü teslimat kontrol altyapımız sayesinde süreçleri sorunsuz yönetiyoruz.
                Her gönderi planlı şekilde organize edilir, her teslimat takip edilir ve her iş ortaklığı uzun vadeli güven üzerine inşa edilir.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-primary/20 transition">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Güven</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ekibimize katılan her çalışan titiz değerlendirme süreçlerinden geçer.
                Kuryelerimiz düzenli olarak denetlenir, operasyonlar anlık olarak izlenir ve teslimatlar kontrol mekanizmalarıyla güvence altına alınır.
                Sizin için sadece hızlı değil, aynı zamanda güvenli teslimat sağlarız.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-primary/20 transition">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Yenilik</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Teknolojiyi operasyonun merkezine koyuyoruz.
                Gönderinizi taşıyan kuryeyi anlık takip edebilir, bölge bazlı performans verilerine ulaşabilir ve teslimat süreçlerini analiz edebilirsiniz.
                Elde ettiğiniz verilerle sadece lojistiği değil, satış ve operasyon stratejinizi de geliştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetlerimiz - 3 kart, madde işaretli (Moto / Araç / Yaya tarzı) */}
      <section id="hizmetlerimiz" className="bg-white border-y py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
            Hızlı ve Güvenilir Kurye Hizmeti
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Şehir içi ve şehirler arası teslimat, takip ve kurumsal çözümlerle ihtiyacınıza uygun hizmet.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} className="flex flex-col">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {s.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Referanslarımız - Kayan logolar */}
      <section id="referanslarimiz" className="py-12 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Referanslarımız
          </h2>
          <ReferencesCarousel references={references} />
        </div>
      </section>

      {/* Blog - admin panelden yönetilir */}
      <section id="blog" className="bg-white border-y py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 text-center">
            Blog
          </h2>
          {blogPosts.length === 0 ? (
            <p className="text-muted-foreground text-center">Yakında burada güncel içeriklerimiz yer alacak.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hemen Arayın - Telefon CTA (Paket Taxi benzeri) */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Hemen Şimdi Arayın, Hızlıca Teklif Alın
          </h2>
          <a
            href="tel:+908503360336"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide hover:underline inline-block mt-6"
          >
            0 850 XXX XX XX
          </a>
        </div>
      </section>

      {/* İletişim */}
      <section id="iletisim" className="py-16 sm:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            İletişim
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-start flex-wrap">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-5 w-5 flex-shrink-0" />
              <span>info@pakethane.com</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>0 850 XXX XX XX</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>Merkez ofis adresi</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Kurye olmak veya hizmet almak için başvuru formlarını kullanabilirsiniz.
          </p>
        </div>
      </section>

      {/* Footer - Çok sütunlu (Paket Taxi benzeri) */}
      <footer className="bg-gray-900 text-gray-400 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img
                  src={`${import.meta.env.BASE_URL}logo.webp`}
                  alt="Pakethane Lojistik"
                  className="h-12 w-auto object-contain brightness-0 invert opacity-90"
                />
                <span className="font-bold text-white">Pakethane Lojistik</span>
              </Link>
              <p className="text-sm">Yolda, işler yolunda. Kurye ve lojistik hizmeti.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Menü</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#hakkimizda" className="hover:text-white transition">Biz Kimiz</a></li>
                <li><Link to="/basvuru/kurye-hizmeti-al" className="hover:text-white transition">Kurye Hizmeti Al</Link></li>
                <li><Link to="/basvuru/kurye-ol" className="hover:text-white transition">Pakethane Kuryesi Ol</Link></li>
                <li><a href="#referanslarimiz" className="hover:text-white transition">Referanslarımız</a></li>
                <li><a href="#iletisim" className="hover:text-white transition">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">İletişim</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 flex-shrink-0" /> Merkez ofis adresi</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0" /> 0 850 XXX XX XX</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 flex-shrink-0" /> info@pakethane.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            © {new Date().getFullYear()} Pakethane Lojistik. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

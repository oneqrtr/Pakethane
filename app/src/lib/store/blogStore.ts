import type { BlogPost } from '@/types';

const STORAGE_KEY = 'pakethane_blog';

function generateId(): string {
  return `blog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function load(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(items: BlogPost[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const SEED_BLOG: Omit<BlogPost, 'id' | 'createdAt' | 'order'>[] = [
  {
    title: 'Kurye Hizmeti Nedir? Şirketler İçin Avantajları',
    excerpt: 'Kurye hizmeti, belge ve paketlerin zamanında, güvenli ve takip edilebilir şekilde teslim edilmesini sağlar. İşletmeler için neden vazgeçilmez?',
    content: 'Kurye hizmeti, özellikle e-ticaret ve kurumsal operasyonlarda zamanında teslimatın anahtarıdır. Müşteri memnuniyeti, stok maliyetlerinin düşürülmesi ve marka güveni için profesyonel kurye ağı şarttır.\n\nPakethane olarak şehir içi ve şehirler arası tüm teslimatlarınızda canlı takip, sigortalı gönderi ve raporlama sunuyoruz. Acil evrak, numune ve e-ticaret paketleriniz güvende.',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
  },
  {
    title: 'Antalya\'da Hızlı Kurye ve Teslimat Ağı',
    excerpt: 'Antalya ve ilçelerinde kesintisiz kurye hizmeti. Turizm ve ticaretin yoğun olduğu bölgede 7/24 teslimat imkânı.',
    content: 'Antalya, turizm ve ticaret hacmiyle kurye ve lojistik talebinin en yüksek olduğu illerimizden biridir. Oteller, restoranlar, e-ticaret satıcıları ve ofisler için zamanında teslimat kritik öneme sahiptir.\n\nPakethane Antalya ağında Kepez, Muratpaşa, Konyaaltı, Lara ve Kundu başta olmak üzere tüm ilçelere hızlı ve güvenilir teslimat yapıyoruz. Same-day ve express seçenekleriyle ihtiyacınıza uygun çözüm sunuyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
  },
  {
    title: 'Profesyonel Kurye Olmak: Gereksinimler ve Süreç',
    excerpt: 'Pakethane ailesine kurye olarak katılmak isteyenler için başvuru süreci, belgeler ve kazanç imkânları hakkında bilmeniz gerekenler.',
    content: 'Profesyonel kurye olmak için ehliyet (araçlı hizmet için), kimlik ve temel belgeler yeterlidir. Moto, bisiklet veya yaya kurye seçenekleriyle kendi programınıza uygun çalışma imkânı sunuyoruz.\n\nBaşvuru sonrası kısa sürede değerlendirme yapılır; onaylanan kuryelerimiz eğitim ve uygulama sürecine alınır. Düzenli ödeme ve performans primleri ile kuryelik gelir getiren bir kariyer seçeneğidir.',
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800',
  },
  {
    title: 'Antalya Serbest Bölge ve Lojistik Entegrasyonu',
    excerpt: 'Antalya Serbest Bölge ve liman bölgelerine yönelik kurye ve dağıtım çözümleri. İthalat-ihracat evrakları ve numune teslimatı.',
    content: 'Antalya Serbest Bölge ve çevresindeki firmalar için evrak, numune ve acil gönderi teslimatı sunuyoruz. Gümrük ve lojistik süreçlerinde zamanında belge ulaştırma, ihale ve ticaret için büyük önem taşır.\n\nBölgeye özel araç ve kurye planlaması ile teslimat sürelerini kısaltıyor, takip ve tesellüm belgeleriyle süreci şeffaf tutuyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800',
  },
  {
    title: 'Şehir İçi Kurye Türleri: Moto, Araç ve Yaya',
    excerpt: 'Kısa mesafe mi, ağır yük mü? İhtiyacınıza göre moto kurye, araçlı kurye veya yaya/ekspres kurye seçenekleri.',
    content: 'Şehir içi teslimatlarında trafik ve mesafeye göre farklı kurye türleri kullanılır. Moto ve bisiklet kurye, yoğun trafikte hızlı ve ekonomik çözümdür; belge ve küçük paketler için idealdir.\n\nAraçlı kurye büyük ve ağır paketler, toplu siparişler için tercih edilir. Yaya veya ekspres kurye ise merkezi bölgelerde kısa mesafe ve anlık teslimat için kullanılır. Pakethane ile ihtiyacınıza uygun seçeneği birlikte belirliyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800',
  },
  {
    title: 'Antalya\'da E-Ticaret Teslimatı: Müşteri Memnuniyeti İpuçları',
    excerpt: 'E-ticaret satıcıları için Antalya bölgesinde hızlı teslimat, iade toplama ve müşteri deneyimini iyileştirme önerileri.',
    content: 'E-ticarette müşteri memnuniyeti, büyük oranda teslimat hızı ve güvenilirliğe bağlıdır. Antalya gibi turistik ve nüfus yoğun bölgelerde aynı gün veya ertesi gün teslimat vaat etmek, rakiplerden ayrışmanızı sağlar.\n\nPakethane ile toplu gönderi anlaşmaları, canlı takip linki ve iade toplama hizmetiyle hem operasyonel yükünüzü azaltabilir hem de müşteri geri bildirimlerini olumlu yönde artırabilirsiniz. Bölgeye özel kurye ve rota planlaması ile teslimat sürelerini optimize ediyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
  },
];

function seedIfEmpty(): void {
  const items = load();
  const isOldSeed = items.length === 3 && items.every((p, i) => p.id === `blog_seed_${i}`);
  if (items.length > 0 && !isOldSeed) return;
  const seeded = SEED_BLOG.map((p, i) => ({
    ...p,
    id: `blog_seed_${i}`,
    createdAt: new Date(Date.now() - (SEED_BLOG.length - i) * 86400000).toISOString(),
    order: i + 1,
  }));
  save(seeded);
}

export const blogStore = {
  getAll(): BlogPost[] {
    seedIfEmpty();
    return load().sort((a, b) => (b.order - a.order) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  add(post: Omit<BlogPost, 'id' | 'createdAt' | 'order'>): BlogPost {
    const items = load();
    const maxOrder = items.length ? Math.max(...items.map((p) => p.order), 0) : 0;
    const newPost: BlogPost = {
      ...post,
      id: generateId(),
      createdAt: new Date().toISOString(),
      order: maxOrder + 1,
    };
    items.push(newPost);
    save(items);
    return newPost;
  },

  update(id: string, updates: Partial<Omit<BlogPost, 'id'>>): BlogPost | null {
    const items = load();
    const idx = items.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    save(items);
    return items[idx];
  },

  remove(id: string): boolean {
    const items = load().filter((p) => p.id !== id);
    if (items.length === load().length) return false;
    save(items);
    return true;
  },
};

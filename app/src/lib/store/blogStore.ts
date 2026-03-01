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
    title: 'Kurye Hizmetinde Hız ve Güvenilirlik',
    excerpt: 'Şehir içi teslimatlarında zamanında ve güvenli hizmet nasıl sunulur?',
    content: 'Müşteri memnuniyetini artırmak için teslimat süreçlerini optimize ediyoruz. Canlı takip ve sigortalı gönderilerle güvenilir kurye hizmeti sunuyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
  },
  {
    title: 'Lojistik Sektöründe Dijital Dönüşüm',
    excerpt: 'Teknoloji ile kurye ve dağıtım süreçleri nasıl gelişiyor?',
    content: 'Akıllı rota planlama ve anlık bildirimlerle teslimat süreçlerini hızlandırıyoruz. Dijital altyapımız sayesinde her adımı takip edebilirsiniz.',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800',
  },
  {
    title: 'Kurumsal Kurye Çözümleri',
    excerpt: 'İşletmeler için özelleştirilmiş teslimat ve dağıtım hizmetleri.',
    content: 'Toplu gönderim, düzenli teslimat ve özel anlaşmalarla kurumsal müşterilerimize uygun maliyetli ve güvenilir çözümler sunuyoruz.',
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800',
  },
];

function seedIfEmpty(): void {
  const items = load();
  if (items.length > 0) return;
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

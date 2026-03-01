import type { Reference } from '@/types';

const STORAGE_KEY = 'pakethane_references';

function generateId(): string {
  return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function load(): Reference[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(items: Reference[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const SEED_REFERENCES: Omit<Reference, 'id'>[] = [
  { title: 'Migros', logoUrl: 'https://picsum.photos/seed/ref1/160/80', link: 'https://www.migros.com.tr', order: 1 },
  { title: 'Trendyol', logoUrl: 'https://picsum.photos/seed/ref2/160/80', link: 'https://www.trendyol.com', order: 2 },
  { title: 'Getir', logoUrl: 'https://picsum.photos/seed/ref3/160/80', link: 'https://getir.com', order: 3 },
  { title: 'Yemek Sepeti', logoUrl: 'https://picsum.photos/seed/ref4/160/80', link: 'https://www.yemeksepeti.com', order: 4 },
];

function seedIfEmpty(): void {
  const items = load();
  if (items.length > 0) return;
  const seeded = SEED_REFERENCES.map((r, i) => ({ ...r, id: `ref_seed_${i}`, order: i + 1 }));
  save(seeded);
}

export const referencesStore = {
  getAll(): Reference[] {
    seedIfEmpty();
    return load().sort((a, b) => a.order - b.order);
  },

  add(ref: Omit<Reference, 'id' | 'order'>): Reference {
    const items = load();
    const maxOrder = items.length ? Math.max(...items.map((r) => r.order), 0) : 0;
    const newRef: Reference = {
      ...ref,
      id: generateId(),
      order: maxOrder + 1,
    };
    items.push(newRef);
    save(items);
    return newRef;
  },

  update(id: string, updates: Partial<Omit<Reference, 'id'>>): Reference | null {
    const items = load();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    save(items);
    return items[idx];
  },

  remove(id: string): boolean {
    const items = load().filter((r) => r.id !== id);
    if (items.length === load().length) return false;
    save(items);
    return true;
  },

  reorder(orderedIds: string[]): void {
    const items = load();
    const byId = new Map(items.map((r) => [r.id, r]));
    const reordered: Reference[] = orderedIds
      .map((id, index) => {
        const r = byId.get(id);
        if (!r) return null;
        return { ...r, order: index };
      })
      .filter((r): r is Reference => r !== null);
    save(reordered);
  },
};

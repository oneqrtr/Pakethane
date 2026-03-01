import type { KuryeOlApplication, KuryeOlStatus, HizmetAlApplication } from '@/types';

const KURYE_OL_KEY = 'pakethane_kurye_ol';
const HIZMET_AL_KEY = 'pakethane_hizmet_al';

function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// --- Kurye Ol ---
function loadKuryeOl(): KuryeOlApplication[] {
  try {
    const raw = localStorage.getItem(KURYE_OL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveKuryeOl(items: KuryeOlApplication[]): void {
  localStorage.setItem(KURYE_OL_KEY, JSON.stringify(items));
}

export const kuryeOlStore = {
  getAll(): KuryeOlApplication[] {
    return loadKuryeOl().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): KuryeOlApplication | null {
    return loadKuryeOl().find((a) => a.id === id) ?? null;
  },

  create(data: {
    adSoyad: string;
    email: string;
    telefon: string;
    mesaj?: string;
  }): KuryeOlApplication {
    const item: KuryeOlApplication = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: now(),
      updatedAt: now(),
    };
    const items = loadKuryeOl();
    items.push(item);
    saveKuryeOl(items);
    return item;
  },

  setStatus(id: string, status: KuryeOlStatus, signingRequestToken?: string): KuryeOlApplication | null {
    const items = loadKuryeOl();
    const idx = items.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    items[idx].status = status;
    items[idx].updatedAt = now();
    if (signingRequestToken !== undefined) items[idx].signingRequestToken = signingRequestToken;
    saveKuryeOl(items);
    return items[idx];
  },
};

// --- Hizmet Al ---
function loadHizmetAl(): HizmetAlApplication[] {
  try {
    const raw = localStorage.getItem(HIZMET_AL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHizmetAl(items: HizmetAlApplication[]): void {
  localStorage.setItem(HIZMET_AL_KEY, JSON.stringify(items));
}

export const hizmetAlStore = {
  getAll(): HizmetAlApplication[] {
    return loadHizmetAl().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  create(data: {
    firmaAdi: string;
    yetkili: string;
    email: string;
    telefon: string;
    talep: string;
  }): HizmetAlApplication {
    const item: HizmetAlApplication = {
      id: generateId(),
      ...data,
      createdAt: now(),
    };
    const items = loadHizmetAl();
    items.push(item);
    saveHizmetAl(items);
    return item;
  },
};

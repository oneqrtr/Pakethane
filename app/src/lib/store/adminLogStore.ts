/**
 * Admin / Superadmin giriş-çıkış logları (localStorage).
 * İleride veritabanına taşınacak.
 */

export type AdminLogRole = 'admin' | 'superadmin';
export type AdminLogAction = 'giriş' | 'çıkış';

export interface AdminLogEntry {
  role: AdminLogRole;
  action: AdminLogAction;
  at: string; // ISO 8601
}

const STORAGE_KEY = 'pakethane_admin_auth_log';
const MAX_ENTRIES = 500;

function load(): AdminLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(entries: AdminLogEntry[]): void {
  const trimmed = entries.slice(-MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export const adminLogStore = {
  getAll(): AdminLogEntry[] {
    return load().sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  },

  add(role: AdminLogRole, action: AdminLogAction): void {
    const entries = load();
    entries.push({ role, action, at: new Date().toISOString() });
    save(entries);
  },
};

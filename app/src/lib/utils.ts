import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/** jsPDF/pdf-lib Türkçe desteklemez; ASCII karşılıklarına çevirir */
export function toAsciiSafe(str: string): string {
  const map: Record<string, string> = {
    İ: 'I', ı: 'i', ş: 's', Ş: 'S', ğ: 'g', Ğ: 'G',
    ü: 'u', Ü: 'U', ö: 'o', Ö: 'O', ç: 'c', Ç: 'C',
    â: 'a', î: 'i', û: 'u',
  };
  return str.replace(/[İışŞğĞüÜöÖçÇâîû]/g, (c) => map[c] ?? c);
}

/** Kullanıcının cihaz IP adresini döndürür (api.ipify.org). Hata durumunda null. */
export async function getClientIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.ip === 'string' ? data.ip : null;
  } catch {
    return null;
  }
}

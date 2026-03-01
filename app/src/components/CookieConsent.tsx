import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'pakethane-cookie-consent';
const REJECT_REASK_MS = 3 * 60 * 1000; // 3 dakika

export function CookieConsent() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPanelOrAdmin = location.pathname === '/panel' || location.pathname.startsWith('/panel/') || location.pathname === '/admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isPanelOrAdmin) {
      setVisible(false);
      return;
    }
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (accepted === 'true') {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [mounted, isPanelOrAdmin]);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    if (reaskTimeoutRef.current) {
      clearTimeout(reaskTimeoutRef.current);
      reaskTimeoutRef.current = null;
    }
  };

  const handleReject = () => {
    setVisible(false);
    if (reaskTimeoutRef.current) clearTimeout(reaskTimeoutRef.current);
    reaskTimeoutRef.current = setTimeout(() => {
      setVisible(true);
      reaskTimeoutRef.current = null;
    }, REJECT_REASK_MS);
  };

  useEffect(() => {
    return () => {
      if (reaskTimeoutRef.current) clearTimeout(reaskTimeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-[100] w-full max-w-md bg-white shadow-xl border-r border-gray-200',
        'flex flex-col p-4 sm:p-6 animate-in slide-in-from-left duration-300',
        'max-h-[100dvh] overflow-y-auto'
      )}
    >
      <div className="flex items-start gap-3 mb-3 sm:mb-4 flex-shrink-0">
        <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
          <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Çerez Kullanımı</h3>
          <p className="text-sm text-gray-600 mt-1 sm:mt-2">
            Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Sitemizi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 flex-shrink-0">
        <Button onClick={handleAccept} className="w-full" size="sm">
          Kabul Et
        </Button>
        <Button variant="outline" onClick={handleReject} className="w-full" size="sm">
          Reddet
        </Button>
      </div>
    </div>
  );
}

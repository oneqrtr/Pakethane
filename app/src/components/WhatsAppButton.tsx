import { useLocation } from 'react-router-dom';

const WHATSAPP_NUMBER = '905434816028';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function WhatsAppButton() {
  const location = useLocation();
  const isPanelOrAdmin = location.pathname === '/panel' || location.pathname.startsWith('/panel/') || location.pathname === '/admin';
  if (isPanelOrAdmin) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      aria-label="WhatsApp ile yazın"
    >
      <i className="fa-brands fa-whatsapp text-[1.75rem]" />
    </a>
  );
}

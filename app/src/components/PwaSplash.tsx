import { useState, useEffect, useRef } from 'react';

const SPLASH_DURATION_MS = 1400;
const FADEOUT_MS = 400;

export function PwaSplash() {
  const [phase, setPhase] = useState<'show' | 'exit'>('show');
  const [mounted, setMounted] = useState(true);
  const exitRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const showTimer = setTimeout(() => setPhase('exit'), SPLASH_DURATION_MS);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'exit') return;
    exitRef.current = setTimeout(() => setMounted(false), FADEOUT_MS);
    return () => {
      if (exitRef.current) clearTimeout(exitRef.current);
    };
  }, [phase]);

  if (!mounted) return null;

  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-[400ms] ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={phase === 'exit' ? { pointerEvents: 'none' } : undefined}
      aria-hidden
    >
      <style>{`
        .pwa-splash-logo {
          animation: pwaSplashLogo 1s ease-out;
        }
        @keyframes pwaSplashLogo {
          0% { opacity: 0; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <img
        src={`${baseUrl}pwa.png`}
        alt="Pakethane"
        className="pwa-splash-logo h-32 w-auto object-contain sm:h-40"
      />
    </div>
  );
}

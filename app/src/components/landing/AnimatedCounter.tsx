import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  /** Son sayı (örn. 7000, 7, 30) */
  target: number;
  /** Sayıdan sonra gösterilecek (örn. "+", "M+") */
  suffix?: string;
  /** Animasyon süresi (ms) */
  duration?: number;
  /** Sayı binlik ayracı (7000 -> "7.000") */
  useThousandsSeparator?: boolean;
  /** true olduğunda sayı animasyonu başlar */
  start?: boolean;
  className?: string;
}

export function AnimatedCounter({
  target,
  suffix = '',
  duration = 1800,
  useThousandsSeparator = true,
  start = false,
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  const display = useThousandsSeparator && count >= 1000
    ? count.toLocaleString('tr-TR')
    : String(count);

  return (
    <span className={className}>
      {display}{suffix}
    </span>
  );
}

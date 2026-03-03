import { useState } from 'react';
import type { Reference } from '@/types';
import { cn } from '@/lib/utils';

interface ReferencesCarouselProps {
  references: Reference[];
  className?: string;
}

export function ReferencesCarousel({ references, className }: ReferencesCarouselProps) {
  const [paused, setPaused] = useState(false);

  if (references.length === 0) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground text-sm', className)}>
        Referanslarımız bölümüne admin panelden logo ekleyebilirsiniz.
      </div>
    );
  }

  // İki kopya ile kesintisiz döngü
  const duplicated = [...references, ...references];

  return (
    <div
      className={cn('overflow-hidden', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn(
          'references-track flex gap-12 items-center w-max animate-references-scroll',
          paused && 'references-scroll-paused'
        )}
      >
        {duplicated.map((ref, i) => (
          <a
            key={`${ref.id}-${i}`}
            href={ref.link || '#'}
            target={ref.link ? '_blank' : undefined}
            rel={ref.link ? 'noopener noreferrer' : undefined}
            className="flex-shrink-0 flex items-center justify-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            title={ref.title}
          >
            <img
              src={ref.logoUrl}
              alt={ref.title}
              className="h-24 w-auto max-w-[280px] object-contain"
            />
          </a>
        ))}
      </div>
      <style>{`
        @keyframes references-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-references-scroll {
          animation: references-scroll 30s linear infinite;
        }
        .references-scroll-paused {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

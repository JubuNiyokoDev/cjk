'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GallerySlide } from '@/lib/content';

type PostGalleryProps = {
  slides: GallerySlide[];
  title: string;
  /** Rendu quand aucune image n'existe (dégradé + icône du thème). */
  fallback: React.ReactNode;
  heightClassName?: string;
  /** Thème d'accent de la vignette active (orange par défaut, bleu pour les actualités). */
  accent?: 'orange' | 'blue';
};

const ACCENT_RINGS: Record<'orange' | 'blue', string> = {
  orange: 'ring-2 ring-orange-500 ring-offset-1',
  blue: 'ring-2 ring-blue-500 ring-offset-1',
};

/**
 * Galerie pro des publications : diapositive principale (flèches, compteur,
 * légende), bande de vignettes et plein écran au clic. Navigation clavier
 * (flèches / Échap) et balayage tactile pris en charge.
 */
export default function PostGallery({
  slides,
  title,
  fallback,
  heightClassName = 'h-64 sm:h-96',
  accent = 'orange',
}: PostGalleryProps) {
  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = slides.length;
  const current = slides[index];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Navigation clavier du plein écran.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft') goTo(index - 1);
      if (event.key === 'ArrowRight') goTo(index + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen, index, goTo]);

  // Bloque le défilement de la page derrière le plein écran.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLightboxOpen]);

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? index + 1 : index - 1);
    setTouchStartX(null);
  };

  if (count === 0) {
    return <div className={cn('relative', heightClassName)}>{fallback}</div>;
  }

  return (
    <div>
      <div
        className={cn('relative overflow-hidden group/gallery', heightClassName)}
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="block h-full w-full cursor-zoom-in"
          aria-label={`Agrandir la photo ${index + 1} sur ${count}`}
        >
          <img
            src={current.url}
            alt={current.caption || `${title} — photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </button>

        {current.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-4 pt-10 pointer-events-none">
            <p className="text-sm text-white/95 line-clamp-2">{current.caption}</p>
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-gray-800 opacity-0 group-hover/gallery:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-gray-800 opacity-0 group-hover/gallery:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              <Images className="w-3.5 h-3.5" />
              {index + 1}/{count}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-gray-50/80 border-t border-gray-100">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.url}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={cn(
                'relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                slideIndex === index
                  ? ACCENT_RINGS[accent]
                  : 'opacity-60 hover:opacity-100'
              )}
              aria-label={`Voir la photo ${slideIndex + 1}`}
            >
              <img
                src={slide.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie de « ${title} »`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-h-[80vh] max-w-5xl w-full flex items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={current.url}
              alt={current.caption || `${title} — photo ${index + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center" onClick={(event) => event.stopPropagation()}>
            {current.caption && (
              <p className="text-sm text-white/90 max-w-2xl mx-auto mb-1">{current.caption}</p>
            )}
            {count > 1 && (
              <p className="text-xs text-white/60">
                {index + 1} / {count}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

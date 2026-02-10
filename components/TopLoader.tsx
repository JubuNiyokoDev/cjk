'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = useRef<LoadingBarRef>(null);

  useEffect(() => {
    // Compléter la barre quand la page change
    ref.current?.complete();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercepter tous les clics sur les liens
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        // Vérifier si c'est une navigation interne
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          ref.current?.continuousStart();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  return (
    <LoadingBar
      color="#f97316"
      ref={ref}
      shadow={false}
      height={3}
    />
  );
}

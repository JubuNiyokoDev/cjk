'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Ancienne page de création/édition rapide, remplacée par le back-office pro
 * (galerie multi-images, hashtags, lien externe). On redirige les anciens
 * liens vers la bonne section d'administration.
 */
const ADMIN_ROUTES: Record<string, string> = {
  blog: '/admin/blog',
  news: '/admin/news',
  activity: '/admin/activities',
};

function LegacyCreateRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type') ?? '';
    router.replace(ADMIN_ROUTES[type] ?? '/admin');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}

export default function AdminCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <LegacyCreateRedirect />
    </Suspense>
  );
}

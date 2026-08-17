'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Newspaper,
  CalendarDays,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { useAuthSession } from '@/hooks/use-auth-session';
import {
  AdminApiError,
  listAdminActivities,
  listAdminBlogPosts,
  listAdminNews,
} from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';

type ContentStats = {
  total: number;
  published: number;
};

type DashboardStats = {
  blog: ContentStats;
  news: ContentStats;
  activities: ContentStats;
};

function countPublished(items: { is_published?: boolean }[]): ContentStats {
  return {
    total: items.length,
    published: items.filter((item) => item.is_published).length,
  };
}

const sections = [
  {
    href: '/admin/blog',
    label: 'Articles de blog',
    description: 'Rédiger et publier les articles du blog',
    icon: FileText,
    statsKey: 'blog' as const,
  },
  {
    href: '/admin/news',
    label: 'Actualités',
    description: 'Annonces et nouvelles du Centre',
    icon: Newspaper,
    statsKey: 'news' as const,
  },
  {
    href: '/admin/activities',
    label: 'Activités & Formations',
    description: 'Événements, sport, culture, formations',
    icon: CalendarDays,
    statsKey: 'activities' as const,
  },
  {
    href: '/admin/gallery',
    label: 'Galerie',
    description: 'Photos et vidéos du Centre',
    icon: ImageIcon,
    statsKey: null,
  },
];

/** Tableau de bord du back-office : vue d'ensemble des contenus et accès rapides. */
export default function AdminDashboardPage() {
  const { isAuthenticated, isOfficialMember } = useAuthSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const [blog, news, activities] = await Promise.all([
        listAdminBlogPosts(),
        listAdminNews(),
        listAdminActivities(),
      ]);
      setStats({
        blog: countPublished(blog),
        news: countPublished(news),
        activities: countPublished(activities),
      });
    } catch (error) {
      const message =
        error instanceof AdminApiError ? error.message : 'Impossible de charger les statistiques.';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated || !isOfficialMember) return;
    loadStats();
  }, [isAuthenticated, isOfficialMember, loadStats]);

  return (
    <AdminShell
      title="Tableau de bord"
      description="Gérez les contenus publiés sur le site du Centre Jeunes Kamenge."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section, index) => {
          const sectionStats = section.statsKey && stats ? stats[section.statsKey] : null;
          return (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={section.href}
                className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-200 transition-all h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>

                <h2 className="text-lg font-bold text-gray-900 mt-4">{section.label}</h2>
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>

                {section.statsKey && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm">
                    {isLoadingStats ? (
                      <span className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement…
                      </span>
                    ) : sectionStats ? (
                      <>
                        <span className="font-semibold text-gray-900">
                          {sectionStats.total}{' '}
                          <span className="font-normal text-gray-500">au total</span>
                        </span>
                        <span className="font-semibold text-green-700">
                          {sectionStats.published}{' '}
                          <span className="font-normal text-gray-500">publié{sectionStats.published > 1 ? 's' : ''}</span>
                        </span>
                        {sectionStats.total - sectionStats.published > 0 && (
                          <span className="font-semibold text-gray-600">
                            {sectionStats.total - sectionStats.published}{' '}
                            <span className="font-normal text-gray-500">brouillon{sectionStats.total - sectionStats.published > 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">Statistiques indisponibles</span>
                    )}
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </AdminShell>
  );
}

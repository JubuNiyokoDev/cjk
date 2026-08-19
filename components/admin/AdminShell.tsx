'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileText, Newspaper, CalendarDays, Image as ImageIcon, LayoutDashboard, Building2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuthSession } from '@/hooks/use-auth-session';

const adminNav = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/news', label: 'Actualités', icon: Newspaper },
  { href: '/admin/activities', label: 'Activités & Formations', icon: CalendarDays },
  { href: '/admin/gallery', label: 'Galerie', icon: ImageIcon },
  { href: '/admin/organisation', label: 'Organisation', icon: Building2 },
];

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

/**
 * Gabarit commun du back-office : garde d'accès staff, navigation admin,
 * en-tête de page. Les pages enfants ne gèrent que leur contenu.
 */
export default function AdminShell({ title, description, children, actions }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isOfficialMember, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isOfficialMember) {
      router.replace('/unauthorized');
    }
  }, [router, isAuthenticated, isOfficialMember, isLoading]);

  if (isLoading || !isAuthenticated || !isOfficialMember) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
        <Navigation />
        <div className="pt-32 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
      <Navigation />

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Navigation administration" className="mb-10 overflow-x-auto">
            <ul className="flex gap-2 min-w-max pb-1">
              {adminNav.map((item) => {
                const isActive =
                  item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </motion.header>

          {children}
        </div>
      </section>

      <Footer />
    </main>
  );
}

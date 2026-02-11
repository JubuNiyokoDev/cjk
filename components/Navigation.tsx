/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/use-auth-session';
import Image from 'next/image';

const navItems = [
  { name: 'Accueil', href: '/#home' },
  { name: 'À propos', href: '/#about' },
  { name: 'Mission', href: '/#mission' },
  { name: 'Activités', href: '/#activities' },
  { name: 'Blog', href: '/#blog' },
  { name: 'Actualités', href: '/#news' },
  { name: 'Histoire', href: '/#history' },
  { name: 'Contact', href: '/#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { member, isAuthenticated, isLoading, logout } = useAuthSession();

  const displayName =
    member?.first_name || member?.last_name
      ? `${member?.first_name ?? ''} ${member?.last_name ?? ''}`.trim()
      : member?.username ?? 'Membre';
  const initial = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 border border-red-500 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center text-white font-bold text-xl">
             <img src="/logo.jpeg" className="h-full w-full object-cover rounded-md inset-0" alt="CJK Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Centre Jeunes Kamenge
              </h1>
              <p className="text-xs text-gray-600">Ensemble pour bâtir un monde de frères</p>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative group"
              >
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-orange-500 transition-colors font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoading ? null : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-orange-200">
                  {member?.photo ? (
                    <Image
                      src={member.photo}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-orange-600">{initial}</span>
                  )}
                </div>
                <div className="text-sm">
                  <Link href="/profile" className="font-semibold text-gray-900 hover:text-orange-500 transition">
                    <p className="font-semibold text-gray-900">{displayName}</p>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500"
                  >
                    <LogOut className="h-3 w-3" /> Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 rounded-md border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition"
              >
                Se connecter
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-orange-500 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="border-t px-4 py-4">
              {isLoading ? null : isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href="/profile">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                        {member?.photo ? (
                          <img
                            src={member.photo}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-orange-600">{initial}</span>
                        )}
                      </div>
                    </Link>
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1 text-sm text-gray-500"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center w-full px-4 py-2 rounded-md border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

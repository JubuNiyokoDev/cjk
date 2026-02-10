/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { saveTokens } from '@/lib/auth';
import { useAuthSession } from '@/hooks/use-auth-session';
import { motion, AnimatePresence } from 'framer-motion';

type LoginState = {
  username: string;
  password: string;
};

const initialLogin: LoginState = {
  username: '',
  password: '',
};

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuthSession();
  const [login, setLogin] = useState<LoginState>(initialLogin);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const tokens = await response.json();
      saveTokens(tokens);
      await refresh();
      router.push('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connexion impossible');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <Navigation />
      <section className="pt-32 pb-16 relative">
        {/* Formes décoratives animées */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 12 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: -12 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: -12 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-20 right-1/2 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Connexion
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre espace membre
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl  border border-slate-100 p-8"
          >
            <form className="space-y-5" onSubmit={handleLogin}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <label className="text-sm font-semibold text-gray-700">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={login.username}
                  onChange={(e) => setLogin({ ...login, username: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </form>
            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm text-gray-600"
            >
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-orange-600 font-semibold hover:text-orange-500 transition-colors">
                Créer un compte
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

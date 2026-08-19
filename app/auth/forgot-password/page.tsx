'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MailCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';

/** Demande de réinitialisation : envoie un lien par email au membre. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/password_reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Demande impossible pour le moment. Réessayez plus tard.');
      }

      setIsSent(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Demande impossible pour le moment.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <Navigation />
      <section className="pt-32 pb-16 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 12 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 0.1, scale: 1, rotate: -12 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Mot de passe oublié
            </h1>
            <p className="text-gray-600">
              Entrez l&apos;email de votre compte et nous vous enverrons un lien de
              réinitialisation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-100 p-8"
          >
            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <MailCheck className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Email envoyé !</h2>
                <p className="text-sm text-gray-600">
                  Si <span className="font-semibold">{email}</span> correspond à un compte,
                  vous recevrez un lien de réinitialisation dans quelques minutes. Pensez à
                  vérifier vos spams.
                </p>
              </motion.div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="email@exemple.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Envoi en cours…' : 'Envoyer le lien'}
                </motion.button>
              </form>
            )}

            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

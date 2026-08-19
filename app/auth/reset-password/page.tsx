'use client';

import { Suspense, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, KeyRound } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PasswordInput } from '@/components/ui/password-input';
import { API_BASE_URL } from '@/lib/api';

function extractErrorMessage(payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.new_password)) return data.new_password.join(' ');
  }
  return 'Réinitialisation impossible. Réessayez.';
}

/** Formulaire de nouveau mot de passe, atteint via le lien reçu par email. */
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';
  const hasValidLink = uid !== '' && token !== '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordsMatch = useMemo(
    () => confirmPassword.length === 0 || newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/password_reset_confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      setIsDone(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Réinitialisation impossible. Réessayez.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Nouveau mot de passe
        </h1>
        <p className="text-gray-600">Choisissez un nouveau mot de passe pour votre compte</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-100 p-8"
      >
        {!hasValidLink ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Ce lien est incomplet ou invalide. Refaites une demande de réinitialisation.
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-orange-600 font-semibold hover:text-orange-500 transition-colors"
            >
              Demander un nouveau lien
            </Link>
          </div>
        ) : isDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Mot de passe modifié !</h2>
            <p className="text-sm text-gray-600 mb-6">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Se connecter
            </Link>
          </motion.div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
              <div className="mt-1">
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-auto w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                8 caractères minimum, avec lettres et chiffres.
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-auto w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {!passwordsMatch && (
                <p className="mt-2 text-xs text-red-500">
                  Les mots de passe ne correspondent pas.
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" />
                {isLoading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
              </span>
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
      </motion.div>
    </div>
  );
}

/** Page de réinitialisation : lit uid + token depuis l'URL du lien email. */
export default function ResetPasswordPage() {
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
        <Suspense fallback={<div className="flex justify-center pt-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}

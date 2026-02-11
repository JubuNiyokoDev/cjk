/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthSession } from '@/hooks/use-auth-session';

type RegisterState = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
  quartier: string;
  date_naissance: string;
};

const initialRegister: RegisterState = {
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone: '',
  quartier: '',
  date_naissance: '',
};

const usernamePattern = /^[\w.@+-]+$/;

function validateUsername(username: string) {
  if (!usernamePattern.test(username)) {
    return "Le nom d'utilisateur ne peut contenir que lettres, chiffres ou @ . + - _";
  }
  return null;
}

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordStrength(password: string) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 2) return { score, label: 'Faible', color: 'bg-red-400' };
  if (score <= 4) return { score, label: 'Moyen', color: 'bg-yellow-400' };
  return { score, label: 'Fort', color: 'bg-green-500' };
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && value.length > 0) return String(value[0]);
        if (typeof value === 'string') return value;
      }
    }
  } catch {
    // ignore
  }
  return 'Inscription impossible';
}

export default function RegisterPage() {
  const router = useRouter();
  const [register, setRegister] = useState<RegisterState>(initialRegister);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
const { isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const passwordChecks = getPasswordChecks(register.password);
  const passwordStrength = getPasswordStrength(register.password);
  const usernameError = register.username ? validateUsername(register.username) : null;
  const passwordsMatch =
    register.password.length === 0 && register.confirm_password.length === 0
      ? true
      : register.password === register.confirm_password;

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const usernameValidation = validateUsername(register.username);
    if (usernameValidation) {
      setMessage(usernameValidation);
      return;
    }

    const checks = getPasswordChecks(register.password);
    const isStrong =
      checks.length && checks.lower && checks.upper && checks.number && checks.special;
    if (!isStrong) {
      setMessage(
        'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.'
      );
      return;
    }

    if (!passwordsMatch) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: register.username,
        email: register.email,
        password: register.password,
        first_name: register.first_name,
        last_name: register.last_name,
        phone: register.phone,
        quartier: register.quartier,
        date_naissance: register.date_naissance,
      };
      const response = await fetch(`${API_BASE_URL}/api/members/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      router.push('/auth/login?registered=true');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Inscription impossible');
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl"
        />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Inscription
            </h1>
            <p className="text-gray-600">
              Créez votre compte pour rejoindre la communauté CJK
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 p-8"
          >
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={register.first_name}
                    onChange={(e) => setRegister({ ...register, first_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={register.last_name}
                    onChange={(e) => setRegister({ ...register, last_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={register.username}
                  onChange={(e) => setRegister({ ...register, username: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
                {usernameError && (
                  <p className="mt-2 text-xs text-red-500">{usernameError}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={register.email}
                  onChange={(e) => setRegister({ ...register, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  value={register.password}
                  onChange={(e) => setRegister({ ...register, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Force du mot de passe : {passwordStrength.label}
                  </p>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs text-gray-500">
                    <span className={passwordChecks.length ? 'text-green-600' : ''}>
                      • 8 caractères minimum
                    </span>
                    <span className={passwordChecks.upper ? 'text-green-600' : ''}>
                      • Une majuscule
                    </span>
                    <span className={passwordChecks.lower ? 'text-green-600' : ''}>
                      • Une minuscule
                    </span>
                    <span className={passwordChecks.number ? 'text-green-600' : ''}>
                      • Un chiffre
                    </span>
                    <span className={passwordChecks.special ? 'text-green-600' : ''}>
                      • Un caractère spécial
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={register.confirm_password}
                  onChange={(e) => setRegister({ ...register, confirm_password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
                {!passwordsMatch && register.confirm_password.length > 0 && (
                  <p className="mt-2 text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    value={register.phone}
                    onChange={(e) => setRegister({ ...register, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Quartier</label>
                  <input
                    type="text"
                    value={register.quartier}
                    onChange={(e) => setRegister({ ...register, quartier: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  value={register.date_naissance}
                  onChange={(e) => setRegister({ ...register, date_naissance: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Inscription...
                  </span>
                ) : (
                  'Créer un compte'
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
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-sm text-gray-600"
            >
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-orange-600 font-semibold hover:text-orange-500 transition-colors">
                Se connecter
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

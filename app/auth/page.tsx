'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { clearTokens, getTokens, saveTokens } from '@/lib/auth';

type LoginState = {
  username: string;
  password: string;
};

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

const initialLogin: LoginState = {
  username: '',
  password: '',
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
    // ignore JSON parsing errors
  }
  return "Inscription impossible";
}

export default function AuthPage() {
  const [login, setLogin] = useState<LoginState>(initialLogin);
  const [register, setRegister] = useState<RegisterState>(initialRegister);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const passwordChecks = getPasswordChecks(register.password);
  const passwordStrength = getPasswordStrength(register.password);
  const usernameError = register.username ? validateUsername(register.username) : null;
  const passwordsMatch =
    register.password.length === 0 && register.confirm_password.length === 0
      ? true
      : register.password === register.confirm_password;

  useEffect(() => {
    setHasSession(Boolean(getTokens()));
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage(null);

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
      setHasSession(true);
      setLoginMessage('Connexion réussie. Votre session est active.');
      setLogin(initialLogin);
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : 'Connexion impossible');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setRegisterMessage(null);

    const usernameValidation = validateUsername(register.username);
    if (usernameValidation) {
      setRegisterMessage(usernameValidation);
      return;
    }

    const checks = getPasswordChecks(register.password);
    const isStrong =
      checks.length && checks.lower && checks.upper && checks.number && checks.special;
    if (!isStrong) {
      setRegisterMessage(
        'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.'
      );
      return;
    }

    if (!passwordsMatch) {
      setRegisterMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsRegistering(true);

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

      setRegisterMessage('Compte créé. Vous pouvez maintenant vous connecter.');
      setRegister(initialRegister);
    } catch (error) {
      setRegisterMessage(error instanceof Error ? error.message : 'Inscription impossible');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setHasSession(false);
    setLoginMessage('Vous êtes déconnecté.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Espace membres
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connectez-vous pour participer aux actions communautaires, publier ou commenter.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={login.username}
                    onChange={(event) => setLogin({ ...login, username: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    value={login.password}
                    onChange={(event) => setLogin({ ...login, password: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {isLoggingIn ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
              {loginMessage && (
                <p className="mt-4 text-sm font-semibold text-gray-600">{loginMessage}</p>
              )}
              {hasSession && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 text-sm font-semibold text-orange-600"
                >
                  Se déconnecter
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Inscription</h2>
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Prénom</label>
                    <input
                      type="text"
                      value={register.first_name}
                      onChange={(event) => setRegister({ ...register, first_name: event.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={register.last_name}
                      onChange={(event) => setRegister({ ...register, last_name: event.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={register.username}
                    onChange={(event) => setRegister({ ...register, username: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    onChange={(event) => setRegister({ ...register, email: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    value={register.password}
                    onChange={(event) => setRegister({ ...register, password: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    onChange={(event) =>
                      setRegister({ ...register, confirm_password: event.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      onChange={(event) => setRegister({ ...register, phone: event.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Quartier</label>
                    <input
                      type="text"
                      value={register.quartier}
                      onChange={(event) => setRegister({ ...register, quartier: event.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Date de naissance</label>
                  <input
                    type="date"
                    value={register.date_naissance}
                    onChange={(event) => setRegister({ ...register, date_naissance: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {isRegistering ? 'Inscription...' : 'Créer un compte'}
                </button>
              </form>
              {registerMessage && (
                <p className="mt-4 text-sm font-semibold text-gray-600">{registerMessage}</p>
              )}
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Espace staff</h3>
            <p className="text-gray-600">
              Les comptes staff sont attribués par l'administration du CJK. Contactez un responsable pour obtenir les droits de publication des actualités et activités.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

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
  first_name: '',
  last_name: '',
  phone: '',
  quartier: '',
  date_naissance: '',
};

export default function AuthPage() {
  const [login, setLogin] = useState<LoginState>(initialLogin);
  const [register, setRegister] = useState<RegisterState>(initialRegister);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasSession, setHasSession] = useState(false);

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
    setIsRegistering(true);
    setRegisterMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(register),
      });

      if (!response.ok) {
        throw new Error("Inscription impossible");
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

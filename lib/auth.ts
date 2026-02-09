export type AuthTokens = {
  access: string;
  refresh: string;
};

const STORAGE_KEY = 'cjk_auth_tokens';

export function saveTokens(tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

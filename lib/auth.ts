export type AuthTokens = {
  access: string;
  refresh: string;
};

const STORAGE_KEY = 'cjk_auth_tokens';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

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

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

function decodeBase64Url(value: string) {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (padded.length % 4)) % 4;
    const withPadding = padded + '='.repeat(padLength);
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(withPadding);
    }
    return Buffer.from(withPadding, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 30) {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - skewSeconds;
}

export async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens?.refresh) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = (await response.json()) as { access?: string };
    if (!data?.access) {
      clearTokens();
      return null;
    }

    const nextTokens = { access: data.access, refresh: tokens.refresh };
    saveTokens(nextTokens);
    return nextTokens;
  } catch {
    return null;
  }
}

export async function ensureValidAccessToken() {
  const tokens = getTokens();
  if (!tokens?.access) return null;
  if (isTokenExpired(tokens.access)) {
    const refreshed = await refreshAccessToken();
    return refreshed?.access ?? null;
  }
  return tokens.access;
}

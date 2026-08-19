'use client';

import { API_BASE_URL } from '@/lib/api';
import { ensureValidAccessToken } from '@/lib/auth';
import { AdminApiError } from '@/lib/admin-api';
import type { Member } from '@/lib/types';

/**
 * API self-service du profil membre.
 * - PATCH /api/members/me/ : mise à jour du profil (multipart si photo)
 * - POST  /api/members/change_password/ : changement de mot de passe
 */

export type ProfileInput = {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  quartier?: string;
  date_naissance?: string;
  photo?: File | null;
};

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const access = await ensureValidAccessToken();
  if (!access) {
    throw new AdminApiError('Session expirée. Veuillez vous reconnecter.', 401);
  }

  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${access}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const text = await response.text();

  if (!response.ok) {
    let message = `Erreur serveur (${response.status})`;
    let fieldErrors: Record<string, string[]> = {};
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.detail === 'string') {
        message = parsed.detail;
      } else {
        const messages: string[] = [];
        Object.entries(parsed).forEach(([field, value]) => {
          const list = Array.isArray(value) ? value.map(String) : [String(value)];
          fieldErrors = { ...fieldErrors, [field]: list };
          messages.push(`${field} : ${list.join(', ')}`);
        });
        if (messages.length) message = messages.join(' — ');
      }
    } catch {
      // corps non JSON : on garde le message générique
    }
    throw new AdminApiError(message, response.status, fieldErrors);
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function updateMyProfile(input: ProfileInput): Promise<Member> {
  const hasFile = input.photo instanceof File;

  if (hasFile) {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });
    return authRequest<Member>('/api/members/me/', {
      method: 'PATCH',
      body: formData,
    });
  }

  const { photo: _photo, ...rest } = input;
  return authRequest<Member>('/api/members/me/', {
    method: 'PATCH',
    body: JSON.stringify(rest),
  });
}

export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  await authRequest<{ detail: string }>('/api/members/change_password/', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

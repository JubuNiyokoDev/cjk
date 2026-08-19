'use client';

import { adminRequest } from '@/lib/admin-api';
import type { Award, CoreValue, Partner, TeamMember } from '@/lib/types';

/**
 * API staff pour les contenus "organization" (partenaires, valeurs,
 * équipe, distinctions). CRUD complet via /api/organization/*, réservé
 * au staff (IsStaffOrReadOnly côté Django).
 *
 * Convention fichiers (logo/photo) : undefined = champ non modifié,
 * File = nouveau fichier, null = suppression explicite.
 */

type Paginated<T> = { results: T[] };

function unwrapList<T>(data: T[] | Paginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

function toFormData(payload: Record<string, string | number | boolean | File | null | undefined>) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      formData.append(key, '');
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}

/** Envoie en multipart si un fichier est présent, sinon en JSON. */
function buildBody(
  payload: Record<string, string | number | boolean | File | null | undefined>,
  fileField: string,
): { body: BodyInit } {
  const fileValue = payload[fileField];
  if (fileValue instanceof File || fileValue === null) {
    return { body: toFormData(payload) };
  }
  const json: Record<string, string | number | boolean> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || key === fileField) return;
    json[key] = value as string | number | boolean;
  });
  return { body: JSON.stringify(json) };
}

/** Choix icône/couleur alignés sur organization.models (Django). */
export const ORG_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'shield', label: 'Bouclier' },
  { value: 'message-circle', label: 'Bulle de dialogue' },
  { value: 'scale', label: 'Balance' },
  { value: 'check-circle', label: 'Coche' },
  { value: 'ear', label: 'Oreille' },
  { value: 'users', label: 'Personnes' },
  { value: 'heart', label: 'Coeur' },
  { value: 'star', label: 'Étoile' },
  { value: 'handshake', label: 'Poignée de main' },
  { value: 'globe', label: 'Globe' },
  { value: 'sun', label: 'Soleil' },
  { value: 'book-open', label: 'Livre' },
];

export const ORG_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'blue', label: 'Bleu' },
  { value: 'green', label: 'Vert' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Violet' },
  { value: 'yellow', label: 'Jaune' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'red', label: 'Rouge' },
  { value: 'pink', label: 'Rose' },
];

/* ------------------------------- Partenaires ------------------------------ */

export type PartnerInput = {
  name?: string;
  country?: string;
  description?: string;
  website?: string;
  order?: number;
  is_active?: boolean;
  logo?: File | null;
};

export async function listAdminPartners(): Promise<Partner[]> {
  const data = await adminRequest<Partner[] | Paginated<Partner>>('/api/organization/partners/');
  return unwrapList(data);
}

export async function createPartner(input: PartnerInput): Promise<Partner> {
  return adminRequest<Partner>('/api/organization/partners/', {
    method: 'POST',
    ...buildBody(input, 'logo'),
  });
}

export async function updatePartner(id: number, input: PartnerInput): Promise<Partner> {
  return adminRequest<Partner>(`/api/organization/partners/${id}/`, {
    method: 'PATCH',
    ...buildBody(input, 'logo'),
  });
}

export async function deletePartner(id: number): Promise<void> {
  await adminRequest(`/api/organization/partners/${id}/`, { method: 'DELETE' });
}

/* --------------------------------- Valeurs -------------------------------- */

export type CoreValueInput = {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  is_active?: boolean;
};

export async function listAdminValues(): Promise<CoreValue[]> {
  const data = await adminRequest<CoreValue[] | Paginated<CoreValue>>('/api/organization/values/');
  return unwrapList(data);
}

export async function createValue(input: CoreValueInput): Promise<CoreValue> {
  return adminRequest<CoreValue>('/api/organization/values/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateValue(id: number, input: CoreValueInput): Promise<CoreValue> {
  return adminRequest<CoreValue>(`/api/organization/values/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteValue(id: number): Promise<void> {
  await adminRequest(`/api/organization/values/${id}/`, { method: 'DELETE' });
}

/* --------------------------------- Équipe --------------------------------- */

export type TeamMemberInput = {
  name?: string;
  role?: string;
  description?: string;
  email?: string;
  phone?: string;
  order?: number;
  is_active?: boolean;
  photo?: File | null;
};

export async function listAdminTeam(): Promise<TeamMember[]> {
  const data = await adminRequest<TeamMember[] | Paginated<TeamMember>>('/api/organization/team/');
  return unwrapList(data);
}

export async function createTeamMember(input: TeamMemberInput): Promise<TeamMember> {
  return adminRequest<TeamMember>('/api/organization/team/', {
    method: 'POST',
    ...buildBody(input, 'photo'),
  });
}

export async function updateTeamMember(id: number, input: TeamMemberInput): Promise<TeamMember> {
  return adminRequest<TeamMember>(`/api/organization/team/${id}/`, {
    method: 'PATCH',
    ...buildBody(input, 'photo'),
  });
}

export async function deleteTeamMember(id: number): Promise<void> {
  await adminRequest(`/api/organization/team/${id}/`, { method: 'DELETE' });
}

/* ------------------------------ Distinctions ------------------------------ */

export type AwardInput = {
  name?: string;
  description?: string;
  year?: string;
  icon?: string;
  color?: string;
  order?: number;
  is_active?: boolean;
};

export async function listAdminAwards(): Promise<Award[]> {
  const data = await adminRequest<Award[] | Paginated<Award>>('/api/organization/awards/');
  return unwrapList(data);
}

export async function createAward(input: AwardInput): Promise<Award> {
  return adminRequest<Award>('/api/organization/awards/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAward(id: number, input: AwardInput): Promise<Award> {
  return adminRequest<Award>(`/api/organization/awards/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAward(id: number): Promise<void> {
  await adminRequest(`/api/organization/awards/${id}/`, { method: 'DELETE' });
}

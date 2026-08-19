'use client';

import { API_BASE_URL } from '@/lib/api';
import { ensureValidAccessToken } from '@/lib/auth';
import type {
  Activity,
  ActivityCategory,
  ActivityCategoryColor,
  BlogCategory,
  BlogPost,
  NewsItem,
} from '@/lib/types';

/**
 * Couche CRUD réservée au back-office.
 *
 * Toutes les requêtes passent par `adminRequest`, qui rafraîchit le token JWT
 * avant l'appel et convertit les erreurs DRF en `AdminApiError` exploitable
 * dans l'UI (message lisible + statut HTTP).
 */

export class AdminApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function unwrapList<T>(data: T[] | Paginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/** Transforme la réponse d'erreur DRF en message lisible + erreurs par champ. */
function parseErrorBody(body: string, status: number): AdminApiError {
  if (!body) {
    return new AdminApiError(`Erreur serveur (${status})`, status);
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;

    if (typeof parsed.detail === 'string') {
      return new AdminApiError(parsed.detail, status);
    }

    const fieldErrors: Record<string, string[]> = {};
    const messages: string[] = [];

    Object.entries(parsed).forEach(([field, value]) => {
      const list = Array.isArray(value) ? value.map(String) : [String(value)];
      fieldErrors[field] = list;
      messages.push(`${field} : ${list.join(', ')}`);
    });

    return new AdminApiError(
      messages.length > 0 ? messages.join(' — ') : `Erreur serveur (${status})`,
      status,
      fieldErrors
    );
  } catch {
    return new AdminApiError(body.slice(0, 300), status);
  }
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const access = await ensureValidAccessToken();
  if (!access) {
    throw new AdminApiError('Session expirée. Veuillez vous reconnecter.', 401);
  }

  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${access}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw parseErrorBody(await response.text(), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/**
 * Construit un FormData en ignorant les valeurs vides.
 *
 * `null` est significatif pour les fichiers (= suppression explicite côté API),
 * alors que `undefined` signifie « champ non modifié » et doit être omis.
 */
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

/** Génère un slug URL-safe à partir d'un titre (accents retirés). */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export type BlogPostInput = {
  title: string;
  slug?: string;
  content: string;
  category?: number | null;
  is_published: boolean;
  image?: File | null;
  hashtags?: string;
  external_link?: string;
};

export async function listAdminBlogPosts(): Promise<BlogPost[]> {
  const data = await adminRequest<BlogPost[] | Paginated<BlogPost>>('/api/blog/posts/');
  return unwrapList(data);
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  return adminRequest<BlogPost>('/api/blog/posts/', {
    method: 'POST',
    body: toFormData({
      title: input.title,
      slug: input.slug || slugify(input.title),
      content: input.content,
      category: input.category ?? undefined,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function updateBlogPost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost> {
  return adminRequest<BlogPost>(`/api/blog/posts/${id}/`, {
    method: 'PATCH',
    body: toFormData({
      title: input.title,
      slug: input.slug,
      content: input.content,
      category: input.category ?? undefined,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function deleteBlogPost(id: number): Promise<void> {
  await adminRequest<void>(`/api/blog/posts/${id}/`, { method: 'DELETE' });
}

export async function listAdminCategories(): Promise<BlogCategory[]> {
  const data = await adminRequest<BlogCategory[] | Paginated<BlogCategory>>('/api/blog/categories/');
  return unwrapList(data);
}

export async function createCategory(name: string): Promise<BlogCategory> {
  return adminRequest<BlogCategory>('/api/blog/categories/', {
    method: 'POST',
    body: JSON.stringify({ name, slug: slugify(name) }),
  });
}

export async function updateCategory(id: number, name: string): Promise<BlogCategory> {
  return adminRequest<BlogCategory>(`/api/blog/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ name, slug: slugify(name) }),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await adminRequest<void>(`/api/blog/categories/${id}/`, { method: 'DELETE' });
}

/* ------------------------------------------------------------------ */
/* Actualités                                                          */
/* ------------------------------------------------------------------ */

export type NewsInput = {
  title: string;
  content: string;
  is_published: boolean;
  image?: File | null;
  hashtags?: string;
  external_link?: string;
};

export async function listAdminNews(): Promise<NewsItem[]> {
  const data = await adminRequest<NewsItem[] | Paginated<NewsItem>>('/api/news/');
  return unwrapList(data);
}

export async function createNews(input: NewsInput): Promise<NewsItem> {
  return adminRequest<NewsItem>('/api/news/', {
    method: 'POST',
    body: toFormData({
      title: input.title,
      content: input.content,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function updateNews(id: number, input: Partial<NewsInput>): Promise<NewsItem> {
  return adminRequest<NewsItem>(`/api/news/${id}/`, {
    method: 'PATCH',
    body: toFormData({
      title: input.title,
      content: input.content,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function deleteNews(id: number): Promise<void> {
  await adminRequest<void>(`/api/news/${id}/`, { method: 'DELETE' });
}

/* ------------------------------------------------------------------ */
/* Activités, événements et formations                                 */
/* ------------------------------------------------------------------ */

export type ActivityCategoryInput = {
  name: string;
  color?: ActivityCategoryColor;
  order?: number;
  is_active?: boolean;
};

/** Liste des catégories. Le staff voit aussi les catégories masquées. */
export async function listActivityCategories(): Promise<ActivityCategory[]> {
  const data = await adminRequest<ActivityCategory[] | Paginated<ActivityCategory>>(
    '/api/activities/categories/',
  );
  return unwrapList(data);
}

export async function createActivityCategory(
  input: ActivityCategoryInput,
): Promise<ActivityCategory> {
  // Le slug est dérivé du nom côté serveur, puis figé : le renommer
  // orphelinerait les activités qui l'utilisent déjà.
  return adminRequest<ActivityCategory>('/api/activities/categories/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateActivityCategory(
  id: number,
  input: Partial<ActivityCategoryInput>,
): Promise<ActivityCategory> {
  return adminRequest<ActivityCategory>(`/api/activities/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteActivityCategory(id: number): Promise<void> {
  await adminRequest<void>(`/api/activities/categories/${id}/`, { method: 'DELETE' });
}

export type ActivityInput = {
  title: string;
  description: string;
  activity_type: string;
  date_activite: string;
  is_published: boolean;
  image?: File | null;
  hashtags?: string;
  external_link?: string;
};

export async function listAdminActivities(): Promise<Activity[]> {
  const data = await adminRequest<Activity[] | Paginated<Activity>>('/api/activities/');
  return unwrapList(data);
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  return adminRequest<Activity>('/api/activities/', {
    method: 'POST',
    body: toFormData({
      title: input.title,
      description: input.description,
      activity_type: input.activity_type,
      date_activite: input.date_activite,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function updateActivity(id: number, input: Partial<ActivityInput>): Promise<Activity> {
  return adminRequest<Activity>(`/api/activities/${id}/`, {
    method: 'PATCH',
    body: toFormData({
      title: input.title,
      description: input.description,
      activity_type: input.activity_type,
      date_activite: input.date_activite,
      is_published: input.is_published,
      image: input.image,
      hashtags: input.hashtags,
      external_link: input.external_link,
    }),
  });
}

export async function deleteActivity(id: number): Promise<void> {
  await adminRequest<void>(`/api/activities/${id}/`, { method: 'DELETE' });
}

/* ------------------------------------------------------------------ */
/* Publication (bascule brouillon / publié)                            */
/* ------------------------------------------------------------------ */

export type ContentKind = 'blog' | 'news' | 'activity';

const publishEndpoints: Record<ContentKind, string> = {
  blog: '/api/blog/posts',
  news: '/api/news',
  activity: '/api/activities',
};

export async function togglePublish(kind: ContentKind, id: number, isPublished: boolean) {
  return adminRequest(`${publishEndpoints[kind]}/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_published: isPublished }),
  });
}

export { adminRequest };

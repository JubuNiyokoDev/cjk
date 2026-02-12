export async function getNewsItem(id: number) {
  return safeFetch<NewsItem>(`/api/news/${id}/`, undefined, { cache: 'no-store' });
}
export async function getActivity(id: number) {
  return safeFetch<Activity>(`/api/activities/${id}/`, undefined, { cache: 'no-store' });
}
import type { Activity, BlogCategory, BlogPost, NewsItem } from './types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function unwrapList<T>(data: T[] | Paginated<T>) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

async function safeFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined> | FormData,
  init?: NextFetchOptions,
  fallback?: T
): Promise<T> {
  try {
    const isFormData = params instanceof FormData;
    const url = isFormData ? buildUrl(path) : buildUrl(path, params as Record<string, string | number | boolean | undefined>);
    const shouldSkipCache = init?.cache === 'no-store';
    const nextOption = shouldSkipCache ? undefined : init?.next ?? { revalidate: 60 };
    
    // Ajouter automatiquement l'Authorization header si un token existe
    const { getTokens } = await import('./auth');
    const tokens = getTokens();
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(typeof init?.headers === 'object' && init?.headers !== null && !Array.isArray(init.headers)
        ? Object.fromEntries(
            Object.entries(init.headers).map(([key, value]) => [key, String(value)])
          )
        : {}),
    };
    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    const response = await fetch(url, {
      ...init,
      headers,
      body: isFormData ? params : init?.body,
      ...(nextOption ? { next: nextOption } : {}),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status} for ${url}`);
    }

    if (response.status === 204) {
      return fallback as T;
    }

    const text = await response.text();
    if (!text) {
      return fallback as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error('API JSON parse failed:', parseError);
      return fallback as T;
    }
  } catch (error) {
    console.error('API fetch failed:', error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

export async function getBlogPosts(params?: {
  category?: string | number;
  is_published?: boolean;
}) {
  const data = await safeFetch<BlogPost[] | Paginated<BlogPost>>(
    '/api/blog/posts/',
    params,
    { cache: 'no-store' },
    []
  );
  return unwrapList(data);
}

export async function getBlogPost(id: number) {
  return safeFetch<BlogPost>(`/api/blog/posts/${id}/`, undefined, { cache: 'no-store' });
}

export async function getBlogCategories() {
  const data = await safeFetch<BlogCategory[] | Paginated<BlogCategory>>(
    '/api/blog/categories/',
    undefined,
    { next: { revalidate: 300 } },
    []
  );
  return unwrapList(data);
}

export async function getNews(params?: { is_published?: boolean }) {
  const data = await safeFetch<NewsItem[] | Paginated<NewsItem>>(
    '/api/news/',
    params,
    { next: { revalidate: 60 } },
    []
  );
  return unwrapList(data);
}

export async function getActivities(params?: {
  activity_type?: string;
  is_published?: boolean;
}) {
  const data = await safeFetch<Activity[] | Paginated<Activity>>(
    '/api/activities/',
    params,
    { next: { revalidate: 60 } },
    []
  );
  return unwrapList(data);
}

export { API_BASE_URL, safeFetch };

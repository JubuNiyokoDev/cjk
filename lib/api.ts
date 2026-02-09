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
  params?: Record<string, string | number | boolean | undefined>,
  init?: NextFetchOptions,
  fallback?: T
): Promise<T> {
  try {
    const url = buildUrl(path, params);
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      next: init?.next ?? { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status} for ${url}`);
    }

    return (await response.json()) as T;
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
    { next: { revalidate: 60 } },
    []
  );
  return unwrapList(data);
}

export async function getBlogPost(id: number) {
  return safeFetch<BlogPost>(`/api/blog/posts/${id}/`, undefined, { next: { revalidate: 60 } });
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

export { API_BASE_URL };

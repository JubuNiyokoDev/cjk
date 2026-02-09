'use client';

import { API_BASE_URL } from '@/lib/api';
import { getTokens } from '@/lib/auth';
import type { Member } from '@/lib/types';

export type SocialComment = {
  id: number;
  content_type: number | string;
  object_id: number;
  text: string;
  content?: string;
  author?: number | null;
  author_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type LikeResponse = {
  liked?: boolean;
  likes_count?: number;
  count?: number;
};

function unwrapList<T>(data: T[] | Paginated<T>) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [] as T[];
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const tokens = getTokens();
  if (tokens?.access) {
    headers.Authorization = `Bearer ${tokens.access}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur serveur', response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export async function toggleLike(params: {
  content_type: number | string;
  object_id: number;
}) {
  const payload =
    typeof params.content_type === 'number'
      ? { content_type: params.content_type, object_id: params.object_id }
      : { content_type_str: params.content_type, object_id: params.object_id };

  return request<LikeResponse>('/api/social/likes/toggle/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getComments(params: {
  content_type: number | string;
  object_id: number;
}) {
  const query =
    typeof params.content_type === 'number'
      ? new URLSearchParams({
          content_type: String(params.content_type),
          object_id: String(params.object_id),
        })
      : new URLSearchParams({
          content_type_str: params.content_type,
          object_id: String(params.object_id),
        });
  const data = await request<SocialComment[] | Paginated<SocialComment>>(
    `/api/social/comments/?${query.toString()}`,
    { headers: getAuthHeaders() }
  );
  return unwrapList(data);
}

export async function createComment(params: {
  content_type: number | string;
  object_id: number;
  text: string;
  user?: number;
}) {
  const headers = getAuthHeaders();
  let userId = params.user;

  if (!userId) {
    if (!headers.Authorization) {
      throw new Error('Veuillez vous connecter pour commenter.');
    }
    const member = await request<Member>('/api/members/me/', { headers });
    userId = member.id;
  }

  const payload =
    typeof params.content_type === 'number'
      ? {
          content_type: params.content_type,
          object_id: params.object_id,
          text: params.text,
          user: userId,
        }
      : {
          content_type_str: params.content_type,
          object_id: params.object_id,
          text: params.text,
          user: userId,
        };

  return request<SocialComment>('/api/social/comments/', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

export async function updateComment(params: {
  id: number;
  text: string;
}) {
  return request<SocialComment>(`/api/social/comments/${params.id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text: params.text }),
  });
}

export async function deleteComment(id: number) {
  await request<{}>(`/api/social/comments/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

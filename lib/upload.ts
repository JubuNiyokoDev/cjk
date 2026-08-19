'use client';

import { API_BASE_URL } from '@/lib/api';
import { ensureValidAccessToken } from '@/lib/auth';
import { AdminApiError, adminRequest, type ContentKind } from '@/lib/admin-api';
import type { ContentImage } from '@/lib/types';

/**
 * Upload de galeries avec progression réelle.
 *
 * `fetch` ne sait pas rapporter la progression d'envoi : on passe par
 * XMLHttpRequest et `xhr.upload.onprogress` pour piloter de vraies barres
 * de progression (octets réellement transmis, pas une animation).
 *
 * Limites côté API (core/views.py) : 10 images par envoi, 20 par contenu,
 * 8 Mo par fichier, formats jpeg/png/webp/gif.
 */

export const MAX_IMAGES_PER_UPLOAD = 10;
export const MAX_IMAGES_PER_POST = 20;
export const MAX_IMAGE_SIZE_MB = 8;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const galleryEndpoints: Record<ContentKind, string> = {
  blog: '/api/blog/posts',
  news: '/api/news',
  activity: '/api/activities',
};

export type UploadProgress = {
  /** Octets déjà transmis. */
  loaded: number;
  /** Taille totale de la requête (0 si inconnue). */
  total: number;
  /** Pourcentage 0-100 (arrondi). */
  percent: number;
};

/** Validation locale avant envoi : mêmes règles que l'API, en français. */
export function validateFiles(files: File[], existingCount: number): string | null {
  if (files.length === 0) {
    return 'Aucune image sélectionnée.';
  }
  if (files.length > MAX_IMAGES_PER_UPLOAD) {
    return `Maximum ${MAX_IMAGES_PER_UPLOAD} images par envoi.`;
  }
  if (existingCount + files.length > MAX_IMAGES_PER_POST) {
    return `Maximum ${MAX_IMAGES_PER_POST} images par publication (${existingCount} déjà en ligne).`;
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `« ${file.name} » : format non supporté (JPEG, PNG, WebP ou GIF).`;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `« ${file.name} » dépasse ${MAX_IMAGE_SIZE_MB} Mo.`;
    }
  }
  return null;
}

/** Convertit la réponse d'erreur XHR en AdminApiError (message français). */
function xhrError(xhr: XMLHttpRequest): AdminApiError {
  try {
    const parsed = JSON.parse(xhr.responseText) as Record<string, unknown>;
    const message =
      typeof parsed.error === 'string'
        ? parsed.error
        : typeof parsed.detail === 'string'
          ? parsed.detail
          : `Erreur serveur (${xhr.status})`;
    return new AdminApiError(message, xhr.status);
  } catch {
    return new AdminApiError(
      xhr.status === 429
        ? 'Trop de requêtes : patientez une minute avant de renvoyer des images.'
        : `Erreur serveur (${xhr.status})`,
      xhr.status
    );
  }
}

/**
 * Envoie un lot d'images vers `POST /{contenu}/{id}/images/`.
 *
 * `onProgress` est appelé au fil de l'envoi avec les octets réellement
 * transmis. Retourne les images créées (avec ordre attribué par l'API).
 */
export async function uploadImages(
  kind: ContentKind,
  id: number,
  files: File[],
  captions: string[],
  onProgress?: (progress: UploadProgress) => void
): Promise<ContentImage[]> {
  const access = await ensureValidAccessToken();
  if (!access) {
    throw new AdminApiError('Session expirée. Veuillez vous reconnecter.', 401);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  captions.forEach((caption) => formData.append('captions', caption));

  return new Promise<ContentImage[]>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${galleryEndpoints[kind]}/${id}/images/`);
    xhr.setRequestHeader('Authorization', `Bearer ${access}`);
    xhr.responseType = 'text';

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      const total = event.lengthComputable ? event.total : 0;
      onProgress({
        loaded: event.loaded,
        total,
        percent: total > 0 ? Math.round((event.loaded / total) * 100) : 0,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as ContentImage[]);
        } catch {
          reject(new AdminApiError('Réponse serveur illisible.', xhr.status));
        }
      } else {
        reject(xhrError(xhr));
      }
    };

    xhr.onerror = () => reject(new AdminApiError('Connexion interrompue pendant l’envoi.', 0));
    xhr.onabort = () => reject(new AdminApiError('Envoi annulé.', 0));
    xhr.ontimeout = () => reject(new AdminApiError('Envoi trop long : réessayez.', 0));

    xhr.send(formData);
  });
}

/** Supprime une image de galerie (fichier inclus côté serveur). */
export async function deleteContentImage(
  kind: ContentKind,
  id: number,
  imageId: number
): Promise<void> {
  await adminRequest<void>(`${galleryEndpoints[kind]}/${id}/images/${imageId}/`, {
    method: 'DELETE',
  });
}

/** Met à jour la légende d'une image. */
export async function updateImageCaption(
  kind: ContentKind,
  id: number,
  imageId: number,
  caption: string
): Promise<ContentImage> {
  return adminRequest<ContentImage>(`${galleryEndpoints[kind]}/${id}/images/${imageId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ caption }),
  });
}

/** Réordonne la galerie : `ids` dans l'ordre d'affichage voulu. */
export async function reorderImages(
  kind: ContentKind,
  id: number,
  ids: number[]
): Promise<ContentImage[]> {
  return adminRequest<ContentImage[]>(`${galleryEndpoints[kind]}/${id}/images/reorder/`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

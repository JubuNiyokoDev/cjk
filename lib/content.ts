import type { Activity, ContentImage } from './types';

export type GallerySlide = {
  url: string;
  caption: string;
};

/**
 * Construit la liste des diapositives d'une publication :
 * image de couverture d'abord, puis la galerie triée (déjà ordonnée par l'API).
 * Les doublons couverture/galerie sont écartés.
 */
export function buildGallerySlides(
  baseUrl: string,
  cover: string | null | undefined,
  images: ContentImage[] | null | undefined
): GallerySlide[] {
  const slides: GallerySlide[] = [];
  const seen = new Set<string>();
  const coverUrl = resolveImageUrl(baseUrl, cover);
  if (coverUrl) {
    slides.push({ url: coverUrl, caption: '' });
    seen.add(coverUrl);
  }
  (images ?? []).forEach((item) => {
    const url = resolveImageUrl(baseUrl, item.image);
    if (!url || seen.has(url)) return;
    slides.push({ url, caption: item.caption ?? '' });
    seen.add(url);
  });
  return slides;
}

const activityLabels: Record<string, string> = {
  sport: 'Sport',
  culture: 'Culture',
  formation: 'Formation',
  paix: 'Paix & Réconciliation',
  autre: 'Autre',
};

const activityGradients: Record<string, string> = {
  sport: 'from-emerald-500 to-green-500',
  culture: 'from-orange-500 to-yellow-500',
  formation: 'from-blue-500 to-cyan-500',
  paix: 'from-red-500 to-pink-500',
  autre: 'from-slate-500 to-gray-500',
};

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'Date à confirmer';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Date à confirmer';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getExcerpt(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function resolveImageUrl(baseUrl: string, image?: string | null) {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedImage = image.startsWith('/') ? image : `/${image}`;
  return `${normalizedBase}${normalizedImage}`;
}

export function getActivityLabel(type: string) {
  return activityLabels[type] ?? 'Activité';
}

export function getActivityGradient(type: string) {
  return activityGradients[type] ?? 'from-orange-500 to-red-500';
}

export function sortByDateDesc<T extends { created_at?: string }>(items: T[] | null | undefined) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export function groupActivitiesByType(items: Activity[]) {
  return items.reduce<Record<string, Activity[]>>((acc, item) => {
    const key = item.activity_type ?? 'autre';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}

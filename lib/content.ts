import type { Activity, ActivityCategory, ActivityCategoryColor, ContentImage } from './types';

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

/** Dégradé Tailwind du badge, par couleur choisie par le staff. */
export const ACTIVITY_COLOR_GRADIENTS: Record<ActivityCategoryColor, string> = {
  emerald: 'from-emerald-500 to-green-500',
  orange: 'from-orange-500 to-yellow-500',
  blue: 'from-blue-500 to-cyan-500',
  red: 'from-red-500 to-pink-500',
  purple: 'from-purple-500 to-fuchsia-500',
  yellow: 'from-yellow-500 to-amber-500',
  cyan: 'from-cyan-500 to-sky-500',
  pink: 'from-pink-500 to-rose-500',
  slate: 'from-slate-500 to-gray-500',
};

export const DEFAULT_ACTIVITY_GRADIENT = 'from-orange-500 to-red-500';

/**
 * Catégories de secours utilisées quand l'API est injoignable : le site public
 * continue d'afficher des libellés lisibles au lieu de slugs bruts.
 */
const FALLBACK_CATEGORIES: ActivityCategory[] = [
  { id: -1, name: 'Sport', slug: 'sport', color: 'emerald', order: 1, is_active: true },
  { id: -2, name: 'Culture', slug: 'culture', color: 'orange', order: 2, is_active: true },
  { id: -3, name: 'Formation', slug: 'formation', color: 'blue', order: 3, is_active: true },
  { id: -4, name: 'Paix & Réconciliation', slug: 'paix', color: 'red', order: 4, is_active: true },
  { id: -5, name: 'Autre', slug: 'autre', color: 'slate', order: 5, is_active: true },
];

export function withFallbackCategories(categories: ActivityCategory[] | null | undefined) {
  return categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
}

/** Index slug → catégorie, pour retrouver libellé et couleur en O(1). */
export function indexCategories(categories: ActivityCategory[] | null | undefined) {
  return new Map(withFallbackCategories(categories).map((item) => [item.slug, item]));
}

/** Transforme un slug inconnu en libellé lisible (catégorie supprimée). */
function humanizeSlug(type: string) {
  if (!type) return 'Activité';
  const words = type.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

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

export type ActivityCategoryIndex = Map<string, ActivityCategory>;

export function getActivityLabel(type: string, categories?: ActivityCategoryIndex) {
  const match = categories?.get(type);
  if (match) return match.name;
  return humanizeSlug(type);
}

export function getActivityGradient(type: string, categories?: ActivityCategoryIndex) {
  const match = categories?.get(type);
  if (match) return ACTIVITY_COLOR_GRADIENTS[match.color] ?? DEFAULT_ACTIVITY_GRADIENT;
  return DEFAULT_ACTIVITY_GRADIENT;
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

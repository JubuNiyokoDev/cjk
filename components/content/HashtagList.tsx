import Link from 'next/link';
import { cn } from '@/lib/utils';

type HashtagListProps = {
  tags: string[];
  /** Page de liste vers laquelle chaque hashtag renvoie (ex. '/activities'). */
  basePath: string;
  /** Hashtag actif (filtre en cours) pour le mettre en évidence. */
  activeTag?: string;
  accent?: 'orange' | 'blue';
  className?: string;
};

const ACCENT_STYLES: Record<'orange' | 'blue', { idle: string; active: string }> = {
  orange: {
    idle: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    active: 'bg-orange-500 text-white shadow',
  },
  blue: {
    idle: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    active: 'bg-blue-500 text-white shadow',
  },
};

/** Hashtags cliquables menant à la page de liste filtrée (`?hashtag=`). */
export default function HashtagList({
  tags,
  basePath,
  activeTag,
  accent = 'orange',
  className,
}: HashtagListProps) {
  if (!tags || tags.length === 0) return null;
  const styles = ACCENT_STYLES[accent];
  const normalizedActive = (activeTag ?? '').toLowerCase();

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`${basePath}?hashtag=${encodeURIComponent(tag)}`}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-semibold transition-colors',
            tag.toLowerCase() === normalizedActive ? styles.active : styles.idle
          )}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

'use client';

import { Newspaper } from 'lucide-react';
import type { NewsItem } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, getExcerpt, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';

type NewsCardProps = {
  item: NewsItem;
  variant?: 'compact' | 'full';
};

export default function NewsCard({ item, variant = 'full' }: NewsCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, item.image);
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg overflow-hidden group transition-transform hover:-translate-y-1',
        isCompact ? 'min-h-[360px]' : 'min-h-[420px]'
      )}
    >
      <div className={cn('relative', isCompact ? 'h-40' : 'h-48')}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-white" />
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-blue-600">
          Actualité
        </div>
      </div>

      <div className={cn('p-6 flex flex-col gap-3', isCompact ? 'sm:p-5' : 'sm:p-6')}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{formatDate(item.created_at)}</span>
          <span>•</span>
          <span>{item.author_name}</span>
        </div>
        <h3 className={cn('font-bold text-gray-900', isCompact ? 'text-xl' : 'text-2xl')}>
          {item.title}
        </h3>
        <p className="text-gray-600">{getExcerpt(item.content, isCompact ? 120 : 160)}</p>
      </div>
    </div>
  );
}

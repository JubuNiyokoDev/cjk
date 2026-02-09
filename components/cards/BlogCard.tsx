'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, getExcerpt, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';

type BlogCardProps = {
  post: BlogPost;
  variant?: 'compact' | 'full';
};

export default function BlogCard({ post, variant = 'full' }: BlogCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, post.image);
  const isCompact = variant === 'compact';

  return (
    <Link href={`/blog/${post.id}`} className="block h-full">
      <div
        className={cn(
          'h-full bg-white rounded-2xl shadow-lg overflow-hidden group transition-transform hover:-translate-y-1',
          isCompact ? 'min-h-[360px]' : 'min-h-[420px]'
        )}
      >
        <div className={cn('relative', isCompact ? 'h-40' : 'h-48')}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-orange-600">
            {post.category_name}
          </div>
        </div>

        <div className={cn('p-6 flex flex-col gap-3', isCompact ? 'sm:p-5' : 'sm:p-6')}>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{formatDate(post.created_at)}</span>
            <span>•</span>
            <span>{post.author_name}</span>
          </div>
          <h3 className={cn('font-bold text-gray-900', isCompact ? 'text-xl' : 'text-2xl')}>
            {post.title}
          </h3>
          <p className="text-gray-600">{getExcerpt(post.content, isCompact ? 120 : 160)}</p>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { CalendarDays, Compass } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, getActivityGradient, getActivityLabel, getExcerpt, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';

type ActivityCardProps = {
  activity: Activity;
  variant?: 'compact' | 'full';
};

export default function ActivityCard({ activity, variant = 'full' }: ActivityCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, activity.image);
  const isCompact = variant === 'compact';
  const label = getActivityLabel(activity.activity_type);
  const gradient = getActivityGradient(activity.activity_type);

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
            alt={activity.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={cn('h-full w-full flex items-center justify-center bg-gradient-to-br', gradient)}>
            <Compass className="w-10 h-10 text-white" />
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-gray-800">
          {label}
        </div>
      </div>

      <div className={cn('p-6 flex flex-col gap-3', isCompact ? 'sm:p-5' : 'sm:p-6')}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays className="w-4 h-4" />
          <span>{formatDate(activity.date_activite ?? activity.created_at)}</span>
        </div>
        <h3 className={cn('font-bold text-gray-900', isCompact ? 'text-xl' : 'text-2xl')}>
          {activity.title}
        </h3>
        <p className="text-gray-600">{getExcerpt(activity.description, isCompact ? 120 : 160)}</p>
      </div>
    </div>
  );
}

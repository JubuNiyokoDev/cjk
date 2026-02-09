'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { isUnauthorized, toggleLike } from '@/lib/social';
import { cn } from '@/lib/utils';

type LikeButtonProps = {
  contentType: number | string;
  objectId: number;
  initialLiked?: boolean;
  initialCount?: number;
};

export default function LikeButton({
  contentType,
  objectId,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const isDisabled =
    (typeof contentType === 'number' && contentType <= 0) ||
    (typeof contentType === 'string' && contentType.trim().length === 0);

  const handleToggle = async () => {
    if (isLoading || isDisabled) return;
    setIsLoading(true);

    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);
    setLiked(nextLiked);
    setCount(nextCount);

    try {
      const response = await toggleLike({
        content_type: contentType,
        object_id: objectId,
      });

      if (typeof response.liked === 'boolean') {
        setLiked(response.liked);
      }
      if (typeof response.likes_count === 'number') {
        setCount(response.likes_count);
      }
      if (typeof response.count === 'number') {
        setCount(response.count);
      }
    } catch (error) {
      if (isUnauthorized(error)) {
        router.push('/auth');
        return;
      }
      setLiked(liked);
      setCount(count);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
        liked
          ? 'border-red-500 text-red-600 bg-red-50'
          : 'border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500',
        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
      )}
    >
      <Heart className={cn('w-4 h-4', liked ? 'fill-current' : '')} />
      <span>J'aime</span>
      <span className="text-xs text-gray-500">{count}</span>
    </button>
  );
}

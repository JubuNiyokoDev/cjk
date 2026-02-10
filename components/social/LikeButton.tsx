'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { isUnauthorized, toggleLike } from '@/lib/social';
import { getBlogPost } from '@/lib/api';
import { cn } from '@/lib/utils';

type LikeButtonProps = {
  contentType: string;
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
  const isDisabled = contentType.trim().length === 0;

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  // Récupérer l'état réel du like côté client avec auth
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const post = await getBlogPost(objectId);
        if (typeof post.is_liked === 'boolean') {
          setLiked(post.is_liked);
        }
        if (typeof post.likes_count === 'number') {
          setCount(post.likes_count);
        }
      } catch (error) {
        // Ignorer les erreurs (utilisateur non connecté)
      }
    };

    fetchLikeStatus();
  }, [objectId]);

  const handleToggle = async () => {
    if (isLoading || isDisabled) return;
    setIsLoading(true);

    const previousLiked = liked;
    const previousCount = count;

    // Mise à jour optimiste
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount(Math.max(0, count + (nextLiked ? 1 : -1)));

    try {
      const response = await toggleLike({
        content_type: contentType,
        object_id: objectId,
      });
      console.log(response)

      setLiked(response.liked ?? nextLiked);
      setCount(response.likes_count ?? count);

    } catch (error) {
      if (isUnauthorized(error)) {
        router.push('/auth');
        return;
      }
      // Rollback en cas d'erreur
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isDisabled || isLoading}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
        liked
          ? 'border-red-500 text-red-600 bg-red-50'
          : 'border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500',
        isDisabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''
      )}
    >
      <Heart className={cn('w-4 h-4', liked ? 'fill-current' : '')} />
      <span>J&apos;aime</span>
      <span className="text-xs text-gray-500">{count}</span>
    </button>
  );
}

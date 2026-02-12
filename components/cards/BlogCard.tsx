'use client';

import Link from 'next/link';
import { BookOpen, Heart, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type BlogCardProps = {
  post: BlogPost;
  variant?: 'compact' | 'full';
  showActions?: boolean;
};

export default function BlogCard({ post, variant = 'full', showActions = false }: BlogCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, post.image);
  const isCompact = variant === 'compact';
  const router = useRouter();
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(post.is_published);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle publish clicked', { postId: post.id, currentState: isPublished });
    const toastId = toast({ title: 'En cours...', description: 'Mise à jour du statut' });
    try {
      const { getTokens } = await import('@/lib/auth');
      const tokens = getTokens();
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${post.id}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
        body: JSON.stringify({ is_published: !isPublished }),
      });
      console.log('Toggle response:', response.status);
      if (response.ok) {
        setIsPublished(!isPublished);
        toastId.update({ id: toastId.id, title: !isPublished ? 'Publié' : 'Dépublié', description: 'Statut mis à jour avec succès' });
        router.refresh();
      } else {
        toastId.update({ id: toastId.id, title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
      }
    } catch (error) {
      toastId.update({ id: toastId.id, title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete clicked', post.id);
    if (!confirm('Supprimer ce contenu ?')) return;
    setIsDeleting(true);
    const toastId = toast({ title: 'En cours...', description: 'Suppression du contenu' });
    try {
      const { getTokens } = await import('@/lib/auth');
      const tokens = getTokens();
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${post.id}/`, {
        method: 'DELETE',
        headers: {
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
      });
      console.log('Delete response:', response.status);
      if (response.ok) {
        toastId.update({ id: toastId.id, title: 'Supprimé', description: 'Contenu supprimé avec succès' });
        router.refresh();
      } else {
        toastId.update({ id: toastId.id, title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
        setIsDeleting(false);
      }
    } catch (error) {
      toastId.update({ id: toastId.id, title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/create?id=${post.id}&type=blog`);
  };

  return (
    <div className="relative h-full">
      {showActions && (
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button
            onClick={handleTogglePublish}
            className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-colors"
            title={isPublished ? 'Dépublier' : 'Publier'}
          >
            {isPublished ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={handleEdit}
            className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4 text-orange-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-md transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
      <Link href={`/blog/${post.id}`} className="block h-full">
        <div
          className={cn(
            'h-full bg-white rounded-md shadow-lg overflow-hidden group transition-transform hover:-translate-y-1',
            isCompact ? 'min-h-[360px]' : 'min-h-[420px]',
            isDeleting && 'opacity-50 pointer-events-none'
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
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
              <Heart className={cn('h-4 w-4', post.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
              <span>{post.likes_count ?? 0}</span>
            </div>
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-white/90 text-sm font-semibold text-orange-600">
              {post.category_name}
            </div>
          </div>

          <div className={cn('p-6 flex flex-col gap-3', isCompact ? 'sm:p-5' : 'sm:p-6')}>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(post.created_at)}</span>
              <span>•</span>
              <span>{post.author_name}</span>
            </div>
            <h3 className={cn('font-bold text-gray-900', isCompact ? 'text-md' : 'text-xl')}>
              {post.title}
            </h3>
            <div className="text-gray-600 prose prose-sm max-w-none line-clamp-6 overflow-hidden " data-color-mode="light">
              <MDEditor.Markdown source={post.content} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

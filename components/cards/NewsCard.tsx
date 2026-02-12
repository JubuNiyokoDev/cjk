'use client';

import { Newspaper, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import type { NewsItem } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type NewsCardProps = {
  item: NewsItem;
  variant?: 'compact' | 'full';
  showActions?: boolean;
};

export default function NewsCard({ item, variant = 'full', showActions = false }: NewsCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, item.image);
  const isCompact = variant === 'compact';
  const router = useRouter();
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(item.is_published);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const toastId = toast({ title: 'En cours...', description: 'Mise à jour du statut' });
    try {
      const { getTokens } = await import('@/lib/auth');
      const tokens = getTokens();
      const response = await fetch(`${API_BASE_URL}/api/news/${item.id}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
        body: JSON.stringify({ is_published: !isPublished }),
      });
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
    if (!confirm('Supprimer ce contenu ?')) return;
    setIsDeleting(true);
    const toastId = toast({ title: 'En cours...', description: 'Suppression du contenu' });
    try {
      const { getTokens } = await import('@/lib/auth');
      const tokens = getTokens();
      const response = await fetch(`${API_BASE_URL}/api/news/${item.id}/`, {
        method: 'DELETE',
        headers: {
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
      });
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
    router.push(`/admin/create?id=${item.id}&type=news`);
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
      <Link href={`/news/${item.id}`} className="block h-full group/news-card">
        <div
          className={cn(
            'bg-white rounded-md shadow-lg overflow-hidden group transition-transform hover:-translate-y-1',
            isCompact ? 'min-h-[360px]' : 'min-h-[420px]',
            isDeleting && 'opacity-50 pointer-events-none'
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
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-white/90 text-sm font-semibold text-blue-600">
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
            <div className="text-gray-600 prose prose-sm max-w-none line-clamp-6 overflow-hiddenb " data-color-mode="light">
              <MDEditor.Markdown source={item.content} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

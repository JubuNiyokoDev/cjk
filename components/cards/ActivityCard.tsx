'use client';

import { CalendarDays, Compass, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';
import { formatDate, getActivityGradient, getActivityLabel, resolveImageUrl } from '@/lib/content';
import { cn } from '@/lib/utils';
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type ActivityCardProps = {
  activity: Activity;
  variant?: 'compact' | 'full';
  showActions?: boolean;
};

export default function ActivityCard({ activity, variant = 'full', showActions = false }: ActivityCardProps) {
  const imageUrl = resolveImageUrl(API_BASE_URL, activity.image);
  const isCompact = variant === 'compact';
  const label = getActivityLabel(activity.activity_type);
  const gradient = getActivityGradient(activity.activity_type);
  const router = useRouter();
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(activity.is_published);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const toastId = toast({ title: 'En cours...', description: 'Mise à jour du statut' });
    try {
      const { getTokens } = await import('@/lib/auth');
      const tokens = getTokens();
      const response = await fetch(`${API_BASE_URL}/api/activities/${activity.id}/`, {
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
      const response = await fetch(`${API_BASE_URL}/api/activities/${activity.id}/`, {
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
    router.push(`/admin/create?id=${activity.id}&type=activity`);
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
      <Link href={`/activities/${activity.id}`} className="block h-full group/activity-card">
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
                alt={activity.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className={cn('h-full w-full flex items-center justify-center bg-gradient-to-br', gradient)}>
                <Compass className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-white/90 text-sm font-semibold text-gray-800">
              {label}
            </div>
          </div>

          <div className={cn('p-6 flex flex-col gap-3', isCompact ? 'sm:p-5' : 'sm:p-6')}>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="w-4 h-4" />
              <span>{formatDate(activity.date_activite ?? activity.created_at)}</span>
              {activity.author_name && (
                <>
                  <span>•</span>
                  <span>{activity.author_name}</span>
                </>
              )}
            </div>
            <h3 className={cn('font-bold text-gray-900', isCompact ? 'text-xl' : 'text-2xl')}>
              {activity.title}
            </h3>
            <div className="text-gray-600 prose prose-sm max-w-none line-clamp-6 overflow-hidden " data-color-mode="light">
              <MDEditor.Markdown source={activity.description} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

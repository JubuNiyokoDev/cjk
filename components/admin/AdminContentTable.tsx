'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { Pencil, Trash2, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export type AdminContentRow = {
  id: number;
  title: string;
  image?: string | null;
  is_published: boolean;
  /** Métadonnées affichées sous le titre (catégorie, type, date…). */
  meta?: ReactNode;
};

type AdminContentTableProps = {
  rows: AdminContentRow[];
  emptyMessage: string;
  /** id de la ligne dont la bascule publier/brouillon est en cours. */
  togglingId?: number | null;
  onTogglePublish: (row: AdminContentRow) => void;
  onEdit: (row: AdminContentRow) => void;
  onDelete: (row: AdminContentRow) => void;
};

/**
 * Liste des contenus du back-office (blog, actualités, activités).
 * Rendu en cartes empilées : lisible sur mobile sans table scrollable.
 */
export default function AdminContentTable({
  rows,
  emptyMessage,
  togglingId,
  onTogglePublish,
  onEdit,
  onDelete,
}: AdminContentTableProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="relative w-full sm:w-24 h-36 sm:h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
            {row.image ? (
              <Image src={row.image} alt="" fill className="object-cover" sizes="96px" />
            ) : (
              <ImageOff className="w-5 h-5 text-gray-400" aria-label="Sans image" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{row.title}</p>
            {row.meta && <div className="text-sm text-gray-500 mt-0.5">{row.meta}</div>}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge
              variant={row.is_published ? 'default' : 'secondary'}
              className={
                row.is_published
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
              }
            >
              {row.is_published ? 'Publié' : 'Brouillon'}
            </Badge>
            <Switch
              checked={row.is_published}
              disabled={togglingId === row.id}
              onCheckedChange={() => onTogglePublish(row)}
              aria-label={row.is_published ? 'Dépublier' : 'Publier'}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(row)}
              aria-label={`Modifier « ${row.title} »`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(row)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label={`Supprimer « ${row.title} »`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

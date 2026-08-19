'use client';

import type { ReactNode } from 'react';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type OrgItemCardProps = {
  /** Visuel de gauche : logo, photo ou icône colorée. */
  visual: ReactNode;
  title: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** Carte de liste commune aux quatre onglets de /admin/organisation. */
export default function OrgItemCard({
  visual,
  title,
  subtitle,
  order,
  isActive,
  onToggleActive,
  onEdit,
  onDelete,
}: OrgItemCardProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-colors ${
        isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
      }`}
    >
      <span className="hidden sm:flex items-center gap-1 text-gray-300 text-xs font-semibold shrink-0">
        <GripVertical className="w-4 h-4" />
        {order}
      </span>

      <div className="shrink-0">{visual}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{title}</p>
          {!isActive && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 shrink-0">
              Masqué
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={isActive}
          onCheckedChange={onToggleActive}
          aria-label={isActive ? 'Masquer du public' : 'Rendre public'}
        />
        <Button variant="outline" size="icon" onClick={onEdit} aria-label="Modifier">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

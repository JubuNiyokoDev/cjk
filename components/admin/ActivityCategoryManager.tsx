'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AdminApiError,
  createActivityCategory,
  deleteActivityCategory,
  updateActivityCategory,
} from '@/lib/admin-api';
import { ACTIVITY_COLOR_GRADIENTS } from '@/lib/content';
import { cn } from '@/lib/utils';
import type { ActivityCategory, ActivityCategoryColor } from '@/lib/types';

const COLORS = Object.keys(ACTIVITY_COLOR_GRADIENTS) as ActivityCategoryColor[];

type ActivityCategoryManagerProps = {
  categories: ActivityCategory[];
  onChange: (categories: ActivityCategory[]) => void;
};

/** Sélecteur de couleur du badge : pastilles reprenant le dégradé du site public. */
function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: ActivityCategoryColor;
  onChange: (color: ActivityCategoryColor) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'w-7 h-7 rounded-full bg-gradient-to-br transition-transform hover:scale-110',
            ACTIVITY_COLOR_GRADIENTS[color],
            value === color
              ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
              : 'ring-1 ring-inset ring-black/10'
          )}
        />
      ))}
    </div>
  );
}

/**
 * CRUD des catégories d'activités.
 *
 * Le slug est figé côté API après création : renommer une catégorie change son
 * libellé partout, mais les activités déjà classées restent rattachées.
 */
export default function ActivityCategoryManager({
  categories,
  onChange,
}: ActivityCategoryManagerProps) {
  const { toast } = useToast();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<ActivityCategoryColor>('orange');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ActivityCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showError = (error: unknown, fallback: string) => {
    const message = error instanceof AdminApiError ? error.message : fallback;
    toast({ title: 'Erreur', description: message, variant: 'destructive' });
  };

  /** Applique une mise à jour partielle et remplace la ligne dans la liste. */
  const patch = async (
    category: ActivityCategory,
    input: Partial<Pick<ActivityCategory, 'name' | 'color' | 'order' | 'is_active'>>,
    successTitle?: string
  ) => {
    setSavingId(category.id);
    try {
      const updated = await updateActivityCategory(category.id, input);
      onChange(categories.map((item) => (item.id === updated.id ? updated : item)));
      if (successTitle) toast({ title: successTitle, description: updated.name });
      return true;
    } catch (error) {
      showError(error, 'Impossible de mettre à jour la catégorie.');
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setSavingId('new');
    try {
      const created = await createActivityCategory({
        name,
        color: newColor,
        order: categories.length + 1,
      });
      onChange([...categories, created]);
      setNewName('');
      toast({ title: 'Catégorie créée', description: created.name });
    } catch (error) {
      showError(error, 'Impossible de créer la catégorie.');
    } finally {
      setSavingId(null);
    }
  };

  const handleRename = async (category: ActivityCategory) => {
    const name = editingName.trim();
    if (!name || name === category.name) {
      setEditingId(null);
      return;
    }
    if (await patch(category, { name }, 'Catégorie renommée')) setEditingId(null);
  };

  /** Échange l'ordre avec la ligne voisine pour remonter/descendre la catégorie. */
  const handleMove = async (index: number, direction: -1 | 1) => {
    const current = categories[index];
    const neighbour = categories[index + direction];
    if (!current || !neighbour) return;
    setSavingId(current.id);
    try {
      const [movedCurrent, movedNeighbour] = await Promise.all([
        updateActivityCategory(current.id, { order: neighbour.order }),
        updateActivityCategory(neighbour.id, { order: current.order }),
      ]);
      const next = [...categories];
      next[index] = movedNeighbour;
      next[index + direction] = movedCurrent;
      onChange(next);
    } catch (error) {
      showError(error, "Impossible de réordonner les catégories.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteActivityCategory(deleting.id);
      onChange(categories.filter((item) => item.id !== deleting.id));
      toast({ title: 'Catégorie supprimée', description: deleting.name });
      setDeleting(null);
    } catch (error) {
      showError(error, 'Impossible de supprimer la catégorie.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-3xl">
      <div className="pb-6 mb-6 border-b border-gray-100">
        <p className="font-medium text-gray-900 mb-3">Nouvelle catégorie</p>
        <div className="flex gap-2 mb-3">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nom de la catégorie (ex. Musique)"
            onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            disabled={savingId === 'new' || !newName.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-shrink-0"
          >
            {savingId === 'new' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Ajouter</span>
          </Button>
        </div>
        <ColorPicker
          value={newColor}
          onChange={setNewColor}
          label="Couleur de la nouvelle catégorie"
        />
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune catégorie.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {categories.map((category, index) => (
            <li key={category.id} className="py-4">
              <div className="flex items-center gap-2">
                {editingId === category.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleRename(category)}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRename(category)}
                      disabled={savingId === category.id}
                    >
                      {savingId === category.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Enregistrer'
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        'w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0',
                        ACTIVITY_COLOR_GRADIENTS[category.color]
                      )}
                      aria-hidden
                    />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'block font-medium truncate',
                          category.is_active ? 'text-gray-900' : 'text-gray-400 line-through'
                        )}
                      >
                        {category.name}
                      </span>
                      <span className="block text-xs text-gray-500 truncate">
                        /activities?activity_type={category.slug}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || savingId === category.id}
                      aria-label={`Remonter « ${category.name} »`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === categories.length - 1 || savingId === category.id}
                      aria-label={`Descendre « ${category.name} »`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        patch(
                          category,
                          { is_active: !category.is_active },
                          category.is_active ? 'Catégorie masquée' : 'Catégorie affichée'
                        )
                      }
                      disabled={savingId === category.id}
                      aria-label={
                        category.is_active
                          ? `Masquer « ${category.name} » du site public`
                          : `Afficher « ${category.name} » sur le site public`
                      }
                    >
                      {category.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      aria-label={`Renommer « ${category.name} »`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleting(category)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Supprimer « ${category.name} »`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {editingId !== category.id && (
                <div className="mt-3 pl-10">
                  <ColorPicker
                    value={category.color}
                    onChange={(color) => patch(category, { color })}
                    label={`Couleur de « ${category.name} »`}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteDialog
        open={deleting !== null}
        itemLabel={deleting?.name ?? ''}
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

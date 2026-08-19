'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminApiError } from '@/lib/admin-api';

type OrgCrudApi<T, I> = {
  list: () => Promise<T[]>;
  create: (input: I) => Promise<T>;
  update: (id: number, input: I) => Promise<T>;
  remove: (id: number) => Promise<void>;
};

type OrgCrudLabels = {
  /** Nom singulier affiché dans les toasts (ex : « Partenaire »). */
  singular: string;
  /** « le » / « la » pour accorder les messages. */
  article: 'le' | 'la';
};

/**
 * État + actions CRUD partagés par les quatre onglets de la page
 * /admin/organisation (liste, modale création/édition, suppression),
 * avec toasts et erreurs de champ DRF.
 */
export function useOrgCrud<T extends { id: number }, I>(
  api: OrgCrudApi<T, I>,
  labels: OrgCrudLabels,
  enabled: boolean,
) {
  const { toast } = useToast();

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showError = useCallback(
    (error: unknown, fallback: string) => {
      const message = error instanceof AdminApiError ? error.message : fallback;
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    },
    [toast],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await api.list());
    } catch (error: unknown) {
      showError(error, 'Impossible de charger la liste.');
    } finally {
      setIsLoading(false);
    }
    // api est stable (fonctions module-level passées une fois)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showError]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const openCreate = () => {
    setEditingItem(null);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingItem(null);
    setFieldErrors({});
  };

  const save = async (input: I) => {
    setIsSaving(true);
    setFieldErrors({});
    try {
      if (editingItem) {
        await api.update(editingItem.id, input);
        toast({ title: 'Succès', description: `${labels.singular} mis(e) à jour.` });
      } else {
        await api.create(input);
        toast({ title: 'Succès', description: `${labels.singular} ajouté(e).` });
      }
      setIsFormOpen(false);
      setEditingItem(null);
      await load();
    } catch (error: unknown) {
      if (error instanceof AdminApiError) setFieldErrors(error.fieldErrors);
      showError(error, `Impossible d'enregistrer ${labels.article} ${labels.singular.toLowerCase()}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await api.remove(deletingItem.id);
      toast({ title: 'Succès', description: `${labels.singular} supprimé(e).` });
      setDeletingItem(null);
      await load();
    } catch (error: unknown) {
      showError(error, `Impossible de supprimer ${labels.article} ${labels.singular.toLowerCase()}.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActive = async (item: T & { is_active?: boolean }) => {
    try {
      await api.update(item.id, { is_active: !item.is_active } as I);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !item.is_active } : i)),
      );
    } catch (error: unknown) {
      showError(error, 'Impossible de changer la visibilité.');
    }
  };

  return {
    items,
    isLoading,
    isFormOpen,
    editingItem,
    isSaving,
    fieldErrors,
    deletingItem,
    isDeleting,
    openCreate,
    openEdit,
    closeForm,
    save,
    setDeletingItem,
    confirmDelete,
    toggleActive,
  };
}

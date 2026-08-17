'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminContentTable, { type AdminContentRow } from '@/components/admin/AdminContentTable';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { FormField, ImageField } from '@/components/admin/form-fields';
import ContentEditor from '@/components/ui/content-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useToast } from '@/hooks/use-toast';
import {
  AdminApiError,
  createNews,
  deleteNews,
  listAdminNews,
  togglePublish,
  updateNews,
} from '@/lib/admin-api';
import type { NewsItem } from '@/lib/types';

type NewsFormState = {
  title: string;
  content: string;
  is_published: boolean;
  image: File | null | undefined;
};

const emptyForm: NewsFormState = {
  title: '',
  content: '',
  is_published: false,
  image: undefined,
};

export default function AdminNewsPage() {
  const { isAuthenticated, isOfficialMember } = useAuthSession();
  const { toast } = useToast();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<NewsFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showError = useCallback(
    (error: unknown, fallback: string) => {
      const message = error instanceof AdminApiError ? error.message : fallback;
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    },
    [toast]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setNews(await listAdminNews());
    } catch (error) {
      showError(error, 'Impossible de charger les actualités.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isAuthenticated || !isOfficialMember) return;
    loadData();
  }, [isAuthenticated, isOfficialMember, loadData]);

  const openCreateForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (item: NewsItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      is_published: item.is_published,
      image: undefined,
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le titre et le contenu sont obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content,
        is_published: form.is_published,
        image: form.image,
      };

      if (editingItem) {
        await updateNews(editingItem.id, payload);
        toast({ title: 'Actualité mise à jour', description: form.title });
      } else {
        await createNews(payload);
        toast({ title: 'Actualité créée', description: form.title });
      }
      setIsFormOpen(false);
      await loadData();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFieldErrors(error.fieldErrors);
      }
      showError(error, "Impossible d'enregistrer l'actualité.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (row: AdminContentRow) => {
    setTogglingId(row.id);
    try {
      await togglePublish('news', row.id, !row.is_published);
      setNews((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, is_published: !row.is_published } : item
        )
      );
      toast({
        title: row.is_published ? 'Actualité dépubliée' : 'Actualité publiée',
        description: row.title,
      });
    } catch (error) {
      showError(error, 'Impossible de changer le statut de publication.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteNews(deletingItem.id);
      setNews((current) => current.filter((item) => item.id !== deletingItem.id));
      toast({ title: 'Actualité supprimée', description: deletingItem.title });
      setDeletingItem(null);
    } catch (error) {
      showError(error, "Impossible de supprimer l'actualité.");
    } finally {
      setIsDeleting(false);
    }
  };

  const rows: AdminContentRow[] = news.map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    is_published: item.is_published,
    meta: <span>{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>,
  }));

  return (
    <AdminShell
      title="Actualités"
      description="Publiez les annonces et nouvelles du Centre Jeunes Kamenge."
      actions={
        <Button
          onClick={openCreateForm}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle actualité
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <AdminContentTable
          rows={rows}
          emptyMessage="Aucune actualité pour le moment. Publiez votre première annonce !"
          togglingId={togglingId}
          onTogglePublish={handleTogglePublish}
          onEdit={(row) => {
            const item = news.find((entry) => entry.id === row.id);
            if (item) openEditForm(item);
          }}
          onDelete={(row) => {
            const item = news.find((entry) => entry.id === row.id);
            if (item) setDeletingItem(item);
          }}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSaving && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier l'actualité" : 'Nouvelle actualité'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <FormField label="Titre" htmlFor="news-title" required errors={fieldErrors.title}>
              <Input
                id="news-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Titre de l'actualité"
              />
            </FormField>

            <FormField label="Contenu" required errors={fieldErrors.content}>
              <ContentEditor
                value={form.content}
                onChange={(value) => setForm({ ...form, content: value })}
              />
            </FormField>

            <ImageField
              existingUrl={editingItem?.image}
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              errors={fieldErrors.image}
            />

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Publier immédiatement</p>
                <p className="text-sm text-gray-500">
                  Sinon l&apos;actualité restera en brouillon.
                </p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deletingItem !== null}
        itemLabel={deletingItem?.title ?? ''}
        isDeleting={isDeleting}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </AdminShell>
  );
}

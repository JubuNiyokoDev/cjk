'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminContentTable, { type AdminContentRow } from '@/components/admin/AdminContentTable';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { FormField, ImageField } from '@/components/admin/form-fields';
import ContentEditor from '@/components/ui/content-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useToast } from '@/hooks/use-toast';
import {
  ACTIVITY_TYPES,
  AdminApiError,
  createActivity,
  deleteActivity,
  listAdminActivities,
  togglePublish,
  updateActivity,
} from '@/lib/admin-api';
import type { Activity } from '@/lib/types';

const ALL_TYPES = 'all';

type ActivityFormState = {
  title: string;
  description: string;
  activity_type: string;
  date_activite: string;
  is_published: boolean;
  image: File | null | undefined;
};

const emptyForm: ActivityFormState = {
  title: '',
  description: '',
  activity_type: 'formation',
  date_activite: '',
  is_published: false,
  image: undefined,
};

function activityTypeLabel(value: string): string {
  return ACTIVITY_TYPES.find((type) => type.value === value)?.label ?? value;
}

export default function AdminActivitiesPage() {
  const { isAuthenticated, isOfficialMember } = useAuthSession();
  const { toast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItem, setDeletingItem] = useState<Activity | null>(null);
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
      setActivities(await listAdminActivities());
    } catch (error) {
      showError(error, 'Impossible de charger les activités.');
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

  const openEditForm = (item: Activity) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      activity_type: item.activity_type,
      date_activite: item.date_activite ? item.date_activite.slice(0, 10) : '',
      is_published: item.is_published,
      image: undefined,
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.date_activite) {
      toast({
        title: 'Champs requis',
        description: 'Le titre, la description et la date sont obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        activity_type: form.activity_type,
        date_activite: form.date_activite,
        is_published: form.is_published,
        image: form.image,
      };

      if (editingItem) {
        await updateActivity(editingItem.id, payload);
        toast({ title: 'Activité mise à jour', description: form.title });
      } else {
        await createActivity(payload);
        toast({ title: 'Activité créée', description: form.title });
      }
      setIsFormOpen(false);
      await loadData();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFieldErrors(error.fieldErrors);
      }
      showError(error, "Impossible d'enregistrer l'activité.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (row: AdminContentRow) => {
    setTogglingId(row.id);
    try {
      await togglePublish('activity', row.id, !row.is_published);
      setActivities((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, is_published: !row.is_published } : item
        )
      );
      toast({
        title: row.is_published ? 'Activité dépubliée' : 'Activité publiée',
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
      await deleteActivity(deletingItem.id);
      setActivities((current) => current.filter((item) => item.id !== deletingItem.id));
      toast({ title: 'Activité supprimée', description: deletingItem.title });
      setDeletingItem(null);
    } catch (error) {
      showError(error, "Impossible de supprimer l'activité.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredActivities = useMemo(
    () =>
      typeFilter === ALL_TYPES
        ? activities
        : activities.filter((item) => item.activity_type === typeFilter),
    [activities, typeFilter]
  );

  const rows: AdminContentRow[] = filteredActivities.map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    is_published: item.is_published,
    meta: (
      <span className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="font-normal">
          {activityTypeLabel(item.activity_type)}
        </Badge>
        {item.date_activite && (
          <span>{new Date(item.date_activite).toLocaleDateString('fr-FR')}</span>
        )}
      </span>
    ),
  }));

  return (
    <AdminShell
      title="Activités & Formations"
      description="Gérez les événements, activités sportives, culturelles et formations du Centre."
      actions={
        <Button
          onClick={openCreateForm}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle activité
        </Button>
      }
    >
      <div className="mb-6 max-w-xs">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger aria-label="Filtrer par type">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>Tous les types</SelectItem>
            {ACTIVITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <AdminContentTable
          rows={rows}
          emptyMessage={
            typeFilter === ALL_TYPES
              ? 'Aucune activité pour le moment. Créez la première !'
              : `Aucune activité de type « ${activityTypeLabel(typeFilter)} ».`
          }
          togglingId={togglingId}
          onTogglePublish={handleTogglePublish}
          onEdit={(row) => {
            const item = activities.find((entry) => entry.id === row.id);
            if (item) openEditForm(item);
          }}
          onDelete={(row) => {
            const item = activities.find((entry) => entry.id === row.id);
            if (item) setDeletingItem(item);
          }}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSaving && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier l'activité" : 'Nouvelle activité'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <FormField label="Titre" htmlFor="activity-title" required errors={fieldErrors.title}>
              <Input
                id="activity-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Titre de l'activité"
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Type" required errors={fieldErrors.activity_type}>
                <Select
                  value={form.activity_type}
                  onValueChange={(value) => setForm({ ...form, activity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type d'activité" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Date"
                htmlFor="activity-date"
                required
                errors={fieldErrors.date_activite}
              >
                <Input
                  id="activity-date"
                  type="date"
                  value={form.date_activite}
                  onChange={(event) => setForm({ ...form, date_activite: event.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Description" required errors={fieldErrors.description}>
              <ContentEditor
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
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
                  Sinon l&apos;activité restera en brouillon.
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

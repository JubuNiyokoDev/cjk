'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { FormField } from '@/components/admin/form-fields';
import IconColorFields from '@/components/admin/organization/IconColorFields';
import OrgItemCard from '@/components/admin/organization/OrgItemCard';
import { useOrgCrud } from '@/components/admin/organization/use-org-crud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createValue,
  deleteValue,
  listAdminValues,
  updateValue,
  type CoreValueInput,
} from '@/lib/organization-api';
import { orgColor, orgIcon } from '@/lib/org-visuals';
import type { CoreValue } from '@/lib/types';

const api = {
  list: listAdminValues,
  create: createValue,
  update: updateValue,
  remove: deleteValue,
};

type FormState = {
  name: string;
  description: string;
  icon: string;
  color: string;
  order: string;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  icon: 'star',
  color: 'orange',
  order: '0',
};

/** Onglet CRUD des valeurs fondamentales (icône, couleur, ordre, visibilité). */
export default function ValuesTab({ enabled }: { enabled: boolean }) {
  const crud = useOrgCrud<CoreValue, CoreValueInput>(api, { singular: 'Valeur', article: 'la' }, enabled);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!crud.isFormOpen) return;
    const item = crud.editingItem;
    setForm(
      item
        ? {
            name: item.name,
            description: item.description ?? '',
            icon: item.icon || 'star',
            color: item.color || 'orange',
            order: String(item.order ?? 0),
          }
        : emptyForm,
    );
  }, [crud.isFormOpen, crud.editingItem]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    crud.save({
      name: form.name,
      description: form.description,
      icon: form.icon,
      color: form.color,
      order: Number(form.order) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={crud.openCreate}
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4" /> Ajouter une valeur
        </Button>
      </div>

      {crud.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : crud.items.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Aucune valeur pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {crud.items.map((value) => {
            const Icon = orgIcon(value.icon);
            return (
              <OrgItemCard
                key={value.id}
                visual={
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${orgColor(value.color)} flex items-center justify-center text-white`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                }
                title={value.name}
                subtitle={value.description}
                order={value.order}
                isActive={value.is_active}
                onToggleActive={() => crud.toggleActive(value)}
                onEdit={() => crud.openEdit(value)}
                onDelete={() => crud.setDeletingItem(value)}
              />
            );
          })}
        </div>
      )}

      <Dialog open={crud.isFormOpen} onOpenChange={(next) => !next && crud.closeForm()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{crud.editingItem ? 'Modifier la valeur' : 'Nouvelle valeur'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <FormField label="Nom" htmlFor="value-name" required errors={crud.fieldErrors.name}>
                <Input
                  id="value-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </FormField>
              <FormField label="Ordre" htmlFor="value-order" errors={crud.fieldErrors.order}>
                <Input
                  id="value-order"
                  type="number"
                  min={0}
                  className="w-24"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                />
              </FormField>
            </div>

            <IconColorFields
              icon={form.icon}
              color={form.color}
              onIconChange={(icon) => setForm((f) => ({ ...f, icon }))}
              onColorChange={(color) => setForm((f) => ({ ...f, color }))}
              errors={crud.fieldErrors}
            />

            <FormField label="Description" htmlFor="value-description" errors={crud.fieldErrors.description}>
              <Textarea
                id="value-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </FormField>

            <Button
              type="submit"
              disabled={crud.isSaving}
              className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {crud.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={crud.deletingItem !== null}
        itemLabel={crud.deletingItem?.name ?? ''}
        isDeleting={crud.isDeleting}
        onCancel={() => crud.setDeletingItem(null)}
        onConfirm={crud.confirmDelete}
      />
    </div>
  );
}

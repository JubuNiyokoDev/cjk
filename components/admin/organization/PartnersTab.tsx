'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Building2, Loader2, Plus, Save } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { FormField, ImageField } from '@/components/admin/form-fields';
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
  createPartner,
  deletePartner,
  listAdminPartners,
  updatePartner,
  type PartnerInput,
} from '@/lib/organization-api';
import type { Partner } from '@/lib/types';

const api = {
  list: listAdminPartners,
  create: createPartner,
  update: updatePartner,
  remove: deletePartner,
};

type FormState = {
  name: string;
  country: string;
  description: string;
  website: string;
  order: string;
  logo: File | null | undefined;
};

const emptyForm: FormState = {
  name: '',
  country: '',
  description: '',
  website: '',
  order: '0',
  logo: undefined,
};

/** Onglet CRUD des partenaires (logo, pays, site web, ordre, visibilité). */
export default function PartnersTab({ enabled }: { enabled: boolean }) {
  const crud = useOrgCrud<Partner, PartnerInput>(api, { singular: 'Partenaire', article: 'le' }, enabled);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!crud.isFormOpen) return;
    const item = crud.editingItem;
    setForm(
      item
        ? {
            name: item.name,
            country: item.country ?? '',
            description: item.description ?? '',
            website: item.website ?? '',
            order: String(item.order ?? 0),
            logo: undefined,
          }
        : emptyForm,
    );
  }, [crud.isFormOpen, crud.editingItem]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    crud.save({
      name: form.name,
      country: form.country,
      description: form.description,
      website: form.website,
      order: Number(form.order) || 0,
      ...(form.logo !== undefined ? { logo: form.logo } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={crud.openCreate}
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4" /> Ajouter un partenaire
        </Button>
      </div>

      {crud.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : crud.items.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Aucun partenaire pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {crud.items.map((partner) => (
            <OrgItemCard
              key={partner.id}
              visual={
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                  {partner.logo ? (
                    <Image src={partner.logo} alt={partner.name} fill className="object-contain p-1" sizes="48px" />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              }
              title={partner.name}
              subtitle={[partner.country, partner.website].filter(Boolean).join(' — ')}
              order={partner.order}
              isActive={partner.is_active}
              onToggleActive={() => crud.toggleActive(partner)}
              onEdit={() => crud.openEdit(partner)}
              onDelete={() => crud.setDeletingItem(partner)}
            />
          ))}
        </div>
      )}

      <Dialog open={crud.isFormOpen} onOpenChange={(next) => !next && crud.closeForm()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{crud.editingItem ? 'Modifier le partenaire' : 'Nouveau partenaire'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nom" htmlFor="partner-name" required errors={crud.fieldErrors.name}>
              <Input
                id="partner-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Pays" htmlFor="partner-country" errors={crud.fieldErrors.country}>
                <Input
                  id="partner-country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="Burundi"
                />
              </FormField>
              <FormField label="Ordre" htmlFor="partner-order" errors={crud.fieldErrors.order}>
                <Input
                  id="partner-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField label="Site web" htmlFor="partner-website" errors={crud.fieldErrors.website}>
              <Input
                id="partner-website"
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
              />
            </FormField>

            <FormField label="Description" htmlFor="partner-description" errors={crud.fieldErrors.description}>
              <Textarea
                id="partner-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </FormField>

            <ImageField
              label="Logo"
              existingUrl={crud.editingItem?.logo}
              value={form.logo}
              onChange={(logo) => setForm((f) => ({ ...f, logo }))}
              errors={crud.fieldErrors.logo}
            />

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

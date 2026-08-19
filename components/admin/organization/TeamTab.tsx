'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Save, User } from 'lucide-react';
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
  createTeamMember,
  deleteTeamMember,
  listAdminTeam,
  updateTeamMember,
  type TeamMemberInput,
} from '@/lib/organization-api';
import type { TeamMember } from '@/lib/types';

const api = {
  list: listAdminTeam,
  create: createTeamMember,
  update: updateTeamMember,
  remove: deleteTeamMember,
};

type FormState = {
  name: string;
  role: string;
  description: string;
  email: string;
  phone: string;
  order: string;
  photo: File | null | undefined;
};

const emptyForm: FormState = {
  name: '',
  role: '',
  description: '',
  email: '',
  phone: '',
  order: '0',
  photo: undefined,
};

/** Onglet CRUD de l'équipe (photo, rôle, contact, ordre, visibilité). */
export default function TeamTab({ enabled }: { enabled: boolean }) {
  const crud = useOrgCrud<TeamMember, TeamMemberInput>(api, { singular: 'Membre', article: 'le' }, enabled);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!crud.isFormOpen) return;
    const item = crud.editingItem;
    setForm(
      item
        ? {
            name: item.name,
            role: item.role ?? '',
            description: item.description ?? '',
            email: item.email ?? '',
            phone: item.phone ?? '',
            order: String(item.order ?? 0),
            photo: undefined,
          }
        : emptyForm,
    );
  }, [crud.isFormOpen, crud.editingItem]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    crud.save({
      name: form.name,
      role: form.role,
      description: form.description,
      email: form.email,
      phone: form.phone,
      order: Number(form.order) || 0,
      ...(form.photo !== undefined ? { photo: form.photo } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={crud.openCreate}
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4" /> Ajouter un membre
        </Button>
      </div>

      {crud.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : crud.items.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Aucun membre pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {crud.items.map((member) => (
            <OrgItemCard
              key={member.id}
              visual={
                <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <User className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              }
              title={member.name}
              subtitle={[member.role, member.email].filter(Boolean).join(' — ')}
              order={member.order}
              isActive={member.is_active}
              onToggleActive={() => crud.toggleActive(member)}
              onEdit={() => crud.openEdit(member)}
              onDelete={() => crud.setDeletingItem(member)}
            />
          ))}
        </div>
      )}

      <Dialog open={crud.isFormOpen} onOpenChange={(next) => !next && crud.closeForm()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{crud.editingItem ? 'Modifier le membre' : 'Nouveau membre'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nom" htmlFor="team-name" required errors={crud.fieldErrors.name}>
                <Input
                  id="team-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </FormField>
              <FormField label="Rôle" htmlFor="team-role" required errors={crud.fieldErrors.role}>
                <Input
                  id="team-role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Coordinateur"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" htmlFor="team-email" errors={crud.fieldErrors.email}>
                <Input
                  id="team-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemple.com"
                />
              </FormField>
              <FormField label="Téléphone" htmlFor="team-phone" errors={crud.fieldErrors.phone}>
                <Input
                  id="team-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+257 ..."
                />
              </FormField>
            </div>

            <FormField label="Ordre" htmlFor="team-order" errors={crud.fieldErrors.order}>
              <Input
                id="team-order"
                type="number"
                min={0}
                className="w-24"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              />
            </FormField>

            <FormField label="Description" htmlFor="team-description" errors={crud.fieldErrors.description}>
              <Textarea
                id="team-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </FormField>

            <ImageField
              label="Photo"
              existingUrl={crud.editingItem?.photo}
              value={form.photo}
              onChange={(photo) => setForm((f) => ({ ...f, photo }))}
              errors={crud.fieldErrors.photo}
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

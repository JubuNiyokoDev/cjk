'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminContentTable, { type AdminContentRow } from '@/components/admin/AdminContentTable';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { FormField, ImageField } from '@/components/admin/form-fields';
import ContentEditor from '@/components/ui/content-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AdminApiError,
  createBlogPost,
  createCategory,
  deleteBlogPost,
  deleteCategory,
  listAdminBlogPosts,
  listAdminCategories,
  togglePublish,
  updateBlogPost,
  updateCategory,
} from '@/lib/admin-api';
import type { BlogCategory, BlogPost } from '@/lib/types';

const NO_CATEGORY = 'none';

type PostFormState = {
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  image: File | null | undefined;
};

const emptyPostForm: PostFormState = {
  title: '',
  content: '',
  category: NO_CATEGORY,
  is_published: false,
  image: undefined,
};

export default function AdminBlogPage() {
  const { isAuthenticated, isOfficialMember } = useAuthSession();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Formulaire article (création + édition dans la même modale)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<PostFormState>(emptyPostForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Suppression
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Catégories
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

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
      const [postList, categoryList] = await Promise.all([
        listAdminBlogPosts(),
        listAdminCategories(),
      ]);
      setPosts(postList);
      setCategories(categoryList);
    } catch (error) {
      showError(error, 'Impossible de charger les articles.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isAuthenticated || !isOfficialMember) return;
    loadData();
  }, [isAuthenticated, isOfficialMember, loadData]);

  /* ----------------------------- Articles ----------------------------- */

  const openCreateForm = () => {
    setEditingPost(null);
    setForm(emptyPostForm);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      category: post.category ? String(post.category) : NO_CATEGORY,
      is_published: post.is_published,
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
        category: form.category === NO_CATEGORY ? null : Number(form.category),
        is_published: form.is_published,
        image: form.image,
      };

      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
        toast({ title: 'Article mis à jour', description: form.title });
      } else {
        await createBlogPost(payload);
        toast({ title: 'Article créé', description: form.title });
      }
      setIsFormOpen(false);
      await loadData();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFieldErrors(error.fieldErrors);
      }
      showError(error, "Impossible d'enregistrer l'article.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (row: AdminContentRow) => {
    setTogglingId(row.id);
    try {
      await togglePublish('blog', row.id, !row.is_published);
      setPosts((current) =>
        current.map((post) =>
          post.id === row.id ? { ...post, is_published: !row.is_published } : post
        )
      );
      toast({
        title: row.is_published ? 'Article dépublié' : 'Article publié',
        description: row.title,
      });
    } catch (error) {
      showError(error, 'Impossible de changer le statut de publication.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(deletingPost.id);
      setPosts((current) => current.filter((post) => post.id !== deletingPost.id));
      toast({ title: 'Article supprimé', description: deletingPost.title });
      setDeletingPost(null);
    } catch (error) {
      showError(error, "Impossible de supprimer l'article.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------------------------- Catégories ---------------------------- */

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setIsSavingCategory(true);
    try {
      const created = await createCategory(name);
      setCategories((current) => [...current, created]);
      setNewCategoryName('');
      toast({ title: 'Catégorie créée', description: name });
    } catch (error) {
      showError(error, 'Impossible de créer la catégorie.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    const name = editingCategoryName.trim();
    if (!name) return;
    setIsSavingCategory(true);
    try {
      const updated = await updateCategory(editingCategory.id, name);
      setCategories((current) =>
        current.map((category) => (category.id === updated.id ? updated : category))
      );
      setEditingCategory(null);
      toast({ title: 'Catégorie renommée', description: name });
    } catch (error) {
      showError(error, 'Impossible de renommer la catégorie.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeletingCategory(true);
    try {
      await deleteCategory(deletingCategory.id);
      setCategories((current) =>
        current.filter((category) => category.id !== deletingCategory.id)
      );
      toast({ title: 'Catégorie supprimée', description: deletingCategory.name });
      setDeletingCategory(null);
    } catch (error) {
      showError(error, 'Impossible de supprimer la catégorie.');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  /* ------------------------------- Rendu ------------------------------ */

  const rows: AdminContentRow[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    image: post.image,
    is_published: post.is_published,
    meta: (
      <span>
        {post.category_name || 'Sans catégorie'} ·{' '}
        {new Date(post.created_at).toLocaleDateString('fr-FR')}
      </span>
    ),
  }));

  return (
    <AdminShell
      title="Blog"
      description="Rédigez, publiez et organisez les articles du blog."
      actions={
        <Button
          onClick={openCreateForm}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      }
    >
      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Articles ({posts.length})</TabsTrigger>
          <TabsTrigger value="categories">Catégories ({categories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <AdminContentTable
              rows={rows}
              emptyMessage="Aucun article pour le moment. Créez votre premier article !"
              togglingId={togglingId}
              onTogglePublish={handleTogglePublish}
              onEdit={(row) => {
                const post = posts.find((item) => item.id === row.id);
                if (post) openEditForm(post);
              }}
              onDelete={(row) => {
                const post = posts.find((item) => item.id === row.id);
                if (post) setDeletingPost(post);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl">
            <div className="flex gap-2 mb-6">
              <Input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Nom de la nouvelle catégorie"
                onKeyDown={(event) => event.key === 'Enter' && handleCreateCategory()}
              />
              <Button
                onClick={handleCreateCategory}
                disabled={isSavingCategory || !newCategoryName.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-shrink-0"
              >
                {isSavingCategory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Ajouter</span>
              </Button>
            </div>

            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune catégorie.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center gap-2 py-3">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Input
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && handleUpdateCategory()}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateCategory}
                          disabled={isSavingCategory}
                        >
                          {isSavingCategory ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Enregistrer'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-gray-900">{category.name}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditingCategoryName(category.name);
                          }}
                          aria-label={`Renommer « ${category.name} »`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingCategory(category)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Supprimer « ${category.name} »`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modale création / édition d'article */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSaving && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <FormField label="Titre" htmlFor="post-title" required errors={fieldErrors.title}>
              <Input
                id="post-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Titre de l'article"
              />
            </FormField>

            <FormField label="Catégorie" errors={fieldErrors.category}>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>Sans catégorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Contenu" required errors={fieldErrors.content}>
              <ContentEditor
                value={form.content}
                onChange={(value) => setForm({ ...form, content: value })}
              />
            </FormField>

            <ImageField
              existingUrl={editingPost?.image}
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              errors={fieldErrors.image}
            />

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Publier immédiatement</p>
                <p className="text-sm text-gray-500">
                  Sinon l&apos;article restera en brouillon.
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
                {editingPost ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deletingPost !== null}
        itemLabel={deletingPost?.title ?? ''}
        isDeleting={isDeleting}
        onCancel={() => setDeletingPost(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={deletingCategory !== null}
        itemLabel={deletingCategory?.name ?? ''}
        isDeleting={isDeletingCategory}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
      />
    </AdminShell>
  );
}

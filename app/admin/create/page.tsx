'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContentEditor from '@/components/ui/content-editor';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { useAuthSession } from '@/hooks/use-auth-session';
import { API_BASE_URL, getActivity, getBlogCategories, getBlogPost, getNewsItem, safeFetch } from '@/lib/api';
import { resolveImageUrl } from '@/lib/content';
import { useToast } from '@/hooks/use-toast';
import type { BlogCategory } from '@/lib/types';

const CONTENT_TYPES = ['blog', 'activity', 'news'] as const;

type ContentType = typeof CONTENT_TYPES[number];

function isContentType(value: string | null): value is ContentType {
  return value !== null && (CONTENT_TYPES as readonly string[]).includes(value);
}

function toDateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toTitle(type: ContentType) {
  if (type === 'activity') return 'Activite';
  if (type === 'news') return 'Actualite';
  return 'Blog';
}

export default function AdminCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isOfficialMember, isLoading } = useAuthSession();
  const { toast } = useToast();

  const [contentType, setContentType] = useState<ContentType>('blog');
  const [editId, setEditId] = useState<number | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('autre');
  const [activityDate, setActivityDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const isEditing = editId !== null;
  const pageTitle = useMemo(() => {
    const action = isEditing ? 'Modifier' : 'Creer';
    return `${action} un contenu ${toTitle(contentType)}`;
  }, [contentType, isEditing]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!isOfficialMember) {
      router.replace('/unauthorized');
      return;
    }
  }, [isAuthenticated, isOfficialMember, isLoading, router]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const idParam = searchParams.get('id');
    const nextType = isContentType(typeParam) ? typeParam : 'blog';
    const parsedId = idParam ? Number(idParam) : null;
    const nextId = parsedId && Number.isFinite(parsedId) ? parsedId : null;
    setContentType(nextType);
    setEditId(nextId);
  }, [searchParams]);

  useEffect(() => {
    if (contentType !== 'blog') return;
    getBlogCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [contentType]);

  useEffect(() => {
    if (!editId) {
      setTitle('');
      setContent('');
      setDescription('');
      setActivityType('autre');
      setActivityDate('');
      setCategoryId('');
      setIsPublished(false);
      setImageFile(null);
      setExistingImageUrl(null);
      return;
    }

    const loadItem = async () => {
      setLoadingItem(true);
      setImageFile(null);
      setExistingImageUrl(null);
      try {
        if (contentType === 'blog') {
          const post = await getBlogPost(editId);
          setTitle(post.title ?? '');
          setContent(post.content ?? '');
          setCategoryId(post.category ? String(post.category) : '');
          setIsPublished(Boolean(post.is_published));
          setExistingImageUrl(resolveImageUrl(API_BASE_URL, post.image));
        } else if (contentType === 'news') {
          const news = await getNewsItem(editId);
          setTitle(news.title ?? '');
          setContent(news.content ?? '');
          setIsPublished(Boolean(news.is_published));
          setExistingImageUrl(resolveImageUrl(API_BASE_URL, news.image));
        } else {
          const activity = await getActivity(editId);
          setTitle(activity.title ?? '');
          setDescription(activity.description ?? '');
          setActivityType(activity.activity_type ?? 'autre');
          setActivityDate(toDateInputValue(activity.date_activite));
          setIsPublished(Boolean(activity.is_published));
          setExistingImageUrl(resolveImageUrl(API_BASE_URL, activity.image));
        }
      } catch (error) {
        toast({
          title: 'Erreur',
          description: "Impossible de charger l'element.",
          variant: 'destructive',
        });
      } finally {
        setLoadingItem(false);
      }
    };

    void loadItem();
  }, [contentType, editId, toast]);

  const validateForm = () => {
    if (!title.trim()) {
      toast({ title: 'Titre requis', description: 'Ajoutez un titre avant de continuer.', variant: 'destructive' });
      return false;
    }
    if (contentType === 'activity') {
      if (!description.trim()) {
        toast({ title: 'Description requise', description: 'Ajoutez une description.', variant: 'destructive' });
        return false;
      }
    } else if (!content.trim()) {
      toast({ title: 'Contenu requis', description: 'Ajoutez un contenu.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append('title', title.trim());
    data.append('is_published', isPublished ? 'true' : 'false');

    if (contentType === 'blog') {
      data.append('content', content);
      if (categoryId) data.append('category', categoryId);
    }

    if (contentType === 'news') {
      data.append('content', content);
    }

    if (contentType === 'activity') {
      data.append('description', description);
      data.append('activity_type', activityType || 'autre');
      if (activityDate) data.append('date_activite', activityDate);
    }

    if (imageFile) {
      data.append('image', imageFile);
    }

    return data;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    const basePath = contentType === 'blog'
      ? '/api/blog/posts/'
      : contentType === 'news'
        ? '/api/news/'
        : '/api/activities/';

    const path = editId ? `${basePath}${editId}/` : basePath;

    try {
      const payload = buildFormData();
      await safeFetch(path, payload, { method: editId ? 'PATCH' : 'POST' });

      toast({
        title: editId ? 'Modifie' : 'Cree',
        description: editId ? 'Le contenu a ete mis a jour.' : 'Le contenu a ete cree avec succes.',
      });

      if (!editId) {
        setTitle('');
        setContent('');
        setDescription('');
        setActivityType('autre');
        setActivityDate('');
        setCategoryId('');
        setIsPublished(false);
        setImageFile(null);
        setExistingImageUrl(null);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'La sauvegarde a echoue. Verifiez les champs et reessayez.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingItem) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Chargement du formulaire...</p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-sm uppercase tracking-widest text-orange-500 font-semibold">Espace Administration</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">
              Renseignez les informations ci-dessous pour publier un contenu blog, une activite ou une actualite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Type de contenu</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  disabled={isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-100"
                >
                  <option value="blog">Blog</option>
                  <option value="activity">Activite</option>
                  <option value="news">Actualite</option>
                </select>
                {isEditing && (
                  <p className="text-xs text-gray-400">Le type ne peut pas etre modifie en edition.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Titre</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre du contenu"
                  required
                />
              </div>
            </div>

            {contentType === 'blog' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Categorie</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Selectionner une categorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {contentType === 'activity' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type d'activite</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  >
                    <option value="sport">Sport</option>
                    <option value="culture">Culture</option>
                    <option value="formation">Formation</option>
                    <option value="paix">Paix</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date de l'activite</label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {contentType === 'activity' ? 'Description' : 'Contenu'}
              </label>
              <ContentEditor
                value={contentType === 'activity' ? description : content}
                onChange={(val) => {
                  if (contentType === 'activity') {
                    setDescription(val);
                  } else {
                    setContent(val);
                  }
                }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Image principale</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
                <ImagePreview file={imageFile} />
                {!imageFile && existingImageUrl && (
                  <div className="mt-2">
                    <img
                      src={existingImageUrl}
                      alt="Image actuelle"
                      className="w-full max-w-xs rounded-xl border border-gray-200 shadow"
                    />
                    <p className="text-xs text-gray-500 mt-1">Image actuelle</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Publication</label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Publier immediatement</span>
                </div>
                <p className="text-xs text-gray-400">Vous pouvez publier ou depublier plus tard.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Creer'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
              >
                Retour au profil
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import MultiImageSelector from '@/components/ui/multi-image-selector';
import dynamic from 'next/dynamic';
const ContentEditor = dynamic(() => import('@/components/ui/content-editor'), { ssr: false });
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { API_BASE_URL, getBlogCategories } from '@/lib/api';
import { getTokens } from '@/lib/auth';
import { motion } from 'framer-motion';
import type { BlogCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'blog' | 'activity' | 'news';

export default function CreateContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const editId = searchParams.get('id');
  const editType = searchParams.get('type') as ContentType | null;
  const isEditMode = !!editId;
  
  const [contentType, setContentType] = useState<ContentType>(editType || 'blog');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
    activity_type: 'sport',
    date_activite: '',
    image: null as File | null,
  });
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens?.access) {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (contentType === 'blog') {
      getBlogCategories().then(setCategories).catch(() => {});
    }
  }, [contentType]);

  useEffect(() => {
    if (isEditMode && editId) {
      const toastId = toast({ title: 'Chargement...', description: 'Récupération des données' });
      const endpoint = contentType === 'blog' ? `/api/blog/posts/${editId}/` : 
                       contentType === 'activity' ? `/api/activities/${editId}/` : 
                       `/api/news/${editId}/`;
      
      const tokens = getTokens();
      fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Erreur de chargement');
          return res.json();
        })
        .then(data => {
          setFormData({
            title: data.title || '',
            content: data.content || '',
            description: data.description || '',
            category: data.category?.toString() || '',
            activity_type: data.activity_type || 'sport',
            date_activite: data.date_activite || '',
            image: null,
          });
          toastId.update({ id: toastId.id, title: 'Chargé', description: 'Données récupérées avec succès' });
        })
        .catch(() => {
          toastId.update({ id: toastId.id, title: 'Erreur', description: 'Échec du chargement', variant: 'destructive' });
        });
    }
  }, [isEditMode, editId, contentType, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const toastId = toast({ 
      title: 'En cours...', 
      description: isEditMode ? 'Mise à jour du contenu' : 'Création du contenu' 
    });

    try {
      const tokens = getTokens();
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      
      if (!isEditMode) {
        const slug = formData.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        formDataToSend.append('slug', slug);
      }
      
      if (contentType === 'blog') {
        formDataToSend.append('content', formData.content);
        formDataToSend.append('category', formData.category);
      } else if (contentType === 'activity') {
        formDataToSend.append('description', formData.description);
        formDataToSend.append('activity_type', formData.activity_type);
        if (formData.date_activite) {
          formDataToSend.append('date_activite', formData.date_activite);
        }
      } else if (contentType === 'news') {
        formDataToSend.append('content', formData.content);
      }

      if (images.length > 0) {
        formDataToSend.append('image', images[0]);
      }

      const endpoint = contentType === 'blog' ? '/api/blog/posts/' : 
                       contentType === 'activity' ? '/api/activities/' : 
                       '/api/news/';

      const url = isEditMode ? `${API_BASE_URL}${endpoint}${editId}/` : `${API_BASE_URL}${endpoint}`;
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${isEditMode ? 'la mise à jour' : 'la création'}`);
      }

      const successMsg = `Contenu ${isEditMode ? 'mis à jour' : 'créé'} avec succès !`;
      setMessage(successMsg);
      toastId.update({ 
        id: toastId.id, 
        title: isEditMode ? 'Mis à jour' : 'Créé', 
        description: successMsg 
      });
      
      if (!isEditMode) {
        setFormData({
          title: '',
          content: '',
          description: '',
          category: '',
          activity_type: 'sport',
          date_activite: '',
          image: null,
        });
        setImages([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : `Erreur lors de ${isEditMode ? 'la mise à jour' : 'la création'}`;
      setMessage(errorMsg);
      toastId.update({ 
        id: toastId.id, 
        title: 'Erreur', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {isEditMode ? 'Modifier le contenu' : 'Créer du contenu'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Modifiez votre contenu' : 'Publiez des articles, activités ou actualités'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Type de contenu */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Type de contenu
              </label>
              <div className="flex gap-4">
                {(['blog', 'activity', 'news'] as ContentType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContentType(type)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      contentType === type
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'blog' ? 'Article' : type === 'activity' ? 'Activité' : 'Actualité'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Contenu (Blog & News) */}
              {(contentType === 'blog' || contentType === 'news') && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Contenu</label>
                  <ContentEditor
                    value={formData.content}
                    onChange={(val) => setFormData({ ...formData, content: val || '' })}
                    className="mt-1 w-full"
                  />
                </div>
              )}

              {/* Description (Activity) */}
              {contentType === 'activity' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Type d'activité</label>
                      <select
                        value={formData.activity_type}
                        onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="sport">Sport</option>
                        <option value="culture">Culture</option>
                        <option value="formation">Formation</option>
                        <option value="paix">Paix</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Date de l'activité</label>
                      <input
                        type="date"
                        value={formData.date_activite}
                        onChange={(e) => setFormData({ ...formData, date_activite: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Catégorie (Blog) */}
              {contentType === 'blog' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Image */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Image</label>
                <MultiImageSelector files={images} setFiles={setImages} max={5} className="mb-2" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {isLoading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer le contenu')}
              </button>
            </form>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-sm font-semibold ${
                  message.includes('succès') ? 'text-green-600' : 'text-red-600'
                } bg-${message.includes('succès') ? 'green' : 'red'}-50 px-4 py-2 rounded-lg`}
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, X, Play, Plus, Trash2, GripVertical, Edit2, Check } from 'lucide-react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useRouter } from 'next/navigation';
import { safeFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type MediaType = 'all' | 'photos' | 'videos';

interface GalleryItem {
  _id: string;
  id?: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  height: 'short' | 'medium' | 'tall';
  order: number;
}

interface GalleryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryItem[];
}

function SortableGalleryItem({ item, onEdit, onDelete }: { item: GalleryItem; onEdit: (item: GalleryItem) => void; onDelete: (item: GalleryItem) => void }) {
  const itemId = item._id ?? item.id ?? '';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: itemId });
  const heightClasses = { short: 'h-64', medium: 'h-80', tall: 'h-96' };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ rotate: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow break-inside-avoid mb-3"
    >
      <>
          <button {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-2 bg-black/60 hover:bg-black/80 rounded-full cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="absolute top-2 right-12 z-20 p-2 bg-blue-600 hover:bg-blue-700 rounded-full">
            <Edit2 className="w-4 h-4 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="absolute top-2 right-2 z-20 p-2 bg-red-600 hover:bg-red-700 rounded-full">
            <Trash2 className="w-4 h-4 text-white" />
          </button>
      </>
      <div className={`${heightClasses[item.height]} w-full relative`} style={{ aspectRatio: '4/5' }}>
        {item.type === 'photo' ? (
          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <>
            <img src={item.thumbnail || item.url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <Play className="w-8 h-8 text-orange-600 ml-1" />
              </div>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-600">
          {item.type === 'video' ? 'Vidéo' : 'Photo'}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
        <p className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          {item.category}
        </p>
        <h3 className="font-bold text-lg">{item.title}</h3>
      </div>
    </motion.div>
  );
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [deleteItem, setDeleteItem] = useState<GalleryItem|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MediaType>('all');
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'photo', file: null as File | null, thumbnail: null as File | null, title: '', category: '', height: 'medium', order: 0 });
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { isAuthenticated, isOfficialMember, isLoading: authLoading } = useAuthSession();
  const router = useRouter();
  const getItemId = (item: GalleryItem | null) => item?._id ?? item?.id ?? '';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOfficialMember)) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && isOfficialMember) {
      fetchItems();
    }
  }, [isAuthenticated, isOfficialMember, authLoading, router]);

  const fetchItems = async () => {
    try {
      const data = await safeFetch('/api/social/gallery/', undefined, { cache: 'no-store' }) as GalleryItem[] | GalleryResponse;
      setItems(Array.isArray(data) ? data : (data as GalleryResponse).results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
    const newIndex = items.findIndex((item) => getItemId(item) === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await safeFetch('/api/social/gallery/reorder/', undefined, { method: 'POST', body: JSON.stringify({ items: newItems.map((item, index) => ({ id: getItemId(item), order: index })) }) });
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
      fetchItems();
    }
  };

  // Ouvre le dialog de confirmation
  const handleDelete = (item: GalleryItem) => {
    setDeleteItem(item);
    setConfirmOpen(true);
  };

  // Confirme la suppression
  const confirmDelete = async () => {
    const deleteId = getItemId(deleteItem);
    if (!deleteId) {
      toast({ title: 'Erreur', description: "Aucun élément valide à supprimer.", variant: 'destructive' });
      setConfirmOpen(false);
      setDeleteItem(null);
      return;
    }
    const toastId = toast({ title: 'Suppression...', description: 'En cours' });
    try {
      // Vérifie si l'élément existe
      const exists = items.some((i) => getItemId(i) === deleteId);
      if (!exists) {
        toastId.update({ id: toastId.id, title: 'Erreur', description: "L'élément n'existe plus.", variant: 'destructive' });
        setConfirmOpen(false);
        setDeleteItem(null);
        return;
      }
      await safeFetch(`/api/social/gallery/${deleteId}/`, undefined, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => getItemId(i) !== deleteId));
      toastId.update({ id: toastId.id, title: 'Succès', description: 'Supprimé' });
    } catch (error) {
      toastId.update({ id: toastId.id, title: 'Erreur', description: "Impossible de supprimer.", variant: 'destructive' });
    } finally {
      setConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file && !editItem) return;
    
    const toastId = toast({ title: editItem ? 'Mise à jour...' : 'Création...', description: 'En cours' });
    try {
      const data = new FormData();
      data.append('type', formData.type);
      if (formData.file) data.append('file', formData.file);
      if (formData.thumbnail) data.append('thumbnail_file', formData.thumbnail);
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('height', formData.height);
      data.append('order', formData.order.toString());

    if (editItem) {
        const editId = getItemId(editItem);
        if (!editId) {
          toastId.update({ id: toastId.id, title: 'Erreur', description: "Aucun élément valide à mettre à jour.", variant: 'destructive' });
          return;
        }
        await safeFetch(`/api/social/gallery/${editId}/`, data, { method: 'PATCH' });
    } else {
        await safeFetch('/api/social/gallery/', data, { method: 'POST' });
    }
      toastId.update({ id: toastId.id, title: 'Succès', description: editItem ? 'Mis à jour' : 'Créé' });
      setShowCreateModal(false);
      setEditItem(null);
      setFormData({ type: 'photo', file: null, thumbnail: null, title: '', category: '', height: 'medium', order: 0 });
      fetchItems();
    } catch (error) {
      toastId.update({ id: toastId.id, title: 'Erreur', variant: 'destructive' });
    }
  };

  const openEditModal = (item: GalleryItem) => {
    setEditItem(item);
    setFormData({ type: item.type, file: null, thumbnail: null, title: item.title, category: item.category, height: item.height, order: item.order || 0 });
    setShowCreateModal(true);
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'photos') return item.type === 'photo';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
        <Navigation />
        <div className="pt-32 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl" />
      <div className="absolute top-96 left-10 w-96 h-96 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-300/15 to-red-300/15 rounded-full blur-3xl" />

      <Navigation />

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 relative"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Galerie
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos activités, événements et formations en images
            </p>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
          </motion.div>

          {/* Filtres */}
          <div className="flex justify-center gap-4 mb-12">
            <button onClick={() => { setEditItem(null); setFormData({ type: 'photo', file: null, thumbnail: null, title: '', category: '', height: 'medium', order: items.length }); setShowCreateModal(true); }} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${filter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilter('photos')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filter === 'photos'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photos
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filter === 'videos'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <Video className="w-4 h-4" />
              Vidéos
            </button>
          </div>

          {/* Masonry Grid */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => getItemId(item))} strategy={rectSortingStrategy}>
              <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-2 space-y-3">
                {filteredItems.map((item) => (
                  <SortableGalleryItem key={getItemId(item)} item={item} onEdit={openEditModal} onDelete={handleDelete} />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>

          {/* Dialog de confirmation de suppression */}
          <Dialog open={confirmOpen} onOpenChange={(open) => { setConfirmOpen(open); if (!open) setDeleteItem(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  {deleteItem ? (
                    <>
                      Êtes-vous sûr de vouloir supprimer <span className="font-bold">{deleteItem.title}</span> de la galerie ? Cette action est irréversible.
                    </>
                  ) : (
                    <>Aucun élément sélectionné.</>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button onClick={() => { setConfirmOpen(false); setDeleteItem(null); }} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold">Annuler</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={!getItemId(deleteItem)}>Supprimer</button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Modal de création/édition */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">{editItem ? 'Modifier' : 'Ajouter'} un élément</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="photo">Photo</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{formData.type === 'video' ? 'Fichier Vidéo' : 'Fichier Image'}</label>
                  <input type="file" accept={formData.type === 'video' ? 'video/*' : 'image/*'} onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required={!editItem} />
                </div>
                {formData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail (optionnel)</label>
                    <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hauteur</label>
                  <select value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="short">Court</option>
                    <option value="medium">Moyen</option>
                    <option value="tall">Grand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ordre</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Annuler</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">{editItem ? 'Mettre à jour' : 'Créer'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

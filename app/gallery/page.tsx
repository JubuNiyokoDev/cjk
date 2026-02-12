'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, X, Play } from 'lucide-react';
import { safeFetch } from '@/lib/api';

type MediaType = 'all' | 'photos' | 'videos';

interface GalleryItem {
  _id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  height: 'short' | 'medium' | 'tall';
  order?: number;
}

interface GalleryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryItem[];
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MediaType>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

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

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'photos') return item.type === 'photo';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  const heightClasses = {
    short: 'h-64',
    medium: 'h-80',
    tall: 'h-96',
  };

  if (loading) {
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
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilter('photos')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'photos'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photos
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'videos'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Video className="w-4 h-4" />
              Vidéos
            </button>
          </div>

          {/* Masonry Grid */}
          {filteredItems.length === 0 ? (
            <div className="max-w-xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Galerie vide</h3>
                <p className="text-gray-600">
                  Aucun contenu n&apos;est disponible pour le moment. Revenez plus tard.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              layout
              className="columns-1 md:columns-2 lg:columns-3 gap-2 space-y-3"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ rotate: -2, scale: 1.02 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                  onClick={() => setSelectedItem(item)}
                  className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow break-inside-avoid mb-3"
                >
                  <div className={`${heightClasses[item.height as keyof typeof heightClasses]} w-full relative`} style={{ aspectRatio: '4/5' }}>
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
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal de visualisation */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              {selectedItem.type === 'video' ? (
                <video src={selectedItem.url} controls className="w-full h-full rounded-lg" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain rounded-lg" />
              )}
              <div className="mt-4 text-white">
                <p className="text-sm text-orange-300 mb-1">{selectedItem.category}</p>
                <h3 className="text-2xl font-bold">{selectedItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

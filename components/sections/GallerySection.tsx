'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { safeFetch } from '@/lib/api';

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

export default function GallerySection() {
  const [highlights, setHighlights] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const data = await safeFetch('/api/social/gallery/', undefined, { cache: 'no-store' }) as GalleryItem[] | GalleryResponse;
        const items = Array.isArray(data) ? data : (data as GalleryResponse).results || [];
        setHighlights(items.slice(0, 4));
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchHighlights();
  }, []);
  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            <ImageIcon className="w-4 h-4" />
            Galerie
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos activités en images
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les moments forts de nos formations, événements et activités
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all aspect-square"
            >
              <div className="absolute inset-0">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <img src={item.thumbnail || item.url} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-orange-600 ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-xs font-semibold text-orange-300 mb-1">{item.category}</p>
                <h3 className="font-bold text-sm">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Voir toute la galerie
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import type { NewsItem } from '@/lib/types';
import NewsCard from '@/components/cards/NewsCard';

const emptyState = {
  title: 'Aucune actualité disponible',
  description: 'Les nouvelles internes seront bientôt publiées ici par le staff.',
};

type NewsSectionProps = {
  items: NewsItem[];
};

export default function NewsSection({ items }: NewsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const featuredNews = items.slice(0, 3);

  return (
    <section id="news" className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Actualités du Centre
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Informations internes et annonces officielles réservées au staff CJK
          </p>
        </motion.div>

        {featuredNews.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{emptyState.title}</h3>
            <p className="text-gray-600">{emptyState.description}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredNews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <NewsCard item={item} variant="compact" />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/news"
            className="px-8 py-3 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Voir toutes les actualités
          </Link>
          <Link
            href="/auth"
            className="px-8 py-3 rounded-md border-2 border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition-all"
          >
            Accès staff
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

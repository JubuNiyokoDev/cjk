'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import BlogCard from '@/components/cards/BlogCard';

const emptyState = {
  title: 'Aucun article disponible',
  description: 'Revenez bientôt pour les derniers contenus publiés par nos membres.',
};

type BlogSectionProps = {
  posts: BlogPost[];
};

export default function BlogSection({ posts }: BlogSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const featuredPosts = posts.slice(0, 3);

  return (
    <section id="blog" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Blog des Jeunes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des histoires, des idées et des parcours inspirés par la communauté CJK
          </p>
        </motion.div>

        {featuredPosts.length === 0 ? (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{emptyState.title}</h3>
            <p className="text-gray-600">{emptyState.description}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard post={post} variant="compact" />
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
            href="/blog"
            className="px-8 py-3 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Explorer le blog
          </Link>
          <Link
            href="/auth"
            className="px-8 py-3 rounded-md border border-orange-500 text-orange-600 font-semibold hover:bg-orange-50 transition-all"
          >
            Se connecter pour publier
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

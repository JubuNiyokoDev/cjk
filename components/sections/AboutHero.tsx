'use client';

import { motion } from 'framer-motion';

export default function AboutHero() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            À propos du CJK
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Depuis 1992, le Centre Jeunes Kamenge œuvre pour la formation, la paix et la réconciliation au Burundi
          </p>
        </motion.div>
      </div>
    </section>
  );
}

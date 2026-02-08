'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Award, Trophy, Star } from 'lucide-react';

const awards = [
  {
    icon: Award,
    name: 'Prix Bonaventure de la Paix',
    description: 'Reconnaissance de l\'engagement pour la paix et la réconciliation',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Trophy,
    name: 'Prix Right Livelihood',
    description: 'Nobel Alternatif (2000) - Distinction internationale majeure',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: Star,
    name: 'Prix Takunda',
    description: 'Prix reçu en 2010 pour l\'impact social auprès des jeunes',
    color: 'from-green-500 to-teal-500',
  },
];

const partners = [
  'MISEREOR (Allemagne)',
  'Manos Unidas (Espagne)',
  'Fondazione Peppino Vismara (Italie)',
  'Caritas Italiana',
];

export default function AwardsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Distinctions & Partenaires
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une reconnaissance internationale de notre impact
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {awards.map((award, index) => (
            <motion.div
              key={award.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                type: 'spring',
              }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className={`h-40 bg-gradient-to-br ${award.color} flex items-center justify-center`}>
                <award.icon className="w-20 h-20 text-white" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {award.name}
                </h3>
                <p className="text-gray-600">{award.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12"
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Nos Partenaires
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <p className="font-semibold text-gray-900">{partner}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

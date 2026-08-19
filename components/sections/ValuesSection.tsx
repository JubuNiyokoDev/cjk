/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import type { CoreValue } from '@/lib/types';
import { orgColor, orgIcon } from '@/lib/org-visuals';

/** Fallback si l'API est indisponible ou vide. */
const DEFAULT_VALUES: Pick<CoreValue, 'id' | 'name' | 'icon' | 'color'>[] = [
  { id: -1, name: 'Vérité', icon: 'shield', color: 'blue' },
  { id: -2, name: 'Tolérance', icon: 'message-circle', color: 'green' },
  { id: -3, name: 'Justice sociale', icon: 'scale', color: 'orange' },
  { id: -4, name: 'Intégrité', icon: 'check-circle', color: 'purple' },
  { id: -5, name: 'Écoute', icon: 'ear', color: 'yellow' },
  { id: -6, name: 'Respect', icon: 'users', color: 'cyan' },
];

type ValuesSectionProps = {
  values?: CoreValue[];
};

export default function ValuesSection({ values }: ValuesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const items = values && values.length > 0 ? values : DEFAULT_VALUES;

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Nos Valeurs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Les principes qui guident notre action quotidienne
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map((value, index) => {
            const Icon = orgIcon(value.icon);
            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: 'spring',
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${orgColor(value.color)} flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">{value.name}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-12 text-center text-white"
        >
          <blockquote className="text-2xl md:text-4xl font-bold mb-4">
            "Ensemble pour bâtir un monde de frères"
          </blockquote>
          <p className="text-xl opacity-90">Notre devise</p>
        </motion.div>
      </div>
    </section>
  );
}

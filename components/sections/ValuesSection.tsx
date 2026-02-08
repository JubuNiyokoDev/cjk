'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Scale, Ear, MessageCircle, CheckCircle, Users } from 'lucide-react';

const values = [
  { icon: Shield, name: 'Vérité', color: 'from-blue-500 to-blue-600' },
  { icon: MessageCircle, name: 'Tolérance', color: 'from-green-500 to-green-600' },
  { icon: Scale, name: 'Justice sociale', color: 'from-orange-500 to-red-600' },
  { icon: CheckCircle, name: 'Intégrité', color: 'from-purple-500 to-pink-600' },
  { icon: Ear, name: 'Écoute', color: 'from-yellow-500 to-orange-600' },
  { icon: Users, name: 'Respect', color: 'from-cyan-500 to-blue-600' },
];

export default function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
          {values.map((value, index) => (
            <motion.div
              key={value.name}
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
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${value.color} flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{value.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white"
        >
          <blockquote className="text-3xl md:text-4xl font-bold mb-4">
            "Ensemble pour bâtir un monde de frères"
          </blockquote>
          <p className="text-xl opacity-90">Notre devise</p>
        </motion.div>
      </div>
    </section>
  );
}

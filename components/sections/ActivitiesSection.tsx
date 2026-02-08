'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Dumbbell,
  Music,
  Radio,
  Laptop,
  BookOpen,
  Languages,
  Users,
  Heart,
  Film,
} from 'lucide-react';

const activities = [
  {
    icon: Heart,
    title: 'Paix & Réconciliation',
    description: 'Projet principal pour promouvoir la paix et le dialogue entre les communautés',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Radio,
    title: 'Radio Colombe FM',
    description: 'Première radio des jeunes au Burundi (93.2 MHz)',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Dumbbell,
    title: 'Sports',
    description: 'Football, basketball, volleyball, athlétisme',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Music,
    title: 'Culture & Arts',
    description: 'Théâtre, chants, danses traditionnelles et modernes',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Laptop,
    title: 'Informatique',
    description: 'Formation en informatique et accès à Internet',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Languages,
    title: 'Langues',
    description: 'Cours de français, anglais et swahili',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: BookOpen,
    title: 'Bibliothèque',
    description: 'Accès aux livres et soutien à la recherche',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: Film,
    title: 'Vidéo-forum',
    description: 'Projections et débats sur des thèmes actuels',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Réseau des Quartiers',
    description: 'Associations des Quartiers Nord de Bujumbura',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function ActivitiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="activities" className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Nos Activités
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un large éventail d'activités pour le développement des jeunes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className={`h-2 bg-gradient-to-r ${activity.color}`} />
              <div className="p-8">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <activity.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {activity.title}
                </h3>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

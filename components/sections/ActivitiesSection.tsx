'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Music,
  Laptop,
  BookOpen,
  Heart,
  Users,
} from 'lucide-react';
import type { Activity } from '@/lib/types';
import ActivityCard from '@/components/cards/ActivityCard';
import { getActivityLabel } from '@/lib/content';

const activityHighlights = [
  {
    icon: Heart,
    title: 'Paix & Réconciliation',
    description: 'Projets pour promouvoir la paix et le dialogue entre les communautés.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Dumbbell,
    title: 'Sports',
    description: 'Football, basketball, volleyball et tournois interquartiers.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Music,
    title: 'Culture & Arts',
    description: 'Théâtre, chants, danses traditionnelles et modernes.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Laptop,
    title: 'Formation',
    description: 'Ateliers numériques, entrepreneuriaux et techniques.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BookOpen,
    title: 'Éducation',
    description: 'Soutien scolaire, bibliothèque et accompagnement.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Vie communautaire',
    description: 'Rencontres, clubs et projets de quartier.',
    color: 'from-teal-500 to-green-500',
  },
];

const activityTypes = ['sport', 'culture', 'formation', 'paix', 'autre'];

type ActivitiesSectionProps = {
  items: Activity[];
};

export default function ActivitiesSection({ items }: ActivitiesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const featuredActivities = items.slice(0, 6);

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

        {featuredActivities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <ActivityCard activity={activity} variant="compact" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activityHighlights.map((activity, index) => (
              <motion.div
                key={activity.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${activity.color}`} />
                <div className="p-8">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {activityTypes.map((type) => (
            <span
              key={type}
              className="px-4 py-2 rounded-full bg-white shadow text-sm font-semibold text-gray-700"
            >
              {getActivityLabel(type)}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/activities"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Voir les activités
          </Link>
          <Link
            href="/auth"
            className="px-8 py-3 rounded-full border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50 transition-all"
          >
            Se connecter pour proposer
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Eye, BookOpen } from 'lucide-react';

export default function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const cards = [
    {
      icon: Target,
      title: 'Mission',
      color: 'from-orange-500 to-red-500',
      points: [
        "L'édification d'une société pacifique, organisée et démocratique",
        'Le rassemblement et la formation des jeunes',
        "L'offre d'un cadre d'apprentissage, d'expression et de divertissement",
        'La promotion de la paix, de la tolérance et du vivre-ensemble',
      ],
    },
    {
      icon: Eye,
      title: 'Vision',
      color: 'from-blue-500 to-cyan-500',
      points: [
        'Devenir un centre de référence dans la réconciliation des peuples de la région des Grands Lacs',
        'Investir dans la formation des jeunes',
        'Promouvoir activement la paix et le dialogue',
        'Créer un impact durable dans la communauté',
      ],
    },
    {
      icon: BookOpen,
      title: 'Objectifs',
      color: 'from-green-500 to-emerald-500',
      points: [
        'Participer à la construction d\'une société burundaise forte et démocratique',
        'Former et encadrer des jeunes sages, responsables et engagés',
        'Aider les jeunes à s\'exprimer et développer leurs talents',
        'Améliorer la cohabitation sociale',
      ],
    },
  ];

  return (
    <section id="mission" className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Mission, Vision & Objectifs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre engagement pour un avenir meilleur
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${card.color} p-8 text-white`}>
                <card.icon className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-bold">{card.title}</h3>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  {card.points.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold mr-3 mt-1">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

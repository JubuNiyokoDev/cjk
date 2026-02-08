'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, Users, Flag } from 'lucide-react';

const timeline = [
  {
    year: '1992',
    icon: Flag,
    title: 'Création du Centre',
    description: 'Le Centre Jeunes Kamenge est créé dans un contexte de tensions sociales pour offrir un espace de paix et de dialogue aux jeunes.',
    color: 'from-orange-500 to-red-500',
  },
  {
    year: '1992-2015',
    icon: Users,
    title: 'Gestion Xavérienne',
    description: 'Les Missionnaires Xavériens assurent la gestion du Centre pendant plus de 20 ans, contribuant à son développement.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    year: '2000',
    icon: Calendar,
    title: 'Prix Nobel Alternatif',
    description: 'Le CJK reçoit le prestigieux Prix Right Livelihood en reconnaissance de son travail pour la paix.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    year: '2010',
    icon: Calendar,
    title: 'Prix Takunda',
    description: 'Nouvelle distinction internationale saluant l\'impact du Centre dans la région.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    year: '2015',
    icon: Users,
    title: 'Nouvelle Direction',
    description: 'Une équipe de laïcs burundais prend la relève pour poursuivre et renforcer la mission du Centre.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    year: '2019',
    icon: Calendar,
    title: '50,788 membres',
    description: 'Le Centre atteint un nombre record de jeunes inscrits, confirmant son rôle majeur dans la communauté.',
    color: 'from-red-500 to-pink-500',
  },
];

export default function HistorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="history" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Notre Histoire
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plus de 30 ans au service des jeunes et de la paix
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 to-red-500 hidden md:block" />

          <div className="space-y-12">
            {timeline.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col md:flex-row`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:text-inherit`}>
                  <div className={`inline-block bg-gradient-to-br ${event.color} text-white px-6 py-2 rounded-full font-bold text-lg mb-4`}>
                    {event.year}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center shadow-xl`}>
                    <event.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

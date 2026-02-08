'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Heart, Globe, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '50,788', label: 'Jeunes membres' },
  { icon: Heart, value: '16-30', label: 'Âge des membres' },
  { icon: Globe, value: '1992', label: 'Année de création' },
  { icon: Award, value: '3', label: 'Prix internationaux' },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="about" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            À propos du CJK
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un centre social de référence pour la formation des jeunes et la promotion de la paix
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Notre Histoire
            </h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Le Centre Jeunes Kamenge est l'un des grands centres sociaux de la commune de
                Ntahangwa, en mairie de Bujumbura, au Burundi. C'est une structure éducative,
                formative, récréative et culturelle, ouverte aux jeunes sans distinction d'origine
                ethnique, de sexe ou de religion.
              </p>
              <p>
                Créé en 1992, le Centre est né dans un contexte marqué par des tensions sociales
                et politiques. Il avait pour objectif principal d'offrir aux jeunes un cadre de
                rencontre, de dialogue, de formation et de promotion de la paix.
              </p>
              <p>
                Depuis juin 2015, la gestion est assurée par une équipe de laïcs burundais,
                nommés par l'Archevêque de Bujumbura, pour poursuivre et renforcer la mission
                du Centre.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Notre Impact
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Heart, Globe, Award } from 'lucide-react';
import ReadButton from '@/lib/speak';

const STORY_PARAGRAPHS = [
  "Le Centre Jeunes Kamenge est l'une des Œuvres sociales  de l'Archidiocèse  de Bujumbura. C'est une structure éducative, formative, récréative, sportive et de rencontres, ouvertes aux jeunes sans distinction d'origine ethnique, de sexe ou de religion.",
  "Créé en 1992, le Centre est né dans un contexte marqué par des tensions sociales et politiques. Il avait pour objectif principal d'offrir aux jeunes un cadre de rencontre, de dialogue, de formation et de promotion de la paix.",
  "De 1992 à 2015, la gestion du Centre était assurée par les Missionnaires Xavériens. Pendant plus de 20 ans, ils lui ont progressivement donné, sa structure actuelle en mettant en place des structures et des infrastructures nécessaires pour remplir sa mission. Depuis juin 2015,la gestion est assurée par une équipe de Prêtres diocésains nommés par l’archevêque de BUJUMBURA.",
  "Le groupe cible actuel est constitué de tous les jeunes âgés de 16 ans a 30 ans, sans discrimination ethnique, sociales ou religieuse, en provenance de 6 zones de la commune NTAHANGWA (Buterere, Cibitoke, Gihosha, Kamenge, Kinama et Ngagara) et d'autres communes de la mairie de Bujumbura. Au 30 Juillet 2026, Le Centre jeunes Kamenge avait déjà inscrit dans ses registres d'adhésion 54950 membres (filles et garçons).",
];

const stats = [
  { icon: Users, value: '54 950', label: 'Jeunes membres' },
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
            <ReadButton paragraphs={STORY_PARAGRAPHS} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl sm:p-8 p-1"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Notre Impact
            </h3>
            <div className="grid grid-cols-2 sm:gap-6 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-2xl  p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                  <div className="sm:text-3xl  text-base font-bold text-gray-900 mb-2">
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

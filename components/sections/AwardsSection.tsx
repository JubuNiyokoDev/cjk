/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import type { Award as AwardType, Partner } from '@/lib/types';
import { orgColor, orgIcon } from '@/lib/org-visuals';

/** Fallbacks si l'API est indisponible ou vide. */
const DEFAULT_AWARDS: Pick<AwardType, 'id' | 'name' | 'description' | 'year' | 'icon' | 'color'>[] = [
  {
    id: -1,
    name: 'Prix Bonaventure de la Paix',
    description: "Reconnaissance de l'engagement pour la paix et la réconciliation",
    year: '',
    icon: 'star',
    color: 'yellow',
  },
  {
    id: -2,
    name: 'Prix Right Livelihood',
    description: 'Nobel Alternatif (2000) - Distinction internationale majeure',
    year: '2000',
    icon: 'globe',
    color: 'blue',
  },
  {
    id: -3,
    name: 'Prix Takunda',
    description: "Prix reçu en 2010 pour l'impact social auprès des jeunes",
    year: '2010',
    icon: 'sun',
    color: 'green',
  },
];

const DEFAULT_PARTNERS: Pick<Partner, 'id' | 'name' | 'country' | 'logo' | 'website'>[] = [
  { id: -1, name: 'MISEREOR', country: 'Allemagne', logo: null, website: '' },
  { id: -2, name: 'Manos Unidas', country: 'Espagne', logo: null, website: '' },
  { id: -3, name: 'Fondazione Peppino Vismara', country: 'Italie', logo: null, website: '' },
  { id: -4, name: 'Caritas Italiana', country: 'Italie', logo: null, website: '' },
];

/** N'autorise que http/https pour les liens externes. */
function safeWebsite(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch {
    return null;
  }
  return null;
}

type AwardsSectionProps = {
  awards?: AwardType[];
  partners?: Partner[];
};

export default function AwardsSection({ awards, partners }: AwardsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const awardItems = awards && awards.length > 0 ? awards : DEFAULT_AWARDS;
  const partnerItems = partners && partners.length > 0 ? partners : DEFAULT_PARTNERS;

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
          {awardItems.map((award, index) => {
            const Icon = orgIcon(award.icon);
            return (
              <motion.div
                key={award.id}
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
                <div className={`h-40 bg-gradient-to-br ${orgColor(award.color)} flex items-center justify-center relative`}>
                  <Icon className="w-20 h-20 text-white" />
                  {award.year && (
                    <span className="absolute top-4 right-4 bg-white/25 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {award.year}
                    </span>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {award.name}
                  </h3>
                  <p className="text-gray-600">{award.description}</p>
                </div>
              </motion.div>
            );
          })}
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
            {partnerItems.map((partner, index) => {
              const website = safeWebsite(partner.website);
              const card = (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center gap-3">
                  {partner.logo && (
                    <img
                      src={partner.logo}
                      alt={`Logo ${partner.name}`}
                      className="h-14 w-auto object-contain"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{partner.name}</p>
                    {partner.country && (
                      <p className="text-sm text-gray-500">{partner.country}</p>
                    )}
                  </div>
                </div>
              );
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  {website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="block h-full">
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

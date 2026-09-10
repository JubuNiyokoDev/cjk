/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Handshake } from 'lucide-react';
import type { Award as AwardType, Partner } from '@/lib/types';
import { orgColor, orgIcon } from '@/lib/org-visuals';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

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

function PartnerLogo({ logo, name }: { logo: string | null | undefined; name: string }) {
  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white px-4 shadow-sm ring-1 ring-gray-100">
      {logo ? (
        <img
          src={logo}
          alt={`Logo ${name}`}
          className="relative max-h-14 max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Handshake className="h-8 w-8 text-orange-400" aria-hidden="true" />
      )}
    </div>
  );
}

export default function AwardsSection({ awards, partners }: AwardsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const awardItems = awards && awards.length > 0 ? awards : DEFAULT_AWARDS;
  const partnerItems = partners && partners.length > 0 ? partners : DEFAULT_PARTNERS;
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedPartner, setSelectedPartner] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;
    const updateSelection = () => setSelectedPartner(carouselApi.selectedScrollSnap());
    updateSelection();
    carouselApi.on('select', updateSelection);
    carouselApi.on('reInit', updateSelection);
    return () => {
      carouselApi.off('select', updateSelection);
      carouselApi.off('reInit', updateSelection);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || isPaused || partnerItems.length < 2) return;
    const timer = window.setInterval(() => carouselApi.scrollNext(), 3200);
    return () => window.clearInterval(timer);
  }, [carouselApi, isPaused, partnerItems.length]);

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
          className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white px-5 py-10 shadow-xl sm:px-10 lg:px-12"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />
          <div className="relative mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
                <Handshake className="h-4 w-4" /> Un réseau engagé
              </span>
              <h3 className="text-3xl font-bold text-gray-900">Nos Partenaires</h3>
              <p className="mt-2 text-gray-500">
                {partnerItems.length} organisations qui avancent avec nous
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => carouselApi?.scrollPrev()} className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600 hover:shadow-md" aria-label="Voir les partenaires précédents">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => carouselApi?.scrollNext()} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" aria-label="Voir les partenaires suivants">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Carousel
            setApi={setCarouselApi}
            opts={{ align: 'start', loop: true, skipSnaps: false }}
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            <CarouselContent className="-ml-3 py-2">
              {partnerItems.map((partner, index) => {
              const website = safeWebsite(partner.website);
              const card = (
                <div className="group flex h-full min-h-52 flex-col rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-red-50/70 p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
                  <PartnerLogo logo={partner.logo} name={partner.name} />
                  <div className="flex flex-1 flex-col items-center justify-center pt-4">
                    <p className="line-clamp-2 font-semibold leading-snug text-gray-900 transition-colors group-hover:text-orange-600">{partner.name}</p>
                    {partner.country && (
                      <p className="mt-1 text-sm text-gray-500">{partner.country}</p>
                    )}
                  </div>
                </div>
              );
              return (
                <CarouselItem key={partner.id} className="basis-[86%] pl-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <motion.div initial={{ opacity: 0, y: 18 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.08 }} className="h-full">
                    {website ? <a href={website} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={`Visiter le site de ${partner.name}`}>{card}</a> : card}
                  </motion.div>
                </CarouselItem>
              );
              })}
            </CarouselContent>
          </Carousel>

          <div className="mt-7 flex items-center justify-center gap-2" aria-label="Position du carrousel">
            {partnerItems.map((partner, index) => (
              <button key={partner.id} type="button" onClick={() => carouselApi?.scrollTo(index)} aria-label={`Afficher ${partner.name}`} aria-current={selectedPartner === index ? 'true' : undefined} className={`h-2 rounded-full transition-all duration-300 ${selectedPartner === index ? 'w-7 bg-gradient-to-r from-orange-500 to-red-500' : 'w-2 bg-gray-200 hover:bg-orange-300'}`} />
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">Défilement automatique · Survolez pour mettre en pause</p>
        </motion.div>
      </div>
    </section>
  );
}

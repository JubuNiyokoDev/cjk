/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { Users, Mail, Phone } from 'lucide-react';
import type { TeamMember } from '@/lib/types';

/** Fallback si l'API est indisponible ou vide. */
const DEFAULT_TEAM: Pick<TeamMember, 'id' | 'name' | 'role' | 'description' | 'photo' | 'email' | 'phone'>[] = [
  {
    id: -1,
    name: 'Jean-Baptiste NDAYIZEYE',
    role: 'Directeur du centre',
    description: "Coordonne l'ensemble des activités et assure la vision stratégique du CJK",
    photo: null,
    email: 'director@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
  {
    id: -2,
    name: 'Marie NIYONKURU',
    role: 'Coordinatrice jeunesse',
    description: 'Encadre les programmes de formation et accompagne les jeunes membres',
    photo: null,
    email: 'coordinator@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
  {
    id: -3,
    name: 'Pierre HAKIZIMANA',
    role: 'Responsable activités sportives',
    description: 'Organise et supervise les activités sportives et les compétitions',
    photo: null,
    email: 'sports@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
  {
    id: -4,
    name: 'Claudine UWIMANA',
    role: 'Responsable activités culturelles',
    description: 'Développe les programmes culturels et artistiques du centre',
    photo: null,
    email: 'culture@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
  {
    id: -5,
    name: 'Emmanuel NKURUNZIZA',
    role: 'Formateur principal',
    description: 'Anime les sessions de formation et développe les contenus pédagogiques',
    photo: null,
    email: 'formation@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
  {
    id: -6,
    name: 'Sylvie IRAKOZE',
    role: 'Responsable administrative',
    description: 'Gère les aspects administratifs et financiers du centre',
    photo: null,
    email: 'admin@cjk.bi',
    phone: '+257 XX XX XX XX',
  },
];

type TeamSectionProps = {
  members?: TeamMember[];
};

export default function TeamSection({ members }: TeamSectionProps) {
  const items = members && members.length > 0 ? members : DEFAULT_TEAM;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            Notre équipe
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Rencontrez notre équipe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des professionnels dévoués au service de la jeunesse burundaise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-64 bg-gradient-to-br from-orange-500 to-red-500 overflow-hidden">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-orange-600 font-semibold text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {member.description}
                </p>

                {(member.email || member.phone) && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

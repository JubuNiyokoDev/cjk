'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Phone, Mail, Radio } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresse',
    info: 'Kamenge, Commune Ntahangwa',
    details: 'Bujumbura, Burundi',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Phone,
    title: 'Téléphone',
    info: '+257 79 921 760',
    details: 'BP 788 - Bujumbura',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Mail,
    title: 'Email',
    info: 'centrejeuneskamenge@yahoo.fr',
    details: 'Réponse sous 48h',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Radio,
    title: 'Radio Colombe FM',
    info: '93.2 MHz',
    details: 'Première radio des jeunes',
    color: 'from-orange-500 to-yellow-500',
  },
];

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="contact" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Contactez-nous
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez-nous dans notre mission pour un avenir meilleur
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {item.title}
              </h3>
              <p className="font-semibold text-gray-900 mb-1">{item.info}</p>
              <p className="text-sm text-gray-600">{item.details}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-12 text-center text-white"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Rejoignez notre communauté
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Plus de 50,000 jeunes font déjà partie de la famille CJK
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:centrejeuneskamenge@yahoo.fr"
              className="px-8 py-4 bg-white text-orange-500 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Devenir membre
            </a>
            <a
              href="tel:+25779921760"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-orange-500 transition-all transform hover:scale-105"
            >
              Nous appeler
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

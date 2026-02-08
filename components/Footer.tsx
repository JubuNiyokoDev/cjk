'use client';

import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Radio } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                CJK
              </div>
              <div>
                <h3 className="font-bold text-lg">Centre Jeunes</h3>
                <p className="text-sm text-gray-400">Kamenge</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ensemble pour bâtir un monde de frères
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Navigation</h4>
            <ul className="space-y-2">
              {['Accueil', 'À propos', 'Mission', 'Activités', 'Contact'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace('à propos', 'about')}`}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Nos Valeurs</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Vérité</li>
              <li>• Tolérance</li>
              <li>• Justice sociale</li>
              <li>• Intégrité</li>
              <li>• Écoute</li>
              <li>• Respect</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                <span>Kamenge, Bujumbura, Burundi</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+257 79 921 760</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>centrejeuneskamenge@yahoo.fr</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Radio className="w-4 h-4 flex-shrink-0" />
                <span>Radio Colombe FM 93.2 MHz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Centre Jeunes Kamenge. Tous droits
              réservés.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-gray-400">Fait avec</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-gray-400">pour la paix</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}

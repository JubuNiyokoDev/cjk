'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 opacity-90" />

      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,165,0,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255,165,0,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(255,165,0,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,165,0,0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-6xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
              <img src="/logo.jpeg" className="h-full w-full object-cover rounded-full inset-0" alt="CJK Logo" />
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Centre Jeunes Kamenge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-3xl text-white/90 mb-4 font-light"
        >
          Ensemble pour bâtir un monde de frères
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto"
        >
          Formation • Paix • Réconciliation • Culture
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#about"
            className="px-8 py-4 bg-white text-orange-500 rounded-md font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Découvrir le CJK
          </a>
          <a
            href="#contact"
            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-md font-semibold hover:bg-white hover:text-orange-500 transition-all transform hover:scale-105"
          >
            Nous contacter
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="text-white w-8 h-8" />
      </motion.div>
    </section>
  );
}

'use client';

import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import MissionSection from '@/components/sections/MissionSection';
import ValuesSection from '@/components/sections/ValuesSection';
import ActivitiesSection from '@/components/sections/ActivitiesSection';
import HistorySection from '@/components/sections/HistorySection';
import AwardsSection from '@/components/sections/AwardsSection';
import ContactSection from '@/components/sections/ContactSection';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <ValuesSection />
      <ActivitiesSection />
      <HistorySection />
      <AwardsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

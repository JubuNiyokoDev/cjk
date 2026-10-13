import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TeamSection from '@/components/sections/TeamSection';
import AboutHero from '@/components/sections/AboutHero';
import { getTeamMembers } from '@/lib/api';

// Rendu dynamique : cette page est la seule route statique (○) du site dont
// l'entrée de cache ISR/ETag s'est retrouvée coincée en « 304 Not Modified »
// sans corps derrière le reverse-proxy nginx en production, ce qui servait un
// document vide (page blanche). Les pages rendues dynamiquement (/activities,
// /blog, /news) n'ont pas ce problème : /about suit désormais le même chemin.
// getTeamMembers conserve son propre cache de données (revalidate: 300).

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <AboutHero />
      <TeamSection members={teamMembers} />
      <Footer />
    </main>
  );
}

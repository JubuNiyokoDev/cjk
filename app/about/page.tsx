import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TeamSection from '@/components/sections/TeamSection';
import AboutHero from '@/components/sections/AboutHero';
import { getTeamMembers } from '@/lib/api';

export const revalidate = 300;

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

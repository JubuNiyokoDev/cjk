import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TeamSection from '@/components/sections/TeamSection';
import AboutHero from '@/components/sections/AboutHero';
import { getTeamMembers } from '@/lib/api';

// Rendu dynamique FORCÉ.
//
// Supprimer `export const revalidate = 300` ne suffisait pas : sans searchParams
// ni fetch `no-store`, Next.js continuait de prérendre /about au build (`○` dans
// la sortie de build) alors que /, /activities, /blog et /news sont servies en
// `λ`. Conséquences en production :
//   1. le HTML était figé au build, où l'API n'est pas joignable
//      (NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 → ECONNREFUSED), donc la
//      page livrait les cartes de secours DEFAULT_TEAM au lieu des membres réels ;
//   2. la réponse portait `cache-control: s-maxage=300` + ETag, donc nginx la
//      mettait en cache et renvoyait un `304 Not Modified` sans corps à des GET
//      non conditionnels → page blanche / chargement interminable.
// `force-dynamic` aligne /about sur les routes saines : rendu à chaque requête,
// en-têtes `private, no-cache, no-store`, jamais mise en cache par le proxy.
export const dynamic = 'force-dynamic';

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

/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuthSession } from '@/hooks/use-auth-session';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Settings } from 'lucide-react';
import StatusCard from '@/components/cards/StatusCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BlogCard from '@/components/cards/BlogCard';
import { sortByDateDesc } from '@/lib/content';
import { getBlogPosts, getNews, getActivities } from '@/lib/api';
import NewsCard from '@/components/cards/NewsCard';
import ActivityCard from '@/components/cards/ActivityCard';

export default function ProfilePage() {
  const router = useRouter();
  const { member, isAuthenticated, isLoading, logout, isOfficialMember } = useAuthSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isOfficialMember) {
      getBlogPosts().then(setPosts).finally(() => setPostsLoading(false));
      getNews().then(setNews).finally(() => setNewsLoading(false));
      getActivities().then(setActivities).finally(() => setActivitiesLoading(false));
      return;
    }

    if (isAuthenticated && !isOfficialMember) {
      setPostsLoading(false);
      setNewsLoading(false);
      setActivitiesLoading(false);
    }
  }, [isAuthenticated, isOfficialMember]);

  const sortedPosts = sortByDateDesc(posts);
  const sortedNews = sortByDateDesc(news);
  const sortedActivities = sortByDateDesc(activities);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !member) return null;

  const displayName = member.first_name || member.last_name
    ? `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
    : member.username;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
      <Navigation />

      {/* Hero Header Épuré */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-br from-orange-50 to-white -z-10" />

        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar avec bague de progression ou status */}
            <div className="relative group">
              <div className="h-36 w-36 rounded-3xl bg-white shadow-xl shadow-orange-100 p-1.5 transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="relative h-full w-full rounded-[22px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={displayName}
                      fill // Remplit le parent
                      className="object-cover"
                      sizes="144px" // Optionnel pour l'optimisation
                    />
                  ) : (
                    <span className="text-5xl font-light text-orange-500">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <button className="absolute -bottom-2 -right-2 p-2.5 bg-white shadow-lg rounded-md text-slate-400 hover:text-orange-500 transition-colors border border-slate-50">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-4xl md:text-2xl font-extrabold mt-3 tracking-tight text-slate-900">
                {displayName}
              </h1>
              <div className="flex items-center space-x-2 mt-1 justify-center md:justify-start">
                <p className="text-slate-500 text-lg">@{member.username}</p>
                {
                  isOfficialMember && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold tracking-wider rounded-md">
                    Membre Officiel
                  </span>
                }

              </div>
            </div>


            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 font-semibold rounded-md shadow-sm border border-red-50 hover:bg-red-50 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </section>

      {/* Grille d'informations "Respirante" */}
      <section className="pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Colonne de gauche : Infos principales */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-[12px] p-8 md:p-10 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400  tracking-widest mb-8">Informations Personnelles</h3>

                <div className="grid sm:grid-cols-2 gap-y-10 gap-x-12">
                  <InfoBlock icon={Mail} label="Email Professionnel" value={member.email} />
                  <InfoBlock icon={Phone} label="Numéro de Téléphone" value={member.phone || 'Non renseigné'} />
                  <InfoBlock icon={MapPin} label="Localisation / Quartier" value={member.quartier || 'Non renseigné'} />
                  <InfoBlock icon={Calendar} label="Date de Naissance" value={member.date_naissance ? formatDate(member.date_naissance) : 'Non renseignée'} />
                </div>
              </div>
            </div>

            {/* Colonne de droite : Stats / Date d'adhésion */}
            <div className="space-y-6">
              <StatusCard
                title="Fidélité"
                icon={<Calendar className="w-5 h-5" />}   // icône du titre
                mainLabel="Membre de la communauté depuis le"  // label principal
                mainValue={formatDate(member.date_inscription)} // valeur principale
                statusLabel="Statut Compte"                 // label du statut
                statusValue="Actif"                         // valeur du statut
                statusColor="orange-500"                     // couleur du statut
              />

              {
                !isOfficialMember && <div className="bg-orange-50 rounded-[12px] p-8 border border-orange-100">
                  <p className="text-orange-800 font-semibold mb-2">Besoin d'aide ?</p>
                  <p className="text-orange-600/80 text-sm leading-relaxed">
                    Vous souhaitez modifier vos informations ? Contactez le support technique.
                  </p>
                </div>
              }

            </div>

          </div>
        </div>
      </section>
      {        /* Section des contenus personnels (Blogs, Actualités, Activités) */}
      {!isOfficialMember ? (
        <div className="max-w-5xl mx-auto px-6 mb-10">
          <div className="bg-orange-50 rounded-[12px] p-8 border border-orange-100">
            <p className="text-orange-800 font-semibold mb-2">Section reservee</p>
            <p className="text-orange-600/80 text-sm leading-relaxed">
              Cette section est disponible uniquement pour les membres officiels.
            </p>
          </div>
        </div>
      ) : (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <Tabs defaultValue="blog" className="w-full">
            <TabsList className="w-full justify-start bg-white border border-slate-200 p-1.5 rounded-md shadow-sm">
              <TabsTrigger
                value="blog"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md px-6 py-2.5 font-semibold transition-all"
              >
                Blogs {sortedPosts.length}
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md px-6 py-2.5 font-semibold transition-all"
              >
                Actualités {sortedNews.length}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md px-6 py-2.5 font-semibold transition-all"
              >
                Activités {sortedActivities.length}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blog" className="mt-8">
              {postsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-md overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                      <div className="h-48 bg-slate-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} showActions={true}/>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-lg">Aucun blog disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="news" className="mt-8">
              {newsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-md overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                      <div className="h-48 bg-slate-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedNews.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedNews.map((item) => (
                    <NewsCard key={item.id} item={item} showActions={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-lg">Aucune actualité disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-8">
              {activitiesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-md overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                      <div className="h-48 bg-slate-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedActivities.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedActivities.map((item) => (
                    <ActivityCard key={item.id} activity={item} showActions={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-lg">Aucune activité disponible</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      )}

      <Footer />
    </main>
  );
}

/* Sous-composant pour éviter la répétition et garder le code propre */
function InfoBlock({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-400  tracking-wider">{label}</span>
      </div>
      <p className="text-slate-700 font-medium text-sm ml-0 md:ml-1">{value}</p>
    </div>
  );
}

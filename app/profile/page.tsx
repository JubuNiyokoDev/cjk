/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuthSession } from '@/hooks/use-auth-session';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Settings } from 'lucide-react';
import StatusCard from '@/components/cards/StatusCard';

export default function ProfilePage() {
  const router = useRouter();
  const { member, isAuthenticated, isLoading, logout } = useAuthSession();

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

              <button className="absolute -bottom-2 -right-2 p-2.5 bg-white shadow-lg rounded-xl text-slate-400 hover:text-orange-500 transition-colors border border-slate-50">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-4xl md:text-2xl font-extrabold mt-3 tracking-tight text-slate-900">
                {displayName}
              </h1>
              <div className="flex items-center space-x-2 mt-1 justify-center md:justify-start">
                <p className="text-slate-500 text-lg">@{member.username}</p>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold tracking-wider rounded-md">
                  Membre Officiel
                </span>
              </div>
            </div>


            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 font-semibold rounded-2xl shadow-sm border border-red-50 hover:bg-red-50 transition-all active:scale-95"
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


              <div className="bg-orange-50 rounded-[12px] p-8 border border-orange-100">
                <p className="text-orange-800 font-semibold mb-2">Besoin d'aide ?</p>
                <p className="text-orange-600/80 text-sm leading-relaxed">
                  Vous souhaitez modifier vos informations ? Contactez le support technique.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

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
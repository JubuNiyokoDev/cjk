'use client';

import { useState } from 'react';
import { Award as AwardIcon, Handshake, Heart, Users } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AwardsTab from '@/components/admin/organization/AwardsTab';
import PartnersTab from '@/components/admin/organization/PartnersTab';
import TeamTab from '@/components/admin/organization/TeamTab';
import ValuesTab from '@/components/admin/organization/ValuesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_TRIGGER_CLASS =
  'data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md px-4 py-2 font-semibold transition-all gap-2';

/**
 * Back-office des contenus « organisation » : partenaires, valeurs,
 * équipe et distinctions affichés sur le site public (home / à propos).
 */
export default function AdminOrganisationPage() {
  const [activeTab, setActiveTab] = useState('partners');
  // Chaque onglet charge ses données à sa première ouverture seulement.
  const [visitedTabs, setVisitedTabs] = useState<string[]>(['partners']);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
  };

  return (
    <AdminShell
      title="Organisation"
      description="Gérez les partenaires, valeurs, membres de l'équipe et distinctions affichés sur le site."
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start bg-white border border-gray-200 p-1.5 rounded-md shadow-sm overflow-x-auto">
          <TabsTrigger value="partners" className={TAB_TRIGGER_CLASS}>
            <Handshake className="w-4 h-4" /> Partenaires
          </TabsTrigger>
          <TabsTrigger value="values" className={TAB_TRIGGER_CLASS}>
            <Heart className="w-4 h-4" /> Valeurs
          </TabsTrigger>
          <TabsTrigger value="team" className={TAB_TRIGGER_CLASS}>
            <Users className="w-4 h-4" /> Équipe
          </TabsTrigger>
          <TabsTrigger value="awards" className={TAB_TRIGGER_CLASS}>
            <AwardIcon className="w-4 h-4" /> Distinctions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-6">
          <PartnersTab enabled={visitedTabs.includes('partners')} />
        </TabsContent>
        <TabsContent value="values" className="mt-6">
          <ValuesTab enabled={visitedTabs.includes('values')} />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <TeamTab enabled={visitedTabs.includes('team')} />
        </TabsContent>
        <TabsContent value="awards" className="mt-6">
          <AwardsTab enabled={visitedTabs.includes('awards')} />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

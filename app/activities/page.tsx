import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ActivityCard from '@/components/cards/ActivityCard';
import { getActivities } from '@/lib/api';
import { getActivityLabel, sortByDateDesc } from '@/lib/content';

const activityTypes = ['sport', 'culture', 'formation', 'paix', 'autre'];

type ActivitiesPageProps = {
  searchParams?: { activity_type?: string };
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const activityType = searchParams?.activity_type;
  const activities = await getActivities({ activity_type: activityType, is_published: true });
  const sortedActivities = sortByDateDesc(activities);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Activités du CJK
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sports, culture, formation et projets de paix pour accompagner les jeunes.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposer une activité</h2>
              <p className="text-gray-600">
                Les activités sont créées par des membres autorisés. Connectez-vous pour soumettre une proposition.
              </p>
            </div>
            <Link
              href="/auth"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Se connecter
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/activities"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !activityType
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-700 shadow hover:bg-orange-50'
              }`}
            >
              Toutes
            </Link>
            {activityTypes.map((type) => (
              <Link
                key={type}
                href={`/activities?activity_type=${type}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activityType === type
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white text-gray-700 shadow hover:bg-orange-50'
                }`}
              >
                {getActivityLabel(type)}
              </Link>
            ))}
          </div>

          {sortedActivities.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune activité disponible</h3>
              <p className="text-gray-600">Les activités apparaîtront ici dès qu'elles seront publiées.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

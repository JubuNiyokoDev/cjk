import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import NewsCard from '@/components/cards/NewsCard';
import { getNews } from '@/lib/api';
import { sortByDateDesc } from '@/lib/content';

export default async function NewsPage() {
  const news = await getNews({ is_published: true });
  const sortedNews = sortByDateDesc(news);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Actualités internes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Informations officielles, annonces du staff et vie interne du centre.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé au staff</h2>
              <p className="text-gray-600">
                La création et la modification des actualités sont réservées aux agents CJK.
              </p>
            </div>
            <Link
              href="/auth"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Connexion staff
            </Link>
          </div>

          {sortedNews.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune actualité disponible</h3>
              <p className="text-gray-600">Les actualités apparaîtront ici dès qu&apos;elles seront publiées.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogCard from '@/components/cards/BlogCard';
import { getBlogCategories, getBlogPosts } from '@/lib/api';
import { sortByDateDesc } from '@/lib/content';

type BlogPageProps = {
  searchParams?: { category?: string };
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const category = searchParams?.category;
  const [posts, categories] = await Promise.all([
    getBlogPosts({ category, is_published: true }),
    getBlogCategories(),
  ]);

  const sortedPosts = sortByDateDesc(posts);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Blog CJK
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des articles créés par les jeunes membres pour inspirer, informer et partager.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace membre</h2>
              <p className="text-gray-600">
                Pour publier, aimer ou commenter un article, un compte est nécessaire.
              </p>
            </div>
            <Link
              href="/auth"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Se connecter ou créer un compte
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !category
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-700 shadow hover:bg-orange-50'
              }`}
            >
              Tous
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.id}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === String(cat.id)
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white text-gray-700 shadow hover:bg-orange-50'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {sortedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun article disponible</h3>
              <p className="text-gray-600">Les publications apparaîtront ici dès qu'elles seront en ligne.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

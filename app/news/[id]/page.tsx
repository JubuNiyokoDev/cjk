'use client';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PostGallery from '@/components/content/PostGallery';
import HashtagList from '@/components/content/HashtagList';
import ExternalLinkButton from '@/components/content/ExternalLinkButton';
import { getNewsItem, API_BASE_URL } from '@/lib/api';
import { buildGallerySlides, formatDate } from '@/lib/content';
import { Newspaper, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import MDEditor from "@uiw/react-md-editor";

async function NewsDetailContent({ newsId }: { newsId: number }) {
  const news = await getNewsItem(newsId);
  const slides = buildGallerySlides(API_BASE_URL, news.image, news.images);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/news"
          className="text-sm font-semibold inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          <ChevronLeft /> <span>Retour aux actualités</span>
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10 border border-gray-100">
        <div className="relative">
          <PostGallery
            slides={slides}
            title={news.title}
            accent="blue"
            fallback={
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                <Newspaper className="w-12 h-12 text-white" />
              </div>
            }
          />
          <div className="absolute top-6 left-6 z-10 px-4 py-1.5 rounded-md bg-white/90 text-xs font-semibold text-blue-600 border border-blue-200 pointer-events-none">
            Actualité
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <span>{formatDate(news.created_at)}</span>
            <span>•</span>
            <span>{news.author_name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>
          <div className="prose max-w-none text-gray-700" data-color-mode="light">
            <MDEditor.Markdown source={news.content} />
          </div>
          {((news.hashtag_list?.length ?? 0) > 0 || news.external_link) && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <HashtagList tags={news.hashtag_list ?? []} basePath="/news" accent="blue" />
              <ExternalLinkButton url={news.external_link} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsId = Number(params.id);
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <Suspense fallback={<div>Chargement...</div>}>
          <NewsDetailContent newsId={newsId} />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}

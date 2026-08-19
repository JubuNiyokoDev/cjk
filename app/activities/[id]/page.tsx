'use client';

import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PostGallery from '@/components/content/PostGallery';
import HashtagList from '@/components/content/HashtagList';
import ExternalLinkButton from '@/components/content/ExternalLinkButton';
import { getActivity, API_BASE_URL } from '@/lib/api';
import { buildGallerySlides, formatDate, getActivityLabel } from '@/lib/content';
import { Compass, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import MDEditor from '@uiw/react-md-editor';

async function ActivityDetailContent({ activityId }: { activityId: number }) {
  const activity = await getActivity(activityId);
  const slides = buildGallerySlides(API_BASE_URL, activity.image, activity.images);
  const label = getActivityLabel(activity.activity_type);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/activities"
          className="text-sm font-semibold inline-flex items-center text-orange-600 hover:text-orange-500"
        >
          <ChevronLeft /> <span>Retour aux activités</span>
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10 border border-gray-100">
        <div className="relative">
          <PostGallery
            slides={slides}
            title={activity.title}
            fallback={
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
                <Compass className="w-12 h-12 text-white" />
              </div>
            }
          />
          <div className="absolute top-6 left-6 z-10 px-4 py-1.5 rounded-md bg-white/90 text-xs font-semibold text-orange-600 border border-orange-200 pointer-events-none">
            {label}
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <span>{formatDate(activity.date_activite ?? activity.created_at)}</span>
            {activity.author_name && (
              <>
                <span>•</span>
                <span>{activity.author_name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {activity.title}
          </h1>
          <div className="prose max-w-none text-gray-700" data-color-mode="light">
            <MDEditor.Markdown source={activity.description} />
          </div>
          {((activity.hashtag_list?.length ?? 0) > 0 || activity.external_link) && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <HashtagList tags={activity.hashtag_list ?? []} basePath="/activities" />
              <ExternalLinkButton url={activity.external_link} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const activityId = Number(params.id);
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <Suspense fallback={<div>Chargement...</div>}>
          <ActivityDetailContent activityId={activityId} />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}

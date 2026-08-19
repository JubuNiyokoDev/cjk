'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/social/LikeButton';
import CommentsPanel from '@/components/social/CommentsPanel';
import PostGallery from '@/components/content/PostGallery';
import HashtagList from '@/components/content/HashtagList';
import ExternalLinkButton from '@/components/content/ExternalLinkButton';
import { getBlogPost, API_BASE_URL } from '@/lib/api';
import { buildGallerySlides, formatDate } from '@/lib/content';
import { BookOpen, ChevronLeft } from 'lucide-react';
import Loading from './loading';
import MDEditor from '@uiw/react-md-editor';

const BLOG_CONTENT_TYPE = (process.env.NEXT_PUBLIC_BLOG_CONTENT_TYPE ?? '').trim();

function resolveContentTypeValue(post: {
  content_type?: string | null;
}) {
  if (typeof post.content_type === 'string' && post.content_type.trim().length > 0) {
    return post.content_type.trim();
  }
  return BLOG_CONTENT_TYPE;
}

type BlogPostPageProps = {
  params: { id: string };
};



async function BlogPostContent({ postId }: { postId: number }) {
  const post = await getBlogPost(postId);
  const slides = buildGallerySlides(API_BASE_URL, post.image, post.images);
  const contentType = resolveContentTypeValue(post);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-sm font-semibold inline-flex items-center text-orange-600 hover:text-orange-500"
        >
          <ChevronLeft/> <span>Retour au blog</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10 border border-gray-100">
        <div className="relative">
          <PostGallery
            slides={slides}
            title={post.title}
            fallback={
              <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            }
          />
          <div className="absolute top-6 left-6 z-10 px-4 py-1.5 rounded-md bg-white/90 text-xs font-semibold text-orange-600 border border-orange-200 pointer-events-none">
            {post.category_name}
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <span>{formatDate(post.created_at)}</span>
            <span>•</span>
            <span>{post.author_name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="prose max-w-none text-gray-700" data-color-mode="light">
            <MDEditor.Markdown source={post.content} />
          </div>
          {((post.hashtag_list?.length ?? 0) > 0 || post.external_link) && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <HashtagList tags={post.hashtag_list ?? []} basePath="/blog" />
              <ExternalLinkButton url={post.external_link} />
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
          <LikeButton
            contentType={contentType}
            objectId={post.id}
            initialCount={post.likes_count ?? 0}
            initialLiked={post.is_liked ?? false}
          />
          <span className="text-sm text-gray-500">
            Partage et interactions disponibles pour les membres connectés.
          </span>
        </div>
      <CommentsPanel contentType={contentType} objectId={post.id} />
      </div>

    </div>
  );
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const postId = Number(params.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <Suspense fallback={<Loading />}>
          <BlogPostContent postId={postId} />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}

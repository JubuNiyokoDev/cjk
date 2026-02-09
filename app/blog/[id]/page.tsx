import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/social/LikeButton';
import CommentsPanel from '@/components/social/CommentsPanel';
import { getBlogPost, API_BASE_URL } from '@/lib/api';
import { formatDate, resolveImageUrl } from '@/lib/content';
import { BookOpen } from 'lucide-react';

const BLOG_CONTENT_TYPE_ID = Number(process.env.NEXT_PUBLIC_BLOG_CONTENT_TYPE_ID ?? '0');
const BLOG_CONTENT_TYPE_SAFE = Number.isFinite(BLOG_CONTENT_TYPE_ID) ? BLOG_CONTENT_TYPE_ID : 0;

function resolveContentTypeValue(post: {
  content_type?: number | string | null;
  content_type_id?: number | null;
}) {
  if (typeof post.content_type_id === 'number' && post.content_type_id > 0) {
    return post.content_type_id;
  }
  if (typeof post.content_type === 'number' && post.content_type > 0) {
    return post.content_type;
  }
  if (typeof post.content_type === 'string' && post.content_type.trim().length > 0) {
    return post.content_type;
  }
  return BLOG_CONTENT_TYPE_SAFE;
}

type BlogPostPageProps = {
  params: { id: string };
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const postId = Number(params.id);
  const post = await getBlogPost(postId);
  const imageUrl = resolveImageUrl(API_BASE_URL, post.image);
  const contentType = resolveContentTypeValue(post);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-orange-600 hover:text-orange-500"
            >
              ← Retour au blog
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-10">
            <div className="relative h-64 sm:h-80">
              {imageUrl ? (
                <img src={imageUrl} alt={post.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="absolute top-6 left-6 px-4 py-1 rounded-full bg-white/90 text-sm font-semibold text-orange-600">
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
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {post.content}
              </p>
            </div>
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
              <LikeButton contentType={contentType} objectId={post.id} />
              <span className="text-sm text-gray-500">
                Partage et interactions disponibles pour les membres connectés.
              </span>
            </div>
          </div>

          <CommentsPanel contentType={contentType} objectId={post.id} />
        </div>
      </section>
      <Footer />
    </main>
  );
}

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-10">
            {/* Image skeleton */}
            <div className="relative h-64 sm:h-80 bg-gray-200 animate-pulse" />
            
            <div className="p-6 sm:p-8">
              {/* Meta info skeleton */}
              <div className="flex gap-3 mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              
              {/* Title skeleton */}
              <div className="space-y-3 mb-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4">
              <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

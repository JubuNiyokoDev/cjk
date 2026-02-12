import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import MissionSection from '@/components/sections/MissionSection';
import ValuesSection from '@/components/sections/ValuesSection';
import ActivitiesSection from '@/components/sections/ActivitiesSection';
import BlogSection from '@/components/sections/BlogSection';
import NewsSection from '@/components/sections/NewsSection';
import GallerySection from '@/components/sections/GallerySection';
import HistorySection from '@/components/sections/HistorySection';
import AwardsSection from '@/components/sections/AwardsSection';
import ContactSection from '@/components/sections/ContactSection';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getActivities, getBlogPosts, getNews } from '@/lib/api';
import { sortByDateDesc } from '@/lib/content';

export default async function Home() {
  const [activities, blogPosts, news] = await Promise.all([
    getActivities({ is_published: true }),
    getBlogPosts({ is_published: true }),
    getNews({ is_published: true }),
  ]);
  const sortedActivities = sortByDateDesc(activities);
  const sortedBlogPosts = sortByDateDesc(blogPosts);
  const sortedNews = sortByDateDesc(news);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white w-full overflow-hidden">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <ValuesSection />
      <ActivitiesSection items={sortedActivities} />
      <BlogSection posts={sortedBlogPosts} />
      <NewsSection items={sortedNews} />
      <GallerySection />
      <HistorySection />
      <AwardsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

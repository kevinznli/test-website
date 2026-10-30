// frontend/app/page.tsx
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/home/HeroSection';
import MiniMapPreview from '@/components/home/MiniMapPreview';
import StatsSection from '@/components/home/StatsSection';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#111827] flex flex-col justify-between">
      <Navigation />

      <main className="w-full">
        <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <HeroSection />
          <MiniMapPreview />
        </section>

        <StatsSection />
        <FeaturesGrid />
        <CtaBanner />
      </main>

      <Footer />
    </div>
  );
}
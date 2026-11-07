// frontend/app/map/page.tsx
import { Suspense } from 'react';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import MapExplorer from '@/components/map/MapExplorer';

export default function RiskMapPage() {
  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#111827] flex flex-col justify-between">
      <Navigation />

      {/* MapExplorer reads ?q=, which needs a Suspense boundary on a prerendered page */}
      <Suspense
        fallback={
          <main className="max-w-7xl w-full mx-auto px-6 py-8">
            <div className="w-full h-[620px] bg-gray-100/80 animate-pulse rounded-2xl border border-gray-200" />
          </main>
        }
      >
        <MapExplorer />
      </Suspense>

      <Footer />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import MiniMapPreview from '@/components/home/MiniMapPreview';
import EditorialFeatures from '@/components/home/EditorialFeatures';
import EditorialStats from '@/components/home/EditorialStats';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-[#111827] flex flex-col justify-between selection:bg-rose-100">
      <Navigation />

      <main className="w-full">
        {/* Top Hero Container */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 block mb-3">
                — Real-time hazard intelligence
              </span>
              <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-gray-950 leading-[1.08]">
                Insights for <br />
                <span className="font-semibold underline decoration-[#e11d48] decoration-4 underline-offset-8">
                  your safety.
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-6 leading-relaxed max-w-md">
                A predictive model that gives you confidence when you need it. Identify environmental risks before they become emergencies.
              </p>
            </div>

            {/* Right Visual Component */}
            <div className="lg:col-span-5 flex justify-center">
              <MiniMapPreview />
            </div>
          </div>

          {/* Centered Search Bar Directly Below Hero */}
          <div className="mt-14 pt-10 border-t border-gray-200/80 max-w-xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Search a county or ZIP code..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all shadow-2xs"
              />
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              >
                Analyze risk →
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 font-mono">
              <span>Or explore full national dataset:</span>
              <Link href="/map" className="text-gray-900 underline font-medium hover:text-black">
                interactive map →
              </Link>
            </div>
          </div>
        </section>

        {/* 01–04 Numbered Methodology Section */}
        <EditorialFeatures />

        {/* 2-Column Performance Stats Section */}
        <EditorialStats />
      </main>

      <Footer />
    </div>
  );
}
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import HeroScoreCard from '@/components/home/HeroScoreCard';
import HazardMapShowcase from '@/components/home/HazardMapShowcase';
import FeaturesGrid from '@/components/home/FeaturesGrid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#11100e] text-white flex flex-col justify-between selection:bg-amber-900/60">
      <Navigation />

      <main className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16">
        {/* Section 1: Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 block mb-4">
              FEMA NATIONAL RISK INDEX · 3,232 COUNTIES
            </span>
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.05]">
              Know the <br />
              disaster risk <br />
              <span className="text-[#e29b4d]">where you live.</span>
            </h1>
            <p className="text-sm text-gray-400 mt-6 leading-relaxed max-w-lg">
              See which natural hazards hit your county hardest, what they cost each year, and how prepared your community is.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-lg">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search a county or ZIP..."
                  className="w-full px-4 py-3 bg-[#1d1a17] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-[#e29b4d] hover:bg-[#c98335] text-black font-semibold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                Find my risk
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>Try:</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                Palm Springs, CA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                Santa Rosa, CA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                Fresno, CA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                San Diego, CA
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroScoreCard />
          </div>
        </section>

        {/* Section 2: Hazard Recolor Map Showcase */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 block mb-2">
            ONE COUNTRY, FIVE HAZARDS
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight">
            Risk looks different for every hazard.
          </h2>
          <p className="text-xs text-gray-400 mt-2 mb-4">
            The same map, recolored by hazard. Pick one, or let it cycle.
          </p>
          <HazardMapShowcase />
        </div>

        {/* Section 3: 4 Features Grid */}
        <FeaturesGrid />
      </main>

      <Footer />
    </div>
  );
}
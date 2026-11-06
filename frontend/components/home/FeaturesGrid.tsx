import React from 'react';
import Link from 'next/link';

export default function FeaturesGrid() {
  return (
    <section className="my-16">
      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 block mb-2">
        WHAT YOU CAN DO
      </span>
      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-8">
        From national patterns to one county.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">🗺️</div>
            <h3 className="text-sm font-bold text-white">Explore the risk map</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Switch between states and counties and color the map by risk score, loss per person, social vulnerability or community resilience.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-amber-400 hover:underline">
            Open the map →
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">📊</div>
            <h3 className="text-sm font-bold text-white">See your biggest hazards</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Every county ranks its hazards by expected annual damage, so you know what to prepare for first.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-amber-400 hover:underline">
            See an example →
          </Link>
        </div>

        {/* Card 3 */}
        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-base">⚠️</span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300">
                PLANNED
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Live hazard alerts</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Active fires, flood gauges and weather warnings layered over long-term risk. Coming after the backend launches.
            </p>
          </div>
          <span className="text-xs text-gray-500">Coming soon</span>
        </div>

        {/* Card 4 */}
        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">🗄️</div>
            <h3 className="text-sm font-bold text-white">Built on public data</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Scores and loss estimates come from FEMA&apos;s National Risk Index, with every source listed.
            </p>
          </div>
          <Link href="/about" className="text-xs font-semibold text-amber-400 hover:underline">
            How the data works →
          </Link>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import Link from 'next/link';

export default function FeaturesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 my-16">
      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 block mb-2">
        WHAT YOU CAN DO
      </span>
      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">
        From national patterns to one county.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">🗺️</div>
            <h3 className="text-sm font-bold text-white">Explore the risk map</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Switch between states and counties, and color the map by overall risk or by a single hazard.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-amber-400 hover:underline">
            Open the map →
          </Link>
        </div>

        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">📊</div>
            <h3 className="text-sm font-bold text-white">See your biggest hazards</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Every county ranks its hazards by score, so you know what to prepare for first.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-amber-400 hover:underline">
            See an example →
          </Link>
        </div>

        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">⚠️</div>
            <h3 className="text-sm font-bold text-white">Live hazard alerts</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Weather warnings, recent earthquakes, wind forecasts and river gauges are layered over long-term risk.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-amber-400 hover:underline">
            See what&apos;s active →
          </Link>
        </div>

        <div className="bg-[#181613] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-64">
          <div>
            <div className="text-base mb-3">🗄️</div>
            <h3 className="text-sm font-bold text-white">Built on public data</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Scores come from FEMA disaster declarations and NOAA, USGS and Open-Meteo data, with every source listed.
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
import React from 'react';
import Link from 'next/link';

export default function FeaturesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-black tracking-tight text-gray-900">
        What you can do with Risk Resource
      </h2>
      <p className="text-xs text-gray-500 mt-1 mb-8">
        One place to understand natural hazard risk, from the national picture down to a single county.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200/90 rounded-2xl flex flex-col justify-between h-56">
          <div>
            <div className="text-base mb-2">🗺️</div>
            <h3 className="text-sm font-bold text-gray-900">Explore the risk map</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Switch between states and counties and color the map by risk score, loss per person, social vulnerability or community resilience.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-gray-900 underline">
            Open the map
          </Link>
        </div>

        <div className="p-6 bg-white border border-gray-200/90 rounded-2xl flex flex-col justify-between h-56">
          <div>
            <div className="text-base mb-2">⚠️</div>
            <h3 className="text-sm font-bold text-gray-900">See your biggest hazards</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Every county page ranks its top hazards (earthquake, flooding, wildfire and more) by the damage they're expected to cause each year.
            </p>
          </div>
          <Link href="/map" className="text-xs font-semibold text-gray-900 underline">
            See an example county
          </Link>
        </div>

        <div className="p-6 bg-white border border-gray-200/90 rounded-2xl flex flex-col justify-between h-56">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-base">🔔</div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Planned
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-2">Live hazard alerts</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Current alerts layered over long-term risk, refreshed automatically by our backend pipeline.
            </p>
          </div>
          <span className="text-xs text-gray-400">Coming after the backend launches</span>
        </div>
      </div>
    </section>
  );
}
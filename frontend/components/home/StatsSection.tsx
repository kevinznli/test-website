import React from 'react';

const STATS = [
  { label: 'Counties Covered', value: '3,232', detail: '100% of US counties & territories' },
  { label: 'Natural Hazards', value: '18', detail: 'FEMA NRI composite hazards modeled' },
  { label: 'Jurisdictions', value: '50 + DC + PR', detail: 'Standardized national scoring' },
  { label: 'Data Vintage', value: 'Dec 2025', detail: 'Latest public federal release' },
];

export default function StatsSection() {
  return (
    <section className="border-y border-gray-200/80 bg-white/50 py-10 my-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{stat.label}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{stat.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
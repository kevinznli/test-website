'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <div>
      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 block mb-3">
        FEMA National Risk Index · 3,232 Counties
      </span>
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
        Know the disaster risk <br />
        <span className="text-amber-600">where you live.</span>
      </h1>
      <p className="text-sm text-gray-600 mt-4 leading-relaxed max-w-lg">
        See which natural hazards hit your county hardest, what they cost each year, and how prepared your community is. Built entirely on public federal data.
      </p>

      {/* Address Search */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search a county or ZIP..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Link
          href={`/map?q=${encodeURIComponent(query || 'Riverside')}`}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition-colors whitespace-nowrap text-center"
        >
          Find my risk
        </Link>
      </div>

      {/* Quick suggestions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>Try:</span>
        {['Palm Springs, CA', 'Santa Rosa, CA', 'Fresno, CA', 'San Diego, CA'].map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setQuery(loc)}
            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}
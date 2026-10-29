'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="flex flex-col justify-center">
      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold mb-3">
        Natural Hazard Risk, County by County
      </span>
      <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight leading-[1.1]">
        Know the disaster risk where you live.
      </h1>
      <p className="text-sm text-gray-600 mt-4 leading-relaxed max-w-lg">
        See which natural hazards threaten your county, how much damage they cause each year, and how prepared your community is, using FEMA's National Risk Index.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search a county or ZIP code"
          disabled
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg cursor-not-allowed opacity-80"
        />
        <button
          disabled
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-90 whitespace-nowrap"
        >
          Find my risk
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <Link href="/map" className="underline font-medium text-gray-800 hover:text-black">
          Or explore the full map →
        </Link>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
          Search: planned
        </span>
      </div>
    </div>
  );
}
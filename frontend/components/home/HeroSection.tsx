'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const QUICK_PRESETS = [
  { label: 'Palm Springs, CA', lat: 33.8303, lng: -116.5453, county: 'Riverside' },
  { label: 'Santa Rosa, CA', lat: 38.4404, lng: -122.7141, county: 'Sonoma' },
  { label: 'Fresno, CA', lat: 36.7468, lng: -119.7726, county: 'Fresno' },
  { label: 'San Diego, CA', lat: 32.7157, lng: -117.1611, county: 'San Diego' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);

    try {
      // Free client-side geocoding via OpenStreetMap's Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&countrycodes=us&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        router.push(
          `/map?lat=${lat}&lng=${lon}&name=${encodeURIComponent(display_name)}`
        );
      } else {
        router.push(`/map?q=${encodeURIComponent(trimmed)}`);
      }
    } catch {
      router.push(`/map?q=${encodeURIComponent(trimmed)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (preset: (typeof QUICK_PRESETS)[0]) => {
    router.push(
      `/map?lat=${preset.lat}&lng=${preset.lng}&name=${encodeURIComponent(
        preset.label
      )}&county=${preset.county}`
    );
  };

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

      {/* Active Search Input Form */}
      <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a county, city, or ZIP code"
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {isLoading ? 'Locating...' : 'Find my risk'}
        </button>
      </form>

      {/* Sample Quick-Search Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-gray-400 font-mono text-[10px]">Try:</span>
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset)}
            className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <Link href="/map" className="underline font-medium text-gray-800 hover:text-black">
          Or explore the full map →
        </Link>
      </div>
    </div>
  );
}
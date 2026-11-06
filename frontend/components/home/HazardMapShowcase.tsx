'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HazardMetric {
  name: string;
  score: number;
  color: string;
}

interface LocationSample {
  county: string;
  subhead: string;
  overallScore: number;
  riskTier: string;
  hazards: HazardMetric[];
}

const SAMPLE_DATA: Record<string, LocationSample> = {
  'Palm Springs': {
    county: 'Riverside County',
    subhead: 'California · Palm Springs area',
    overallScore: 79,
    riskTier: 'Relatively high',
    hazards: [
      { name: 'Wildfire', score: 92, color: '#e65100' },
      { name: 'Earthquake', score: 75, color: '#d4a359' },
      { name: 'Flood', score: 14, color: '#4a72b2' },
      { name: 'Hurricane', score: 2, color: '#2e7d32' },
      { name: 'Tornado', score: 1, color: '#7b52ab' },
    ],
  },
  'Santa Rosa': {
    county: 'Sonoma County',
    subhead: 'California · Santa Rosa area',
    overallScore: 74,
    riskTier: 'Relatively high',
    hazards: [
      { name: 'Wildfire', score: 88, color: '#e65100' },
      { name: 'Earthquake', score: 82, color: '#d4a359' },
      { name: 'Flood', score: 35, color: '#4a72b2' },
      { name: 'Hurricane', score: 0, color: '#2e7d32' },
      { name: 'Tornado', score: 2, color: '#7b52ab' },
    ],
  },
  'Fresno': {
    county: 'Fresno County',
    subhead: 'California · Central Valley',
    overallScore: 61,
    riskTier: 'Moderate',
    hazards: [
      { name: 'Wildfire', score: 65, color: '#e65100' },
      { name: 'Earthquake', score: 40, color: '#d4a359' },
      { name: 'Flood', score: 28, color: '#4a72b2' },
      { name: 'Hurricane', score: 0, color: '#2e7d32' },
      { name: 'Tornado', score: 3, color: '#7b52ab' },
    ],
  },
  'San Diego': {
    county: 'San Diego County',
    subhead: 'California · San Diego area',
    overallScore: 68,
    riskTier: 'Relatively high',
    hazards: [
      { name: 'Wildfire', score: 84, color: '#e65100' },
      { name: 'Earthquake', score: 60, color: '#d4a359' },
      { name: 'Flood', score: 20, color: '#4a72b2' },
      { name: 'Hurricane', score: 1, color: '#2e7d32' },
      { name: 'Tornado', score: 1, color: '#7b52ab' },
    ],
  },
};

export default function HeroScoreCard() {
  const [activePlace, setActivePlace] = useState('Palm Springs');
  const current = SAMPLE_DATA[activePlace];

  return (
    <div className="bg-[#1a1714] border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
      {/* Location Preset Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(SAMPLE_DATA).map((key) => (
          <button
            key={key}
            onClick={() => setActivePlace(key)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activePlace === key
                ? 'bg-white text-black font-semibold'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Main Score & Location Details */}
      <div className="flex items-center gap-5 mb-6">
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#b94a2a] bg-[#221c18]">
          <div className="text-center">
            <span className="text-2xl font-black block leading-none">{current.overallScore}</span>
            <span className="text-[8px] font-mono tracking-widest text-gray-400 block mt-0.5">OF 100</span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">{current.county}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{current.subhead}</p>
          <span className="inline-block mt-2 text-[11px] font-medium bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 text-amber-200">
            {current.riskTier}
          </span>
        </div>
      </div>

      {/* Hazard Progress Bars */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        {current.hazards.map((h) => (
          <div key={h.name} className="flex items-center justify-between text-xs">
            <span className="text-gray-300 w-24">{h.name}</span>
            <div className="flex-1 mx-3 h-2 bg-[#2a2420] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${h.score}%`, backgroundColor: h.color }}
              />
            </div>
            <span className="text-right w-6 font-mono text-gray-400">{h.score}</span>
          </div>
        ))}
      </div>

      {/* Card Footer Link */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest">SAMPLE VALUES</span>
        <Link href="/map" className="text-amber-400 hover:text-amber-300 font-medium">
          Open on the map →
        </Link>
      </div>
    </div>
  );
}
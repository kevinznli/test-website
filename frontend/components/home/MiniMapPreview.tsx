// frontend/components/home/MiniMapPreview.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HazardStat {
  name: string;
  score: number;
  driver: string;
  color: string;
}

interface AreaProfile {
  name: string;
  county: string;
  coordinates: string;
  compositeScore: number;
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  tierColor: string;
  hazards: HazardStat[];
}

const SAMPLE_AREAS: AreaProfile[] = [
  {
    name: 'Palm Springs Residence',
    county: 'Riverside County, CA',
    coordinates: '33.8303° N, 116.5453° W',
    compositeScore: 78,
    tier: 'Critical',
    tierColor: '#7a221b',
    hazards: [
      { name: 'Wildfire', score: 86, driver: 'Santa Ana pass winds & 11% RH', color: '#7a221b' },
      { name: 'Earthquake', score: 62, driver: 'San Andreas southern branch proximity', color: '#ca6834' },
      { name: 'Flash Flood', score: 28, driver: 'Canyon alluvial fan runoff risk', color: '#e5ab58' },
      { name: 'Severe Storm', score: 14, driver: 'Normal convective baseline', color: '#fef3cc' },
    ],
  },
  {
    name: 'Santa Rosa Property',
    county: 'Sonoma County, CA',
    coordinates: '38.4404° N, 122.7141° W',
    compositeScore: 68,
    tier: 'Elevated',
    tierColor: '#a23924',
    hazards: [
      { name: 'Wildfire', score: 74, driver: 'WUI dry grass & perimeter watch', color: '#a23924' },
      { name: 'Earthquake', score: 58, driver: 'Rodgers Creek fault corridor', color: '#ca6834' },
      { name: 'Flash Flood', score: 32, driver: 'Russian River tributary monitoring', color: '#e5ab58' },
      { name: 'Severe Storm', score: 20, driver: 'Coastal front approaching', color: '#fef3cc' },
    ],
  },
  {
    name: 'Fresno Valley Home',
    county: 'Fresno County, CA',
    coordinates: '36.7468° N, 119.7726° W',
    compositeScore: 42,
    tier: 'Moderate',
    tierColor: '#ca6834',
    hazards: [
      { name: 'Flash Flood', score: 48, driver: 'Central basin snowmelt runoff', color: '#ca6834' },
      { name: 'Severe Storm', score: 34, driver: 'Summer convective heat storms', color: '#e5ab58' },
      { name: 'Earthquake', score: 30, driver: 'Valley floor seismic attenuation', color: '#e5ab58' },
      { name: 'Wildfire', score: 18, driver: 'Agricultural buffer zone', color: '#fef3cc' },
    ],
  },
];

export default function MiniMapPreview() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeArea = SAMPLE_AREAS[selectedIdx];

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
      {/* Area Selector Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
          Sample Monitored Areas
        </span>
        <div className="flex gap-1">
          {SAMPLE_AREAS.map((area, i) => (
            <button
              key={area.name}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                i === selectedIdx
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Home Area Card */}
      <div className="mt-4 p-4 rounded-xl bg-[#fcfbf7] border border-gray-200/80">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-medium text-sm text-gray-900">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeArea.name}
            </div>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">{activeArea.county}</p>
            <p className="text-[10px] text-gray-400 font-mono">{activeArea.coordinates}</p>
          </div>

          {/* Composite Score Ring Badge */}
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300"
            style={{
              borderColor: activeArea.tierColor,
              backgroundColor: `${activeArea.tierColor}0D`,
            }}
          >
            <span
              className="text-lg font-bold font-mono tracking-tight"
              style={{ color: activeArea.tierColor }}
            >
              {activeArea.compositeScore}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
              / 100
            </span>
          </div>
        </div>

        {/* Hazard Exposure Rows */}
        <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-2">
          {activeArea.hazards.map((hazard) => (
            <div key={hazard.name} className="text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-gray-800">{hazard.name}</span>
                <span className="font-mono font-bold" style={{ color: hazard.color }}>
                  {hazard.score}/100
                </span>
              </div>
              {/* Progress Track */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${hazard.score}%`,
                    backgroundColor: hazard.color,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{hazard.driver}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link to Full Map */}
      <Link
        href="/map"
        className="mt-4 flex items-center justify-between text-xs font-medium text-gray-700 hover:text-black group transition-colors"
      >
        <span>Inspect your county on the interactive map</span>
        <span className="group-hover:translate-x-0.5 transition-transform font-mono">→</span>
      </Link>
    </div>
  );
}
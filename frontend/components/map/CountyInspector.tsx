// frontend/components/map/CountyInspector.tsx
'use client';

import React from 'react';
import { CountyRecord } from '@/lib/types';

interface Props {
  county: CountyRecord;
  onBackToState: () => void;
}

export default function CountyInspector({ county, onBackToState }: Props) {
  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Critical': return 'bg-[#7a221b] text-white';
      case 'Elevated': return 'bg-[#ca6834] text-white';
      case 'Moderate': return 'bg-[#e5ab58] text-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <aside className="w-full lg:w-88 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Navigation breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <button
            onClick={onBackToState}
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1 font-mono cursor-pointer"
          >
            ← Back to {county.state}
          </button>
          <span className="text-[10px] font-mono text-gray-400">FIPS: {county.fips}</span>
        </div>

        {/* Header */}
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight">{county.name}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Pop: {county.pop}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-gray-900 block leading-none">
              {county.compositeScore}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${getBadgeColor(county.tier)}`}>
              {county.tier}
            </span>
          </div>
        </div>

        {/* Live Warning Banner */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            Live Threat Advisory
          </div>
          <p className="text-[11px] text-amber-800 mt-1 leading-snug">{county.activeAlert}</p>
        </div>

        {/* Sub-Hazard Scoring Breakdown */}
        <div className="mt-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block mb-3 font-semibold">
            Hazard Scores & Active Conditions
          </span>

          <div className="space-y-3.5">
            {county.hazards.map((h) => (
              <div key={h.name} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-900">{h.name}</span>
                  <span className="font-mono font-bold text-gray-800">{h.score}/100</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${h.score}%`,
                      backgroundColor:
                        h.score >= 75 ? '#7a221b' : h.score >= 50 ? '#ca6834' : '#e5ab58',
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-1 leading-tight">{h.warning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono flex items-center justify-between">
        <span>Synced with NWS & USGS feeds</span>
        <span className="text-emerald-600 font-semibold">● Active</span>
      </div>
    </aside>
  );
}
// frontend/components/map/CountyInspector.tsx
'use client';

import { tierBadgeStyle } from '@/lib/tiers';
import type { CountyRecord } from '@/lib/types';
import HazardList from './HazardList';

interface Props {
  county: CountyRecord;
  onBackToState: () => void;
}

export default function CountyInspector({ county, onBackToState }: Props) {
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
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight">{county.name}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Pop: {county.pop}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-gray-900 block leading-none">
              {county.compositeScore}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1"
              style={tierBadgeStyle(county.tier)}
            >
              {county.tier}
            </span>
          </div>
        </div>

        {/* Live Warning Banner */}
        {county.activeAlert ? (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              Live Threat Advisory
            </div>
            <p className="text-[11px] text-amber-800 mt-1 leading-snug">{county.activeAlert}</p>
          </div>
        ) : (
          <p className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
            No active NWS alerts
          </p>
        )}

        {/* Sub-Hazard Scoring Breakdown */}
        <div className="mt-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block mb-3 font-semibold">
            Hazard Scores & Active Conditions
          </span>
          <HazardList hazards={county.hazards} />
        </div>
      </div>

      <p className="pt-4 mt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono leading-snug">
        Includes this county&apos;s weather forecast and river gauges, which the map doesn&apos;t,
        so this score can differ from the map colour.
      </p>
    </aside>
  );
}

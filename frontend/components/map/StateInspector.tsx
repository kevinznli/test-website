// frontend/components/map/StateInspector.tsx
'use client';

import { tierBadgeStyle } from '@/lib/tiers';
import type { StateRecord } from '@/lib/types';
import HazardList from './HazardList';

interface Props {
  stateData: StateRecord;
  viewMode: 'states' | 'counties';
  onDrillDown: () => void;
}

function alertCountLabel(count: number | undefined) {
  if (count === undefined) return 'Unknown';
  return `${count} ${count === 1 ? 'Alert' : 'Alerts'}`;
}

export default function StateInspector({ stateData, viewMode, onDrillDown }: Props) {
  const topHazard = stateData.hazards[0];

  return (
    <aside className="w-full lg:w-88 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{stateData.name}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {stateData.countiesCount} counties · {stateData.population} residents
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black font-mono text-gray-900 block leading-none">
              {stateData.compositeScore}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 whitespace-nowrap"
              style={tierBadgeStyle(stateData.tier)}
            >
              {stateData.tier} Risk
            </span>
          </div>
        </div>

        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">Active Alerts</span>
            <span className="text-base font-bold text-gray-900 font-mono mt-0.5 block">
              {alertCountLabel(stateData.activeAlertCount)}
            </span>
          </div>
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">Top Hazard</span>
            <span className="text-base font-bold text-gray-900 font-mono mt-0.5 block">
              {topHazard?.name ?? 'None'}
            </span>
          </div>
        </div>

        {/* Primary Alert Callout */}
        {stateData.primaryAlert ? (
          <div className="mt-3 p-3 bg-red-50/80 border border-red-200/70 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-red-900 font-bold block">
              Current Statewide Focus
            </span>
            <p className="text-xs text-red-950 font-medium mt-0.5 leading-snug">
              {stateData.primaryAlert}
            </p>
          </div>
        ) : (
          <p className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
            No active NWS alerts
          </p>
        )}

        {/* Hazard Breakdown with Live Drivers */}
        <div className="mt-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block mb-2.5 font-semibold">
            Hazard Scores & Drivers
          </span>
          <HazardList hazards={stateData.hazards} />
        </div>
      </div>

      {viewMode === 'states' ? (
        <button
          type="button"
          onClick={onDrillDown}
          className="w-full mt-6 py-3 bg-[#1b232c] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          View county breakdown →
        </button>
      ) : (
        <p className="w-full mt-6 py-3 text-center bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl">
          Click a county on the map for details
        </p>
      )}
    </aside>
  );
}

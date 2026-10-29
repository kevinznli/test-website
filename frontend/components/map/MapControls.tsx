'use client';

import React from 'react';

interface Props {
  viewMode: 'states' | 'counties';
  onViewModeChange: (mode: 'states' | 'counties') => void;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedHazard: string;
  onHazardChange: (hazard: string) => void;
}

export default function MapControls({
  viewMode,
  onViewModeChange,
  selectedMetric,
  onMetricChange,
  selectedHazard,
  onHazardChange,
}: Props) {
  const hazards = ['All hazards', 'Earthquake', 'Flood', 'Wildfire', 'Hurricane', 'Tornado'];

  return (
    <div className="w-full space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex p-1 bg-gray-200/80 rounded-full border border-gray-300/70">
            <button
              onClick={() => onViewModeChange('states')}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'states'
                  ? 'bg-[#1b232c] text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              States
            </button>
            <button
              onClick={() => onViewModeChange('counties')}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'counties'
                  ? 'bg-[#1b232c] text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Counties
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Show</span>
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg shadow-2xs font-medium text-gray-800 focus:outline-none"
            >
              <option value="highRiskPct">% of people in high-risk counties</option>
              <option value="lossPerPerson">Expected annual loss per person</option>
              <option value="totalLoss">Total expected annual loss</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search a county or ZIP"
            disabled
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg w-52 text-gray-400 cursor-not-allowed"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Planned
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60 text-xs">
        <span className="text-gray-400 font-mono text-[11px] mr-1">Hazard:</span>
        {hazards.map((hazard) => (
          <button
            key={hazard}
            onClick={() => onHazardChange(hazard)}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              selectedHazard === hazard
                ? 'bg-[#1b232c] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {hazard}
          </button>
        ))}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Planned
        </span>
      </div>
    </div>
  );
}
'use client';

import type { MapMetric, SearchResult } from '@/lib/types';
import CountySearch from './CountySearch';

export const METRIC_FILTERS: { metric: MapMetric; label: string; legendTitle: string }[] = [
  { metric: 'compositeScore', label: 'All hazards', legendTitle: 'Overall risk score' },
  { metric: 'wildfire', label: 'Wildfire', legendTitle: 'Wildfire score' },
  { metric: 'earthquake', label: 'Earthquake', legendTitle: 'Earthquake score' },
  { metric: 'flood', label: 'Flood', legendTitle: 'Flood score' },
  { metric: 'severeStorm', label: 'Severe Storm', legendTitle: 'Severe storm score' },
  { metric: 'hurricane', label: 'Hurricane', legendTitle: 'Hurricane score' },
  { metric: 'tornado', label: 'Tornado', legendTitle: 'Tornado score' },
];

interface Props {
  viewMode: 'states' | 'counties';
  onViewModeChange: (mode: 'states' | 'counties') => void;
  selectedMetric: MapMetric;
  onMetricChange: (metric: MapMetric) => void;
  initialQuery: string | null;
  onSearchSelect: (result: SearchResult) => void;
}

export default function MapControls({
  viewMode,
  onViewModeChange,
  selectedMetric,
  onMetricChange,
  initialQuery,
  onSearchSelect,
}: Props) {
  return (
    <div className="w-full space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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

        <CountySearch key={initialQuery} initialQuery={initialQuery} onSelect={onSearchSelect} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60 text-xs">
        <span className="text-gray-400 font-mono text-[11px] mr-1">Hazard:</span>
        {METRIC_FILTERS.map(({ metric, label }) => (
          <button
            key={metric}
            onClick={() => onMetricChange(metric)}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              selectedMetric === metric
                ? 'bg-[#1b232c] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

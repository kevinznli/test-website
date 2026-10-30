// frontend/app/map/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import MapControls from '@/components/map/MapControls';
import MapLegend from '@/components/map/MapLegend';
import StateInspector from '@/components/map/StateInspector';
import { US_STATES_GRID } from '@/lib/mockRiskData';
import { StateRecord } from '@/lib/types';

// Load Leaflet dynamically without SSR
const RiskLeafletMap = dynamic(
  () => import('@/components/map/RiskLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] bg-gray-100/80 animate-pulse rounded-2xl flex items-center justify-center border border-gray-200">
        <span className="text-xs font-mono text-gray-500">Initializing GIS Viewer...</span>
      </div>
    ),
  }
);

export default function RiskMapPage() {
  const [viewMode, setViewMode] = useState<'states' | 'counties'>('states');
  const [metric, setMetric] = useState('lossPerPerson');
  const [hazard, setHazard] = useState('All hazards');
  const [selectedState, setSelectedState] = useState<StateRecord>(
    US_STATES_GRID.find((s) => s.code === 'CA') || US_STATES_GRID[0]
  );

  const handleFeatureSelect = (name: string, type: 'state' | 'county') => {
    if (type === 'state') {
      const match = US_STATES_GRID.find((s) => s.name.toLowerCase() === name.toLowerCase());
      if (match) setSelectedState(match);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#111827] flex flex-col justify-between">
      <Navigation />

      <main className="max-w-7xl w-full mx-auto px-6 py-8">
        {/* Top Controls: Switch between States and Counties */}
        <MapControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedMetric={metric}
          onMetricChange={setMetric}
          selectedHazard={hazard}
          onHazardChange={setHazard}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          {/* Main Map Viewer */}
          <div className="flex-1 relative">
            <RiskLeafletMap
              viewMode={viewMode}
              onSelectFeature={handleFeatureSelect}
            />
            <MapLegend />
          </div>

          {/* Right-Hand Detail Panel */}
          <StateInspector
            stateData={selectedState}
            onDrillDown={() => setViewMode('counties')}
          />
        </div>

        <p className="text-[11px] text-gray-500 font-mono mt-4">
          Proof of Concept · Interactive GIS Map. States and counties shaded across a 5-tier risk gradient.
        </p>
      </main>

      <Footer />
    </div>
  );
}
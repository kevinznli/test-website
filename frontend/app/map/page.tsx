'use client';

import React, { useState } from 'react';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import MapControls from '@/components/map/MapControls';
import CartogramGrid from '@/components/map/CartogramGrid';
import MapLegend from '@/components/map/MapLegend';
import StateInspector from '@/components/map/StateInspector';
import { US_STATES_GRID } from '@/lib/mockRiskData';
import { StateRecord } from '@/lib/types';

export default function RiskMapPage() {
  const [viewMode, setViewMode] = useState<'states' | 'counties'>('states');
  const [metric, setMetric] = useState('lossPerPerson');
  const [hazard, setHazard] = useState('All hazards');
  const [selectedState, setSelectedState] = useState<StateRecord>(
    US_STATES_GRID.find((s) => s.code === 'CA') || US_STATES_GRID[0]
  );

  const getQuintileColor = (loss: number) => {
    if (loss > 607) return '#7a221b';
    if (loss > 504) return '#a23924';
    if (loss > 425) return '#ca6834';
    if (loss > 336) return '#e5ab58';
    return '#fef3cc';
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#111827] flex flex-col justify-between">
      <Navigation />

      <main className="max-w-7xl w-full mx-auto px-6 py-8">
        <MapControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedMetric={metric}
          onMetricChange={setMetric}
          selectedHazard={hazard}
          onHazardChange={setHazard}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          <div className="flex-1 relative">
            <CartogramGrid
              viewMode={viewMode}
              states={US_STATES_GRID}
              selectedState={selectedState}
              onSelectState={setSelectedState}
              getColor={getQuintileColor}
            />
            {viewMode === 'states' && <MapLegend />}
          </div>

          <StateInspector
            stateData={selectedState}
            onDrillDown={() => setViewMode('counties')}
          />
        </div>

        <p className="text-[11px] text-gray-500 font-mono mt-4">
          Data:{' '}
          <a
            href="https://hazards.fema.gov/nri/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-900"
          >
            FEMA National Risk Index
          </a>
          , December 2025. Colors split states into five equal-sized groups.
        </p>
      </main>

      <Footer />
    </div>
  );
}
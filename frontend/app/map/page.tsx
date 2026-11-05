// frontend/app/map/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import MapControls from '@/components/map/MapControls';
import MapLegend from '@/components/map/MapLegend';
import StateInspector from '@/components/map/StateInspector';
import CountyInspector from '@/components/map/CountyInspector';
import { CALIFORNIA_STATE, SAMPLE_COUNTIES } from '@/lib/mockRiskData';
import { StateRecord, CountyRecord } from '@/lib/types';

const RiskLeafletMap = dynamic(
  () => import('@/components/map/RiskLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] bg-gray-100/80 animate-pulse rounded-2xl flex items-center justify-center border border-gray-200">
        <span className="text-xs font-mono text-gray-500">Initializing GIS Map...</span>
      </div>
    ),
  }
);

export default function RiskMapPage() {
  const [viewMode, setViewMode] = useState<'states' | 'counties'>('states');
  const [metric, setMetric] = useState('score');
  const [hazard, setHazard] = useState('All hazards');
  const [selectedState, setSelectedState] = useState<StateRecord>(CALIFORNIA_STATE);
  const [selectedCounty, setSelectedCounty] = useState<CountyRecord | null>(null);

  // Handle clicking a polygon on the map
  const handleFeatureSelect = (name: string, type: 'state' | 'county') => {
    if (type === 'county') {
      const match = SAMPLE_COUNTIES.find(
        (c) => c.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.name.toLowerCase())
      ) || {
        ...SAMPLE_COUNTIES[0],
        name: name.includes('County') ? name : `${name} County`,
      };
      setSelectedCounty(match);
      setViewMode('counties');
    } else {
      setSelectedCounty(null);
    }
  };

  // Called when clicking "View county breakdown"
  const handleDrillDownToCounties = () => {
    setViewMode('counties');
    // Default to the highest-risk county in the state (e.g. Riverside)
    setSelectedCounty(SAMPLE_COUNTIES[0]);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#111827] flex flex-col justify-between">
      <Navigation />

      <main className="max-w-7xl w-full mx-auto px-6 py-8">
        <MapControls
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            if (mode === 'states') setSelectedCounty(null);
            else if (!selectedCounty) setSelectedCounty(SAMPLE_COUNTIES[0]);
          }}
          selectedMetric={metric}
          onMetricChange={setMetric}
          selectedHazard={hazard}
          onHazardChange={setHazard}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          <div className="flex-1 relative">
            <RiskLeafletMap
              viewMode={viewMode}
              onSelectFeature={handleFeatureSelect}
            />
            <MapLegend />
          </div>

          {/* Conditional Sidebar: Shows County details if in county mode, State details otherwise */}
          {viewMode === 'counties' && selectedCounty ? (
            <CountyInspector
              county={selectedCounty}
              onBackToState={() => {
                setViewMode('states');
                setSelectedCounty(null);
              }}
            />
          ) : (
            <StateInspector
              stateData={selectedState}
              onDrillDown={handleDrillDownToCounties}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
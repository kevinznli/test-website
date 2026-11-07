// frontend/components/map/CartogramGrid.tsx
'use client';

import React from 'react';
import { StateRecord, CountyRecord } from '@/lib/types';
import { SAMPLE_COUNTIES } from '@/lib/mockRiskData';

interface Props {
  viewMode: 'states' | 'counties';
  states: StateRecord[];
  selectedState: StateRecord;
  onSelectState: (state: StateRecord) => void;
  getColor: (scoreOrLoss: number) => string;
}

export default function CartogramGrid({
  viewMode,
  states,
  selectedState,
  onSelectState,
  getColor,
}: Props) {
  // Helper to determine badge color if county.color is absent
  const getTierColor = (county: CountyRecord) => {
    if (county.color) return county.color;
    switch (county.tier) {
      case 'Critical': return '#7a221b';
      case 'Elevated': return '#ca6834';
      case 'Moderate': return '#e5ab58';
      default: return '#9ca3af';
    }
  };

  return (
    <div className="relative w-full h-[540px] bg-[#f2ede4]/80 rounded-2xl p-6 border border-gray-200/80 overflow-hidden flex flex-col justify-between">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col rounded-lg border border-gray-300 bg-white shadow-2xs overflow-hidden">
        <button type="button" className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold border-b border-gray-200 cursor-pointer">+</button>
        <button type="button" className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold cursor-pointer">−</button>
      </div>

      {/* 12-Column State Grid vs County Breakdown */}
      {viewMode === 'states' ? (
        <div className="grid grid-cols-12 gap-2 h-full w-full max-w-4xl mx-auto items-center">
          {states.map((st) => {
            const isSelected = selectedState.code === st.code;
            // Evaluates compositeScore (0-100) or falls back to legacy lossPerPerson
            const metricValue = st.compositeScore ?? st.lossPerPerson ?? 50;

            return (
              <button
                key={st.code}
                type="button"
                onClick={() => onSelectState(st)}
                style={{
                  gridRow: st.row,
                  gridColumn: st.col,
                  backgroundColor: getColor(metricValue),
                }}
                className={`w-full aspect-square rounded-md flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-black scale-105 z-10 shadow-md font-bold'
                    : 'hover:opacity-90 hover:scale-105'
                }`}
              >
                <span className="text-[11px] font-bold text-gray-900 leading-none">{st.code}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-white/70 rounded-xl border border-gray-200 overflow-y-auto max-h-[460px]">
          <h4 className="text-xs font-mono font-bold text-gray-700 uppercase mb-3">
            County Breakdown · {selectedState.name}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_COUNTIES.map((county) => (
              <div
                key={county.name}
                className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 block">{county.name}</span>
                  <span className="text-[11px] text-gray-500 font-mono">Pop: {county.pop}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-gray-900 block">
                    {county.compositeScore ? `${county.compositeScore}/100` : county.lossPerPerson || 'N/A'}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold text-white inline-block mt-0.5"
                    style={{ backgroundColor: getTierColor(county) }}
                  >
                    {county.tier || county.risk || 'Moderate'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
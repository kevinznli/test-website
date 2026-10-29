'use client';

import React from 'react';
import { StateRecord } from '@/lib/types';
import { SAMPLE_COUNTIES } from '@/lib/mockRiskData';

interface Props {
  viewMode: 'states' | 'counties';
  states: StateRecord[];
  selectedState: StateRecord;
  onSelectState: (state: StateRecord) => void;
  getColor: (loss: number) => string;
}

export default function CartogramGrid({
  viewMode,
  states,
  selectedState,
  onSelectState,
  getColor,
}: Props) {
  return (
    <div className="relative w-full h-[540px] bg-[#f2ede4]/80 rounded-2xl p-6 border border-gray-200/80 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-4 right-4 z-10 flex flex-col rounded-lg border border-gray-300 bg-white shadow-2xs overflow-hidden">
        <button className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold border-b border-gray-200">+</button>
        <button className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold">−</button>
      </div>

      {viewMode === 'states' ? (
        <div className="grid grid-cols-12 gap-2 h-full w-full max-w-4xl mx-auto items-center">
          {states.map((st) => {
            const isSelected = selectedState.code === st.code;
            return (
              <button
                key={st.code}
                onClick={() => onSelectState(st)}
                style={{
                  gridRow: st.row,
                  gridColumn: st.col,
                  backgroundColor: getColor(st.lossPerPerson),
                }}
                className={`w-full aspect-square rounded-md flex flex-col items-center justify-center transition-all ${
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
                  <span className="font-mono font-semibold text-gray-900 block">{county.lossPerPerson}/yr</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold text-white inline-block mt-0.5"
                    style={{ backgroundColor: county.color }}
                  >
                    {county.risk}
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
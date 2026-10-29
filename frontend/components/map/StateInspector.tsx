'use client';

import React from 'react';
import { StateRecord } from '@/lib/types';

interface Props {
  stateData: StateRecord;
  onDrillDown: () => void;
}

export default function StateInspector({ stateData, onDrillDown }: Props) {
  return (
    <aside className="w-full lg:w-80 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{stateData.name}</h2>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          {stateData.countiesCount} counties · {stateData.population} people
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">Loss per person / yr</span>
            <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">
              ${stateData.lossPerPerson}
            </span>
          </div>
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">Total loss / yr</span>
            <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">
              {stateData.totalLoss}
            </span>
          </div>
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">People in high-risk</span>
            <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">
              {stateData.highRiskPct}%
            </span>
          </div>
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
            <span className="text-[10px] text-gray-500 block">High-risk counties</span>
            <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">
              {stateData.highRiskCounties}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block mb-3 font-semibold">
            Biggest hazards (expected annual loss)
          </span>

          <div className="space-y-3">
            {stateData.hazards.map((h) => (
              <div key={h.name} className="text-xs">
                <div className="flex justify-between items-center text-gray-800 font-medium mb-1">
                  <span>{h.name}</span>
                  <span className="font-mono text-gray-600">{h.loss}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#993424] h-full rounded-full"
                    style={{ width: `${h.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onDrillDown}
        className="w-full mt-6 py-3 bg-[#1b232c] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
      >
        View county breakdown
      </button>
    </aside>
  );
}
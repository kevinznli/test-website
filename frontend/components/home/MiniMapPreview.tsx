'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface StateTile {
  code: string;
  name: string;
  loss: string;
  hazard: string;
  color: string;
  isHighRisk?: boolean;
}

const PREVIEW_STATES: StateTile[] = [
  { code: 'WA', name: 'Washington', loss: '$482', hazard: 'Flood / Seismic', color: '#ca6834' },
  { code: 'MT', name: 'Montana', loss: '$310', hazard: 'Severe Winter', color: '#fef3cc' },
  { code: 'ND', name: 'North Dakota', loss: '$290', hazard: 'Flood', color: '#fef3cc' },
  { code: 'MN', name: 'Minnesota', loss: '$345', hazard: 'Severe Storm', color: '#e5ab58' },
  { code: 'ME', name: 'Maine', loss: '$240', hazard: 'Coastal Storm', color: '#fef3cc' },

  { code: 'OR', name: 'Oregon', loss: '$460', hazard: 'Wildfire', color: '#ca6834' },
  { code: 'WY', name: 'Wyoming', loss: '$380', hazard: 'Wind / Hail', color: '#e5ab58' },
  { code: 'IL', name: 'Illinois', loss: '$415', hazard: 'Tornado / Flood', color: '#e5ab58' },
  { code: 'NY', name: 'New York', loss: '$490', hazard: 'Coastal Surge', color: '#ca6834' },
  { code: 'MA', name: 'Massachusetts', loss: '$320', hazard: 'Winter Surge', color: '#fef3cc' },

  { code: 'CA', name: 'California', loss: '$765', hazard: 'Earthquake / Fire', color: '#7a221b', isHighRisk: true },
  { code: 'CO', name: 'Colorado', loss: '$540', hazard: 'Wildfire / Hail', color: '#a23924', isHighRisk: true },
  { code: 'MO', name: 'Missouri', loss: '$495', hazard: 'Severe Wind', color: '#ca6834' },
  { code: 'NC', name: 'North Carolina', loss: '$585', hazard: 'Hurricane', color: '#a23924', isHighRisk: true },
  { code: 'VA', name: 'Virginia', loss: '$390', hazard: 'River Flooding', color: '#e5ab58' },

  { code: 'AZ', name: 'Arizona', loss: '$410', hazard: 'Extreme Heat', color: '#e5ab58' },
  { code: 'TX', name: 'Texas', loss: '$710', hazard: 'Hurricane / Hail', color: '#7a221b', isHighRisk: true },
  { code: 'LA', name: 'Louisiana', loss: '$795', hazard: 'Hurricane Surge', color: '#7a221b', isHighRisk: true },
  { code: 'FL', name: 'Florida', loss: '$840', hazard: 'Hurricane / Wind', color: '#7a221b', isHighRisk: true },
  { code: 'GA', name: 'Georgia', loss: '$515', hazard: 'Tornado / Wind', color: '#a23924', isHighRisk: true },
];

export default function MiniMapPreview() {
  const [activeTile, setActiveTile] = useState<StateTile | null>(null);

  return (
    <div className="relative group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
      {/* Top Header & Telemetry Status */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="font-semibold text-gray-700">FEMA NRI Risk Index</span>
        </div>
        <Link
          href="/map"
          className="text-[11px] font-mono text-gray-500 group-hover:text-black underline underline-offset-2 flex items-center gap-1 transition-colors"
        >
          <span>interactive map</span>
          <span>→</span>
        </Link>
      </div>

      {/* State Tiles Container */}
      <div className="relative bg-[#f7f3eb] rounded-xl p-3.5 border border-[#ece4d0]">
        <div className="grid grid-cols-5 gap-2">
          {PREVIEW_STATES.map((st) => (
            <div
              key={st.code}
              onMouseEnter={() => setActiveTile(st)}
              onMouseLeave={() => setActiveTile(null)}
              style={{ backgroundColor: st.color }}
              className={`relative h-10 rounded-md flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-20 shadow-xs ${
                st.isHighRisk ? 'ring-1 ring-red-900/30' : ''
              }`}
            >
              {/* Subtle emergency pulsing border for critical high-loss states */}
              {st.isHighRisk && (
                <span className="absolute inset-0 rounded-md animate-pulse border border-white/40 pointer-events-none" />
              )}
              <span
                className={`text-[11px] font-mono font-bold select-none ${
                  st.color === '#fef3cc' || st.color === '#e5ab58'
                    ? 'text-gray-900'
                    : 'text-white'
                }`}
              >
                {st.code}
              </span>
            </div>
          ))}
        </div>

        {/* Hover / Inspection Badge */}
        <div className="mt-3 pt-2.5 border-t border-[#e2d8c0] flex items-center justify-between text-xs font-mono min-h-[28px]">
          {activeTile ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{activeTile.name}:</span>
                <span className="text-gray-600 text-[11px]">{activeTile.hazard}</span>
              </div>
              <span className="font-bold text-red-700">{activeTile.loss}/person</span>
            </>
          ) : (
            <span className="text-gray-400 text-[10px] italic">
              Hover over any state tile to preview annualized loss
            </span>
          )}
        </div>
      </div>

      {/* 5-Quintile Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-3.5 px-0.5">
        <span className="uppercase tracking-wider">Lower Risk</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#fef3cc] rounded-xs" title="≤ $336" />
          <span className="w-2.5 h-2.5 bg-[#e5ab58] rounded-xs" title="$336 – $425" />
          <span className="w-2.5 h-2.5 bg-[#ca6834] rounded-xs" title="$425 – $504" />
          <span className="w-2.5 h-2.5 bg-[#a23924] rounded-xs" title="$504 – $607" />
          <span className="w-2.5 h-2.5 bg-[#7a221b] rounded-xs ring-1 ring-red-400" title="> $607" />
        </div>
        <span className="uppercase tracking-wider text-red-700 font-semibold">Critical</span>
      </div>

      {/* Click-through action footer */}
      <Link
        href="/map"
        className="mt-3 block w-full py-2 bg-gray-900 hover:bg-black text-white text-[11px] font-semibold text-center rounded-lg transition-colors shadow-xs"
      >
        Explore full US map with county breakdown →
      </Link>
    </div>
  );
}
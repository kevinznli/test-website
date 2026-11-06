'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HazardConfig {
  id: string;
  name: string;
  color: string;
  description: string;
  activeStates: Record<string, string>;
}

const HAZARD_DATA: HazardConfig[] = [
  {
    id: 'flood',
    name: 'Flood',
    color: '#4a72b2',
    description:
      'Riverine and flash flooding follow the Gulf Coast, Florida and the Mississippi and Ohio river valleys.',
    activeStates: {
      LA: '#a23924', MS: '#ca6834', AR: '#ca6834', FL: '#ca6834',
      AL: '#ca6834', TN: '#e5ab58', KY: '#e5ab58', IL: '#ca6834',
      MO: '#ca6834', IA: '#e5ab58', GA: '#e5ab58', SC: '#e5ab58',
      NC: '#e5ab58', TX: '#e5ab58',
    },
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    color: '#e65100',
    description:
      'High risk dominates California, the Sierra Nevada, and intermountain Western forest zones.',
    activeStates: {
      CA: '#7a221b', OR: '#a23924', WA: '#ca6834', NV: '#ca6834',
      ID: '#ca6834', MT: '#ca6834', CO: '#a23924', AZ: '#e5ab58',
      NM: '#e5ab58', UT: '#e5ab58', WY: '#e5ab58',
    },
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    color: '#d4a359',
    description:
      'Cascadia subduction zones, the San Andreas fault system, and the New Madrid seismic zone carry the highest hazard.',
    activeStates: {
      CA: '#7a221b', WA: '#a23924', OR: '#a23924', NV: '#ca6834',
      UT: '#e5ab58', MO: '#ca6834', TN: '#e5ab58', AR: '#e5ab58',
      AK: '#7a221b', HI: '#ca6834',
    },
  },
  {
    id: 'hurricane',
    name: 'Hurricane',
    color: '#2e7d32',
    description:
      'Atlantic coastlines, the Florida peninsula, and the Gulf Basin experience high storm surges and destructive wind bands.',
    activeStates: {
      FL: '#7a221b', LA: '#7a221b', TX: '#a23924', NC: '#a23924',
      SC: '#a23924', GA: '#ca6834', MS: '#ca6834', AL: '#ca6834',
      VA: '#e5ab58', NJ: '#e5ab58', NY: '#e5ab58',
    },
  },
  {
    id: 'tornado',
    name: 'Tornado',
    color: '#7b52ab',
    description:
      'Concentrated heavily throughout the central plains (Tornado Alley) and Southeast Dixie Alley corridors.',
    activeStates: {
      OK: '#7a221b', KS: '#a23924', NE: '#ca6834', TX: '#ca6834',
      IA: '#ca6834', MO: '#ca6834', AR: '#a23924', MS: '#a23924',
      AL: '#a23924', TN: '#ca6834', IL: '#e5ab58', IN: '#e5ab58',
    },
  },
];

const US_STATE_PATHS: { id: string; name: string; d: string }[] = [
  { id: 'WA', name: 'Washington', d: 'M130,40 L210,50 L200,105 L120,95 Z' },
  { id: 'OR', name: 'Oregon', d: 'M120,95 L200,105 L190,175 L105,160 Z' },
  { id: 'CA', name: 'California', d: 'M105,160 L190,175 L165,335 L120,335 L90,260 Z' },
  { id: 'ID', name: 'Idaho', d: 'M200,50 L240,55 L225,170 L190,175 L200,105 Z' },
  { id: 'NV', name: 'Nevada', d: 'M190,175 L250,185 L230,295 L175,280 Z' },
  { id: 'MT', name: 'Montana', d: 'M240,55 L380,70 L370,140 L225,125 Z' },
  { id: 'WY', name: 'Wyoming', d: 'M225,125 L370,140 L360,205 L220,190 Z' },
  { id: 'UT', name: 'Utah', d: 'M220,190 L280,195 L270,275 L220,270 Z' },
  { id: 'CO', name: 'Colorado', d: 'M280,195 L395,205 L385,280 L270,275 Z' },
  { id: 'AZ', name: 'Arizona', d: 'M175,280 L270,290 L260,375 L165,335 Z' },
  { id: 'NM', name: 'New Mexico', d: 'M270,290 L380,295 L370,380 L260,375 Z' },
  { id: 'ND', name: 'North Dakota', d: 'M380,70 L480,75 L475,130 L370,125 Z' },
  { id: 'SD', name: 'South Dakota', d: 'M370,125 L475,130 L470,190 L360,185 Z' },
  { id: 'NE', name: 'Nebraska', d: 'M360,185 L485,195 L475,250 L385,245 Z' },
  { id: 'KS', name: 'Kansas', d: 'M385,245 L500,250 L490,305 L380,300 Z' },
  { id: 'OK', name: 'Oklahoma', d: 'M380,300 L505,305 L500,360 L425,360 L425,320 L375,320 Z' },
  { id: 'TX', name: 'Texas', d: 'M375,320 L425,320 L425,360 L515,360 L520,430 L450,470 L380,390 Z' },
  { id: 'MN', name: 'Minnesota', d: 'M480,75 L555,80 L540,175 L475,160 Z' },
  { id: 'IA', name: 'Iowa', d: 'M485,185 L565,190 L555,255 L480,250 Z' },
  { id: 'MO', name: 'Missouri', d: 'M490,250 L575,255 L565,335 L490,320 Z' },
  { id: 'WI', name: 'Wisconsin', d: 'M545,100 L610,105 L600,185 L545,180 Z' },
  { id: 'IL', name: 'Illinois', d: 'M565,190 L615,195 L600,295 L565,285 Z' },
  { id: 'MI', name: 'Michigan', d: 'M610,120 L675,125 L665,200 L610,190 Z' },
  { id: 'IN', name: 'Indiana', d: 'M615,195 L660,195 L650,280 L610,275 Z' },
  { id: 'OH', name: 'Ohio', d: 'M660,190 L715,190 L705,265 L655,265 Z' },
  { id: 'AR', name: 'Arkansas', d: 'M505,320 L575,320 L570,390 L510,385 Z' },
  { id: 'LA', name: 'Louisiana', d: 'M515,385 L575,390 L585,445 L525,440 Z' },
  { id: 'KY', name: 'Kentucky', d: 'M610,265 L710,260 L695,305 L615,310 Z' },
  { id: 'TN', name: 'Tennessee', d: 'M575,310 L715,305 L705,345 L575,350 Z' },
  { id: 'MS', name: 'Mississippi', d: 'M570,350 L615,350 L605,435 L570,430 Z' },
  { id: 'AL', name: 'Alabama', d: 'M615,345 L665,345 L655,435 L615,435 Z' },
  { id: 'FL', name: 'Florida', d: 'M655,415 L735,410 L755,495 L720,505 L675,440 Z' },
  { id: 'GA', name: 'Georgia', d: 'M665,345 L735,340 L725,415 L665,415 Z' },
  { id: 'SC', name: 'South Carolina', d: 'M715,320 L775,325 L755,375 L710,365 Z' },
  { id: 'NC', name: 'North Carolina', d: 'M705,285 L810,290 L780,335 L695,330 Z' },
  { id: 'VA', name: 'Virginia', d: 'M705,245 L800,245 L785,290 L695,290 Z' },
  { id: 'PA', name: 'Pennsylvania', d: 'M715,185 L800,185 L790,235 L710,235 Z' },
  { id: 'NY', name: 'New York', d: 'M745,120 L825,120 L805,190 L735,185 Z' },
  { id: 'NJ', name: 'New Jersey', d: 'M795,195 L820,195 L810,250 L790,240 Z' },
  { id: 'AK', name: 'Alaska', d: 'M80,390 L135,390 L145,455 L85,465 Z' },
  { id: 'HI', name: 'Hawaii', d: 'M180,440 L240,440 L235,465 L175,465 Z' },
];

export default function HazardMapShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeHazard = HAZARD_DATA[currentIndex];

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HAZARD_DATA.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <section className="bg-[#181512] border border-white/10 rounded-3xl p-8 my-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 flex items-center justify-center relative p-2">
          <svg
            viewBox="50 20 800 500"
            className="w-full h-auto max-h-[440px] drop-shadow-2xl select-none"
          >
            {US_STATE_PATHS.map((state) => {
              const fillColor = activeHazard.activeStates[state.id] || '#faeed7';
              return (
                <path
                  key={state.id}
                  d={state.d}
                  fill={fillColor}
                  stroke="#1c1815"
                  strokeWidth="1.2"
                  className="transition-colors duration-700 ease-in-out cursor-pointer hover:opacity-90"
                >
                  <title>{`${state.name} (${state.id})`}</title>
                </path>
              );
            })}
          </svg>
        </div>

        <div className="lg:col-span-4">
          <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block mb-1">
            NOW SHOWING
          </span>
          <h3 className="text-3xl font-black text-white">{activeHazard.name}</h3>
          <p className="text-xs text-gray-300 mt-3 leading-relaxed min-h-[50px]">
            {activeHazard.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {HAZARD_DATA.map((h, idx) => (
              <button
                key={h.id}
                onClick={() => setCurrentIndex(idx)}
                className={`text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 border transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-white text-black font-semibold border-white'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                {h.name}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="text-xs px-4 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors cursor-pointer"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                key={`${currentIndex}-${isPaused}`}
                className={`h-full bg-amber-400 ${
                  isPaused ? 'w-0' : 'animate-[cycleProgress_4s_linear]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
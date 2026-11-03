'use client';

import React from 'react';

interface FeatureItem {
  number: string;
  title: string;
  description: string;
  iconType: 'bars' | 'network' | 'split' | 'calendar';
}

const FEATURES: FeatureItem[] = [
  {
    number: '01',
    title: 'Every agency feed, harmonized',
    description:
      'We aggregate live feeds from NOAA, USGS, NIFC, and FEMA into a single continuous pipeline so you never have to cross-check four disparate government portals.',
    iconType: 'bars',
  },
  {
    number: '02',
    title: 'Separating baseline from live risk',
    description:
      'Historical 20-year FEMA National Risk Index ratings are calibrated against real-time sensor telemetry to produce an explainable, responsive composite score.',
    iconType: 'split',
  },
  {
    number: '03',
    title: 'Trained on environmental physics',
    description:
      'Multiplicative fire-weather interaction models and distance-decay seismic curves evaluate threats before they evolve into declared local emergencies.',
    iconType: 'network',
  },
  {
    number: '04',
    title: 'Immediate action for what’s next',
    description:
      'Dynamic checklists surface localized mitigation guides, evacuation readiness steps, and emergency contacts tailored specifically to your top hazard.',
    iconType: 'calendar',
  },
];

function FeatureDiagram({ type }: { type: FeatureItem['iconType'] }) {
  switch (type) {
    case 'bars':
      return (
        <div className="w-24 h-20 border border-gray-300 rounded-lg p-2.5 flex flex-col justify-between bg-white shadow-2xs">
          <div className="space-y-1.5">
            <div className="w-1/3 h-1 bg-gray-400 rounded-full" />
            <div className="w-1/2 h-1 bg-gray-400 rounded-full" />
            <div className="w-2/3 h-1 bg-gray-400 rounded-full" />
            <div className="w-4/5 h-1 bg-gray-600 rounded-full" />
            <div className="w-full h-1 bg-black rounded-full" />
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-auto" />
        </div>
      );
    case 'network':
      return (
        <div className="w-24 h-20 border border-gray-300 rounded-lg p-2 flex items-center justify-center bg-white shadow-2xs">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 m-auto w-3 h-3 bg-black rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 border border-gray-600 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border border-gray-600 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-gray-600 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-gray-600 rounded-full" />
            <div className="absolute top-1 left-1 w-1.5 h-1.5 border border-gray-400 rounded-full" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border border-gray-400 rounded-full" />
          </div>
        </div>
      );
    case 'split':
      return (
        <div className="w-24 h-20 border border-gray-300 rounded-lg p-2.5 flex items-center justify-center gap-2 bg-white shadow-2xs">
          <div className="w-8 h-10 border border-gray-500 rounded-md flex items-center justify-center text-[10px] font-mono font-bold">
            A
          </div>
          <div className="w-3 border-t border-dashed border-gray-400" />
          <div className="w-8 h-10 border border-gray-500 rounded-md flex items-center justify-center text-[10px] font-mono font-bold">
            B
          </div>
        </div>
      );
    case 'calendar':
      return (
        <div className="w-24 h-20 border border-gray-300 rounded-lg p-2 flex flex-col justify-between bg-white shadow-2xs">
          <div className="flex justify-between items-center border-b border-gray-200 pb-1">
            <div className="w-2 h-1 bg-gray-400 rounded-xs" />
            <div className="w-2 h-1 bg-gray-400 rounded-xs" />
          </div>
          <div className="grid grid-cols-4 gap-1 p-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <span className="w-1.5 h-1.5 rounded-full border border-gray-400" />
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full" />
        </div>
      );
  }
}

export default function EditorialFeatures() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="mb-14">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 block mb-3">
          — Methodology
        </span>
        <h2 className="text-3xl sm:text-4xl font-normal text-gray-950 tracking-tight leading-tight">
          The clarity of prediction, <br />
          <span className="font-medium text-gray-600">Without guesswork.</span>
        </h2>
      </div>

      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {FEATURES.map((item) => (
          <div
            key={item.number}
            className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            <div className="md:col-span-1">
              <span className="font-mono text-xs text-gray-400">{item.number}</span>
            </div>

            <div className="md:col-span-8 pr-4">
              <h3 className="text-xl font-medium text-gray-900 tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xl">
                {item.description}
              </p>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <FeatureDiagram type={item.iconType} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
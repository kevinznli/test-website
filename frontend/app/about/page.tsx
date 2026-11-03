'use client';

import React from 'react';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import Link from 'next/link';

interface DataSource {
  name: string;
  agency: string;
  type: 'Baseline (Static)' | 'Live Telemetry';
  cadence: string;
  resolution: string;
  description: string;
  link: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    name: 'National Risk Index (NRI)',
    agency: 'FEMA',
    type: 'Baseline (Static)',
    cadence: 'Annual / Biennial',
    resolution: 'Census Tract & County',
    description:
      'Provides 20-year historical baseline risk ratings, expected annual financial loss per person, social vulnerability indices, and community resilience scores across 18 natural hazards.',
    link: 'https://hazards.fema.gov/nri/',
  },
  {
    name: 'Real-Time Seismic Network',
    agency: 'USGS',
    type: 'Live Telemetry',
    cadence: '1 minute (Event-driven)',
    resolution: 'Geographic coordinate (Lat/Lon)',
    description:
      'Continuous stream of seismic events, moment magnitudes, epicenter depths, and ShakeMap peak ground acceleration (PGA) decay vectors within distance buffers.',
    link: 'https://earthquake.usgs.gov/',
  },
  {
    name: 'HRRR & NWS Active Alert Polygons',
    agency: 'NOAA / NWS',
    type: 'Live Telemetry',
    cadence: 'Hourly / 15 minutes',
    resolution: '3 km grid (HRRR)',
    description:
      'Mesoscale atmospheric weather modeling for peak wind gusts, sudden precipitation rates, and real-time CAP alert warning polygons (Red Flag, Flash Flood, High Wind).',
    link: 'https://www.weather.gov/',
  },
  {
    name: 'Wildland Fire Interagency System',
    agency: 'NIFC / IRWIN',
    type: 'Live Telemetry',
    cadence: 'Hourly to Daily',
    resolution: 'Active Perimeter Polygons',
    description:
      'Active fire incident perimeters, containment percentages, and thermal satellite hotspot detections (VIIRS / MODIS) evaluating proximity risk.',
    link: 'https://www.nifc.gov/',
  },
];

export default function AboutDataPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-[#111827] flex flex-col justify-between selection:bg-rose-100">
      <Navigation />

      <main className="w-full flex-grow">
        {/* Header Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 block mb-3">
            — Methodology & Ingestion Pipelines
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-gray-950 leading-tight">
            About the data, <br />
            <span className="font-semibold text-gray-600">The science of explainability.</span>
          </h1>
          <p className="text-sm text-gray-500 mt-5 leading-relaxed max-w-2xl">
            Hazard risk information is scattered across disparate agency databases built for research, 
            not for everyday residents asking <em>&ldquo;how worried should I be about my home right now?&rdquo;</em> 
            Risk Resource synthesizes historical baselines with real-time physical telemetry.
          </p>
        </section>

        {/* Scoring Architecture Schematic */}
        <section className="max-w-5xl mx-auto px-6 py-10 border-t border-gray-200/80">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
              Architecture
            </span>
            <h2 className="text-xl font-medium text-gray-900">How the score is built</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Each hazard is calculated as an isolated 0 to 100 sub-score split into two distinct, explainable components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f7f5ef] p-6 rounded-2xl border border-[#ece4d0]">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                50% Static Baseline
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-3">Long-Term Exposure</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Derived from FEMA NRI 20-year historical incidence, fault line proximity, elevation slope, and designated 100-year flood zone buffers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                50% Live Multiplier
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-3">Real-Time Telemetry</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Injected from hourly NWS alert polygons, HRRR wind gusts (&gt;40 mph), live river stages vs. flood crest, and USGS seismic events.
              </p>
            </div>
          </div>
        </section>

        {/* Agency Ingestion Feeds */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-200/80">
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
              Pipelines
            </span>
            <h2 className="text-xl font-medium text-gray-900">Federal Data Sources</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA_SOURCES.map((src) => (
              <div
                key={src.name}
                className="p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-gray-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                      {src.agency}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {src.type}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-950">{src.name}</h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Sync: {src.cadence}</span>
                  <a
                    href={src.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-900 underline hover:text-rose-600 transition-colors"
                  >
                    Documentation →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Dictionary / Placeholder Table */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-200/80 mb-12">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
              Dictionary
            </span>
            <h2 className="text-xl font-medium text-gray-900">Telemetry Variables & Units</h2>
          </div>

          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 font-mono text-gray-500 text-[11px]">
                  <th className="p-3.5">Hazard Pod</th>
                  <th className="p-3.5">Live Parameter</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Advisory Threshold</th>
                  <th className="p-3.5">Critical Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-gray-700">
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Wildfire</td>
                  <td className="p-3.5">Wind &times; (100 - RH)</td>
                  <td className="p-3.5">Compound Index</td>
                  <td className="p-3.5">RH &le; 15% &amp; Gusts &ge; 25 mph</td>
                  <td className="p-3.5 text-rose-700 font-semibold">Red Flag / Perimeter &lt; 5 mi</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Severe Weather</td>
                  <td className="p-3.5">Peak Wind Gusts</td>
                  <td className="p-3.5">mph</td>
                  <td className="p-3.5">40 mph (NWS Advisory)</td>
                  <td className="p-3.5 text-rose-700 font-semibold">&ge; 58 mph (Structural Shock)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Flood</td>
                  <td className="p-3.5">Gauge vs. Flood Stage</td>
                  <td className="p-3.5">ft / discharge</td>
                  <td className="p-3.5">Action Stage (+0.0 ft)</td>
                  <td className="p-3.5 text-rose-700 font-semibold">Major Flood Crest (+3.5 ft)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Earthquake</td>
                  <td className="p-3.5">Distance-decayed PGA</td>
                  <td className="p-3.5">%g / MMI</td>
                  <td className="p-3.5">M &ge; 3.0 within 30 mi</td>
                  <td className="p-3.5 text-rose-700 font-semibold">M &ge; 5.5 within 20 mi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
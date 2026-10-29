'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  Droplets, 
  Activity, 
  Wind, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  Layers,
  Clock
} from 'lucide-react';

interface ActiveEvent {
  id: string;
  type: 'Wildfire' | 'Flood' | 'Quake' | 'Weather';
  title: string;
  location: string;
  severity: 'High' | 'Moderate' | 'Critical';
  time: string;
}

const SAMPLE_EVENTS: ActiveEvent[] = [
  { id: '1', type: 'Wildfire', title: 'Red Flag Watch (38mph gusts)', location: 'Riverside Basin, CA', severity: 'Critical', time: '12m ago' },
  { id: '2', type: 'Weather', title: 'High Wind Advisory', location: 'San Gorgonio Pass, CA', severity: 'High', time: '24m ago' },
  { id: '3', type: 'Flood', title: 'Action Stage Monitoring', location: 'Sacramento Delta, CA', severity: 'Moderate', time: '41m ago' },
  { id: '4', type: 'Quake', title: 'M3.1 Minor Seismic Event', location: 'Anza Fault Zone, CA', severity: 'Moderate', time: '1h ago' },
];

export default function WireframeDashboard() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Wildfire' | 'Flood' | 'Quake' | 'Weather'>('All');
  const [addressInput, setAddressInput] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const filteredEvents = activeFilter === 'All' 
    ? SAMPLE_EVENTS 
    : SAMPLE_EVENTS.filter(e => e.type === activeFilter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      setSearchTriggered(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#111827] font-sans antialiased">
      
      {/* ─────────────────────────────────────────────────────────────
          BLOCK 0: NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight text-gray-900">Risk Resource</span>
            <span className="hidden sm:inline text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
              v0.1-preview
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#live-map" className="hover:text-gray-900 transition-colors">Live Map</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Methods</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Model</a>
            <a href="#team" className="hover:text-gray-900 transition-colors">Resources</a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">API</a>
          </div>

          <a 
            href="#hero" 
            className="px-4 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-gray-800"
          >
            Check risk
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 1: HERO SECTION
        ───────────────────────────────────────────────────────────── */}
        <section id="hero" className="border border-gray-200 rounded-2xl p-8 sm:p-14 bg-white text-center shadow-sm">
          <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-gray-500 block mb-3">
            US Natural Hazard Risk Score
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-950 max-w-xl mx-auto leading-tight">
            Know your risk before it arrives.
          </h1>

          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter any US address or ZIP"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#111827] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors whitespace-nowrap shadow-sm"
            >
              Check my risk
            </button>
          </form>

          {/* Quick pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            <span>Try sample:</span>
            {['Palm Springs, CA', 'Santa Rosa, CA', 'Miami, FL', 'Boulder, CO'].map((place) => (
              <button
                key={place}
                onClick={() => { setAddressInput(place); setSearchTriggered(true); }}
                className="underline hover:text-gray-900 text-gray-600"
              >
                {place}
              </button>
            ))}
          </div>

          <a href="#live-map" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mt-8 font-medium">
            <span>See live disasters</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SEARCH RESULT PANEL (Reveals dynamically on address entry)
        ───────────────────────────────────────────────────────────── */}
        {searchTriggered && (
          <section className="border border-blue-200 bg-blue-50/50 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-blue-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 font-semibold">Address Report (Placeholder)</span>
                <h3 className="text-xl font-bold text-gray-900">{addressInput}</h3>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-gray-600">
                <span>Lat: 33.8303 · Lon: -116.5453 · FIPS: 06065</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-mono">Composite Score</span>
                <div className="text-3xl font-extrabold text-[#E11D48] mt-1">68 <span className="text-sm font-normal text-gray-400">/ 100</span></div>
                <div className="text-[11px] text-gray-500 mt-2">Baseline: 32 · Live: +36</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Wildfire</span>
                  <span className="text-red-600 font-bold">78/100</span>
                </div>
                <p className="text-xs text-gray-700 mt-2 font-medium">Red Flag Watch (gusts 38mph, RH 11%)</p>
                <span className="text-[10px] text-gray-400 block mt-2">Source: NIFC / Open-Meteo</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Flood</span>
                  <span className="text-green-600 font-bold">12/100</span>
                </div>
                <p className="text-xs text-gray-700 mt-2 font-medium">Stream gauge 4.2ft below action stage</p>
                <span className="text-[10px] text-gray-400 block mt-2">Source: USGS Gauges</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Earthquake</span>
                  <span className="text-gray-700 font-bold">28/100</span>
                </div>
                <p className="text-xs text-gray-700 mt-2 font-medium">0 events &gt; M2.5 within 50mi (past 72h)</p>
                <span className="text-[10px] text-gray-400 block mt-2">Source: USGS Seismic</span>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 2: LIVE MAP & DISASTERS
        ───────────────────────────────────────────────────────────── */}
        <section id="live-map" className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Right now: what is happening across the US
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Aggregated live feeds from NOAA, USGS, NIFC, and FEMA
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg border border-gray-200 text-xs font-medium">
              {(['All', 'Wildfire', 'Flood', 'Quake', 'Weather'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeFilter === tab
                      ? 'bg-white text-gray-900 font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Canvas / GIS Container */}
            <div className="lg:col-span-2 relative min-h-[340px] bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 border border-gray-200 px-2.5 py-1 rounded-md text-[11px] font-mono text-gray-700">
                <Layers className="h-3 w-3 text-gray-500" />
                <span>US Map: fires, gauges, quakes, alerts</span>
              </div>

              {/* Graphical placeholder representing GIS layer */}
              <div className="w-full h-48 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white/60 p-4">
                <Activity className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs font-mono font-medium text-gray-700">
                  Interactive Vector Layer (MapLibre / California Pilot)
                </span>
                <span className="text-[11px] text-gray-400 max-w-sm mt-1">
                  Connects to backend tile endpoint or pre-rendered choropleth. Toggles currently filtered to: <b>{activeFilter}</b>
                </span>
              </div>
            </div>

            {/* Active Events Sidebar */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
                    Active events
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">sorted by severity</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{event.title}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          event.severity === 'Critical' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{event.location}</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 mt-4 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Showing {filteredEvents.length} active events</span>
                <a href="#stats" className="text-gray-700 font-medium hover:underline">View feed logs</a>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Data as of 3:15 PM PDT</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>stale feeds tagged amber</span>
            </span>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 3: ABOUT (4 NUMBERED CARDS)
        ───────────────────────────────────────────────────────────── */}
        <section id="about" className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              About: hazard data, made readable
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Federal agency sites weren't built for residents asking "how worried should I be?"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAFC] flex flex-col justify-between h-44">
              <span className="text-2xl font-mono font-bold text-gray-400">01</span>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-snug">Every feed, one place</h4>
                <p className="text-xs text-gray-500 mt-1">NOAA, USGS, NIFC, and FEMA feeds harmonized into one pipeline.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAFC] flex flex-col justify-between h-44">
              <span className="text-2xl font-mono font-bold text-gray-400">02</span>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-snug">Baseline plus live</h4>
                <p className="text-xs text-gray-500 mt-1">Historical NRI ratings weighted against real-time sensors.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAFC] flex flex-col justify-between h-44">
              <span className="text-2xl font-mono font-bold text-gray-400">03</span>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-snug">Explained, with drivers</h4>
                <p className="text-xs text-gray-500 mt-1">Plain language explaining exactly what caused your score.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAFC] flex flex-col justify-between h-44">
              <span className="text-2xl font-mono font-bold text-gray-400">04</span>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-snug">What to do next</h4>
                <p className="text-xs text-gray-500 mt-1">Immediate, customized safety checklists for your top threat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 4: STATS
        ───────────────────────────────────────────────────────────── */}
        <section id="stats" className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Built on live public data
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-xl p-5 text-center bg-gray-50/50">
              <div className="text-3xl font-extrabold text-gray-950 font-mono">15</div>
              <div className="text-xs text-gray-500 mt-1">data sources</div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 text-center bg-gray-50/50">
              <div className="text-3xl font-extrabold text-gray-950 font-mono">~85k</div>
              <div className="text-xs text-gray-500 mt-1">census tracts</div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 text-center bg-gray-50/50">
              <div className="text-3xl font-extrabold text-gray-950 font-mono">5 min</div>
              <div className="text-xs text-gray-500 mt-1">alert refresh</div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 text-center bg-gray-50/50">
              <div className="text-3xl font-extrabold text-[#E11D48] font-mono">Live</div>
              <div className="text-xs text-gray-500 mt-1">active events</div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 5: HOW THE SCORE WORKS
        ───────────────────────────────────────────────────────────── */}
        <section id="how-it-works" className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            How the score works
          </h2>

          <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAFC]">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono">
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-xs font-semibold">
                Address
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-xs font-semibold">
                Geocode
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-xs font-semibold text-blue-600">
                4 Sub-Scores
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-xs font-semibold text-[#E11D48]">
                Composite
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-xs font-semibold">
                Explanation
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed font-sans">
              Each hazard receives a 0 to 100 sub-score with two distinct parts: 
              a <b>Static Baseline</b> (FEMA NRI, terrain, fault lines) and a <b>Live Multiplier</b> (active perimeters, gauge flood stages, recent seismic activity, NWS watches). Keeping baseline and live telemetry separated is what makes the score explainable.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 6: TEAM & HAZARD PODS
        ───────────────────────────────────────────────────────────── */}
        <section id="team" className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Team: four hazard pods
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
              <span className="font-mono text-gray-500 font-semibold block">Wildfire Pod</span>
              <span className="text-gray-900 font-medium mt-1 block">NIFC &amp; Fuel Analysis</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">Placeholder · Team Member</span>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
              <span className="font-mono text-gray-500 font-semibold block">Flood Pod</span>
              <span className="text-gray-900 font-medium mt-1 block">USGS Stream Gauges</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">Placeholder · Team Member</span>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
              <span className="font-mono text-gray-500 font-semibold block">Earthquake Pod</span>
              <span className="text-gray-900 font-medium mt-1 block">USGS Seismic GeoJSON</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">Placeholder · Team Member</span>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
              <span className="font-mono text-gray-500 font-semibold block">Severe Weather Pod</span>
              <span className="text-gray-900 font-medium mt-1 block">NOAA / Open-Meteo</span>
              <span className="text-gray-400 text-[11px] block mt-0.5">Placeholder · Team Member</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            BLOCK 7: FOOTER
        ───────────────────────────────────────────────────────────── */}
        <footer className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-gray-50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">Risk Resource</span>
                <span className="text-gray-400">·</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-gray-600 hover:text-gray-900 underline flex items-center gap-1">
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">Live hazard risk for any US address</p>
            </div>

            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>Navigation</span>
              <span>Team</span>
              <span>DS3</span>
              <span>HDSI</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
            <span>Informational only · Call 911 in an emergency</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All feeds live</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
import React from 'react';

export default function EditorialStats() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-200">
      <div className="mb-14">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 block mb-3">
          — Telemetry
        </span>
        <h2 className="text-3xl sm:text-4xl font-normal text-gray-950 tracking-tight leading-tight">
          Performance you <br />
          <span className="font-medium text-gray-600">can measure.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:divide-x md:divide-gray-200">
        <div className="space-y-12">
          <div>
            <div className="text-6xl sm:text-7xl font-normal text-gray-950 tracking-tight font-sans">
              3,232
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Counties and census tracts indexed
            </p>
          </div>

          <div>
            <div className="text-6xl sm:text-7xl font-normal text-gray-950 tracking-tight font-sans">
              45ms
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Composite score inference latency
            </p>
          </div>
        </div>

        <div className="space-y-12 md:pl-12">
          <div>
            <div className="text-6xl sm:text-7xl font-normal text-gray-950 tracking-tight font-sans">
              99.4%
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              NWS alert polygon ingestion rate
            </p>
          </div>

          <div>
            <div className="text-6xl sm:text-7xl font-normal text-gray-950 tracking-tight font-sans">
              15 min
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Automated public feed refresh cycle
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
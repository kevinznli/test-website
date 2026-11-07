import React from 'react';
import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-16">
      <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-2">
            Open Methodology
          </span>
          <h3 className="text-2xl font-bold text-white">Built entirely on public data.</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xl leading-relaxed">
            Every risk score is backed by FEMA National Risk Index, NOAA, USGS, and NIFC datasets with full formula transparency.
          </p>
        </div>
        <Link
          href="/about"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-colors whitespace-nowrap"
        >
          Read the methodology →
        </Link>
      </div>
    </section>
  );
}
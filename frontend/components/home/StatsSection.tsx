import React from 'react';

export default function StatsSection() {
  return (
    <section className="border-t border-b border-gray-200/80 py-10 my-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">3,232</div>
          <p className="text-xs text-gray-500 mt-0.5">counties and county equivalents</p>
        </div>
        <div>
          <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">18</div>
          <p className="text-xs text-gray-500 mt-0.5">natural hazard types</p>
        </div>
        <div>
          <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">50 + DC + PR</div>
          <p className="text-xs text-gray-500 mt-0.5">states and territories on the map</p>
        </div>
        <div>
          <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">Dec 2025</div>
          <p className="text-xs text-gray-500 mt-0.5">FEMA data release</p>
        </div>
      </div>
    </section>
  );
}
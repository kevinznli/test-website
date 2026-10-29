import React from 'react';

export default function CtaBanner() {
  return (
    <section className="bg-[#1b232c] text-white py-12 px-6 rounded-2xl my-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="max-w-2xl">
        <h3 className="text-xl font-bold tracking-tight">Built on public data</h3>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
          Risk scores, expected losses and vulnerability measures come from FEMA's National Risk Index. Learn what each number means and how we calculate state totals.
        </p>
      </div>
      <button
        disabled
        className="px-5 py-2.5 bg-white text-gray-900 text-xs font-bold rounded-lg cursor-not-allowed opacity-90 whitespace-nowrap"
      >
        About the data
      </button>
    </section>
  );
}
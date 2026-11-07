import React from 'react';
import Link from 'next/link';

export default function MiniMapPreview() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Sample Preview</span>
          <h3 className="text-lg font-bold text-gray-900">Riverside County</h3>
          <p className="text-xs text-gray-500">California · Palm Springs area</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-amber-600">79</span>
          <span className="text-xs text-gray-400">/100</span>
          <div className="text-[10px] font-semibold text-amber-600">Relatively High</div>
        </div>
      </div>

      <div className="space-y-3 my-6">
        {[
          { name: 'Wildfire', score: 92, color: 'bg-red-500' },
          { name: 'Earthquake', score: 75, color: 'bg-orange-500' },
          { name: 'Flood', score: 14, color: 'bg-blue-400' },
          { name: 'Hurricane', score: 2, color: 'bg-gray-300' },
        ].map((h) => (
          <div key={h.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{h.name}</span>
              <span className="font-semibold text-gray-800">{h.score}</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className={`${h.color} h-full rounded-full`} style={{ width: `${h.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/map"
        className="block text-center w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold transition-colors"
      >
        Open on interactive map →
      </Link>
    </div>
  );
}
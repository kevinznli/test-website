import React from 'react';

export default function MapLegend() {
  const legendItems = [
    { label: '> $607', color: '#7a221b' },
    { label: '$504 – $607', color: '#a23924' },
    { label: '$425 – $504', color: '#ca6834' },
    { label: '$336 – $425', color: '#e5ab58' },
    { label: '≤ $336', color: '#fef3cc' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-gray-200/90 shadow-sm text-xs w-44">
      <span className="font-mono text-[10px] uppercase text-gray-500 font-bold block mb-2">
        Loss per person / yr
      </span>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-gray-700 font-mono text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
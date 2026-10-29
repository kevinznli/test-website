import React from 'react';
import Link from 'next/link';

export default function MiniMapPreview() {
  const previewColors = [
    '#7a221b', '#a23924', '#ca6834', '#e5ab58', '#fef3cc',
    '#7a221b', '#ca6834', '#7a221b', '#e5ab58', '#fef3cc',
    '#ca6834', '#e5ab58', '#7a221b', '#a23924', '#ca6834',
    '#ca6834', '#e5ab58', '#7a221b', '#a23924', '#ca6834',
  ];

  return (
    <Link
      href="/map"
      className="block p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-gray-400 transition-all group"
    >
      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mb-3">
        <span>Expected annual loss per person</span>
        <span className="group-hover:text-black underline">by state →</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-[#f7f3eb] rounded-xl">
        {previewColors.map((color, idx) => (
          <div
            key={idx}
            className="w-full h-8 rounded-xs"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-3">
        <span>Lower</span>
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 bg-[#fef3cc] rounded-xs" />
          <span className="w-2.5 h-2.5 bg-[#e5ab58] rounded-xs" />
          <span className="w-2.5 h-2.5 bg-[#ca6834] rounded-xs" />
          <span className="w-2.5 h-2.5 bg-[#a23924] rounded-xs" />
          <span className="w-2.5 h-2.5 bg-[#7a221b] rounded-xs" />
        </div>
        <span>Higher</span>
      </div>
    </Link>
  );
}
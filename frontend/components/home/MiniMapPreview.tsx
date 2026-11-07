'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCounty } from '@/lib/api';
import { TIER_COLORS, tierBadgeStyle } from '@/lib/tiers';
import type { CountyRecord } from '@/lib/types';

const PREVIEW_FIPS = '06065'; // Riverside County, CA

export default function MiniMapPreview() {
  const [county, setCounty] = useState<CountyRecord | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchCounty(PREVIEW_FIPS, controller.signal)
      .then(setCounty)
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Live Preview</span>
          <h3 className="text-lg font-bold text-gray-900">Riverside County</h3>
          <p className="text-xs text-gray-500">California · Palm Springs area</p>
        </div>
        {county && (
          <div className="text-right">
            <span className="text-2xl font-black text-gray-900">{county.compositeScore}</span>
            <span className="text-xs text-gray-400">/100</span>
            <div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
                style={tierBadgeStyle(county.tier)}
              >
                {county.tier}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 my-6 min-h-40">
        {failed && (
          <p className="text-xs text-gray-500">Live scores are unavailable right now.</p>
        )}
        {!county && !failed && (
          <div className="animate-pulse h-40 bg-gray-100 rounded-xl" role="status" aria-label="Loading preview" />
        )}
        {county?.hazards.slice(0, 4).map((h) => (
          <div key={h.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{h.name}</span>
              <span className="font-semibold text-gray-800">{h.score}</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${h.score}%`, backgroundColor: TIER_COLORS[h.tier] }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/map?q=Riverside"
        className="block text-center w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold transition-colors"
      >
        Open on interactive map →
      </Link>
    </div>
  );
}

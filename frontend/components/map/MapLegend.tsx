import { NO_DATA_COLOR, TIER_COLORS, TIER_LEGEND } from '@/lib/tiers';

export default function MapLegend({ title }: { title: string }) {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-gray-200/90 shadow-sm text-xs w-44">
      <span className="font-mono text-[10px] uppercase text-gray-500 font-bold block mb-2">
        {title}
      </span>
      <div className="space-y-1.5">
        {TIER_LEGEND.map(({ tier, range }) => (
          <div key={tier} className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: TIER_COLORS[tier] }} />
            <span className="text-gray-700 font-mono text-[11px]">
              {tier} {range}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: NO_DATA_COLOR }} />
          <span className="text-gray-700 font-mono text-[11px]">No data</span>
        </div>
      </div>
    </div>
  );
}

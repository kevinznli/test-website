// frontend/components/map/HazardList.tsx
import { TIER_COLORS } from '@/lib/tiers';
import type { HazardItem } from '@/lib/types';

export default function HazardList({ hazards }: { hazards: HazardItem[] }) {
  return (
    <div className="space-y-3">
      {hazards.map((h) => (
        <div key={h.name} className="text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-gray-800">{h.name}</span>
            <span className="font-mono font-bold text-gray-900">{h.score}/100</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${h.score}%`, backgroundColor: TIER_COLORS[h.tier] }}
            />
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5 leading-tight">{h.warning}</p>
        </div>
      ))}
    </div>
  );
}

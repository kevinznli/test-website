// frontend/lib/tiers.ts
// The single place tier colours are defined, used by the map, legend, badges and bars.
import type { CSSProperties } from 'react';
import type { Tier } from './types';

export const TIER_COLORS: Record<Tier, string> = {
  Low: '#f6e3a1',
  Moderate: '#e5ab58',
  Elevated: '#ca6834',
  Critical: '#7a221b',
};

export const NO_DATA_COLOR = '#d1d5db';

// Highest first, for the legend. The backend assigns tiers, so these ranges are
// display text only: keep them in step with TIER_FLOORS in backend/app/domain/scoring.py.
export const TIER_LEGEND: { tier: Tier; range: string }[] = [
  { tier: 'Critical', range: '75 – 100' },
  { tier: 'Elevated', range: '50 – 74' },
  { tier: 'Moderate', range: '30 – 49' },
  { tier: 'Low', range: '0 – 29' },
];

export function tierBadgeStyle(tier: Tier): CSSProperties {
  const darkBackground = tier === 'Critical' || tier === 'Elevated';
  return {
    backgroundColor: TIER_COLORS[tier],
    color: darkBackground ? '#ffffff' : '#111827',
  };
}

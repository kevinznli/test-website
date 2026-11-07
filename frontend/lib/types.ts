// frontend/lib/types.ts
// API response shapes. These mirror backend/app/schemas.py: change both together.

export type Tier = 'Low' | 'Moderate' | 'Elevated' | 'Critical';

export type MapLevel = 'state' | 'county';

export type MapMetric =
  | 'compositeScore'
  | 'wildfire'
  | 'earthquake'
  | 'flood'
  | 'severeStorm'
  | 'hurricane'
  | 'tornado';

export interface HazardItem {
  name: string;
  score: number;       // Whole number, 0 to 100
  tier: Tier;
  warning: string;
}

export interface StateRecord {
  code: string;        // Matches the state GeoJSON feature ID, e.g. "CA"
  name: string;
  compositeScore: number;
  tier: Tier;
  countiesCount: number;
  population: string;  // Preformatted, e.g. "39,501,350", or "N/A"
  activeAlertCount?: number; // Absent when the NWS feed is unavailable
  primaryAlert?: string;     // Absent when there are no active alerts
  hazards: HazardItem[];     // Highest score first
}

export interface CountyRecord {
  name: string;        // Includes the suffix, e.g. "Orleans Parish"
  state: string;       // Full name, e.g. "California"
  stateCode: string;   // e.g. "CA"
  compositeScore: number;
  tier: Tier;
  fips: string;        // Matches the county GeoJSON feature ID, e.g. "06065"
  pop: string;         // Preformatted, e.g. "2,458,395", or "N/A"
  activeAlert?: string; // Absent when there are no active alerts
  hazards: HazardItem[]; // Highest score first
}

export interface MapValue {
  id: string;          // State code or FIPS, matching the GeoJSON feature ID
  value: number;       // Whole number, 0 to 100
  tier: Tier;
}

export interface SearchResult {
  fips: string;
  name: string;
  state: string;
  stateCode: string;
  matchedPlace?: string; // Present when a city or ZIP led to this county
}

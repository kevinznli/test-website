// frontend/lib/types.ts

export interface HazardItem {
  name: string;
  score: number;      // 0 to 100
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  warning: string;   // e.g., "Red Flag Warning Active", "Gusts >= 35 mph"
}

export interface StateRecord {
  code: string;
  name: string;
  row?: number;
  col?: number;
  compositeScore: number;
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  countiesCount: number;
  population: string;
  activeAlertCount: number;
  primaryAlert: string;
  hazards: HazardItem[];
}

export interface CountyRecord {
  name: string;
  state: string;
  compositeScore: number;
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  fips: string;
  pop: string;
  activeAlert: string;
  hazards: HazardItem[];
}
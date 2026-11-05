// frontend/lib/types.ts

export interface HazardItem {
  name: string;
  score: number;       // 0 to 100
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  warning: string;
}

export interface StateRecord {
  code: string;
  name: string;
  row?: number;        // <-- Make optional so state data doesn't require grid coords
  col?: number;        // <-- Make optional
  compositeScore: number;
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  countiesCount: number;
  population: string;
  activeAlertCount?: number;
  primaryAlert?: string;
  lossPerPerson?: number;
  totalLoss?: string;
  highRiskPct?: number;
  highRiskCounties?: number;
  hazards: HazardItem[];
}

export interface CountyRecord {
  name: string;
  state: string;
  compositeScore: number;
  tier: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  fips?: string;
  pop: string;
  activeAlert?: string;
  lossPerPerson?: string;
  totalLoss?: string;
  risk?: string;
  color?: string;
  hazards: HazardItem[]; // <-- Required array so .map() is always safe
}
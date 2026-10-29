export interface HazardLoss {
    name: string;
    loss: string;
    barPct: number;
}

export interface StateRecord {
    code: string;
    name: string;
    row: number;
    col: number;
    lossPerPerson: number;
    totalLoss: string;
    highRiskPct: number;
    countiesCount: number;
    highRiskCounties: number;
    population: string;
    hazards: HazardLoss[];
}

export interface CountyRecord {
  name: string;
  state: string;
  lossPerPerson: string;
  totalLoss: string;
  pop: string;
  risk: string;
  color: string;
}
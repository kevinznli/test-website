// frontend/lib/mockRiskData.ts
import { StateRecord, CountyRecord } from './types';

export const CALIFORNIA_STATE: StateRecord = {
  code: 'CA',
  name: 'California',
  compositeScore: 78,
  tier: 'Critical',
  countiesCount: 58,
  population: '39,501,350',
  activeAlertCount: 14,
  primaryAlert: 'Red Flag Warning & Wind Advisory Active',
  hazards: [
    { name: 'Wildfire', score: 86, tier: 'Critical', warning: 'Critical RH <= 11% & 38 mph gusts' },
    { name: 'Earthquake', score: 68, tier: 'Elevated', warning: 'Recent M3.2 within basin · 0.12g PGA' },
    { name: 'Inland Flooding', score: 32, tier: 'Moderate', warning: 'Rainfall < 0.1 in/24h · Normal stream stage' },
    { name: 'Severe Storm', score: 48, tier: 'Moderate', warning: 'Convective pass winds gusting to 42 mph' },
  ],
};

export const SAMPLE_COUNTIES: CountyRecord[] = [
  {
    name: 'Riverside County',
    state: 'California',
    fips: '06065',
    pop: '2,458,395',
    compositeScore: 84,
    tier: 'Critical',
    activeAlert: 'Red Flag Warning: Santa Ana Pass Winds',
    hazards: [
      { name: 'Wildfire', score: 89, tier: 'Critical', warning: 'Red Flag Warning: San Gorgonio pass gusts 44 mph' },
      { name: 'Earthquake', score: 72, tier: 'Elevated', warning: 'San Andreas southern fault proximity' },
      { name: 'Flash Flood', score: 25, tier: 'Low', warning: 'Dry wash alluvial fan monitoring' },
      { name: 'Severe Storm', score: 40, tier: 'Moderate', warning: 'Desert convective wind surge' },
    ],
  },
  {
    name: 'Los Angeles County',
    state: 'California',
    fips: '06037',
    pop: '9,829,544',
    compositeScore: 79,
    tier: 'Critical',
    activeAlert: 'High Wind Warning Active',
    hazards: [
      { name: 'Wildfire', score: 82, tier: 'Critical', warning: 'WUI dry brush conditions & canyon winds' },
      { name: 'Earthquake', score: 75, tier: 'Elevated', warning: 'Newport-Inglewood fault zone exposure' },
      { name: 'Inland Flooding', score: 28, tier: 'Low', warning: 'Basin reservoirs stable' },
      { name: 'Severe Storm', score: 55, tier: 'Elevated', warning: 'Gusts up to 45 mph across mountain passes' },
    ],
  },
  {
    name: 'Sonoma County',
    state: 'California',
    fips: '06097',
    pop: '488,863',
    compositeScore: 68,
    tier: 'Elevated',
    activeAlert: 'Fire Weather Watch Active',
    hazards: [
      { name: 'Wildfire', score: 74, tier: 'Elevated', warning: 'Dry grass fuel bed & 28 mph gusts' },
      { name: 'Earthquake', score: 58, tier: 'Moderate', warning: 'Rodgers Creek fault corridor' },
      { name: 'Flash Flood', score: 38, tier: 'Moderate', warning: 'Russian River baseline stage monitoring' },
      { name: 'Severe Storm', score: 22, tier: 'Low', warning: 'Offshore marine layer dominant' },
    ],
  },
  {
    name: 'San Diego County',
    state: 'California',
    fips: '06073',
    pop: '3,298,634',
    compositeScore: 62,
    tier: 'Elevated',
    activeAlert: 'Wind Advisory: Inland Valleys',
    hazards: [
      { name: 'Wildfire', score: 68, tier: 'Elevated', warning: 'East county chaparral fuel desiccation' },
      { name: 'Earthquake', score: 60, tier: 'Moderate', warning: 'Rose Canyon fault trace' },
      { name: 'Flash Flood', score: 20, tier: 'Low', warning: 'Coastal runoff gates operational' },
      { name: 'Severe Storm', score: 35, tier: 'Moderate', warning: 'Santa Ana canyon breezes (28 mph)' },
    ],
  },
  {
    name: 'Fresno County',
    state: 'California',
    fips: '06019',
    pop: '1,013,581',
    compositeScore: 46,
    tier: 'Moderate',
    activeAlert: 'Air Quality / Stagnation Advisory',
    hazards: [
      { name: 'Flash Flood', score: 48, tier: 'Moderate', warning: 'Sierra snowpack runoff channels active' },
      { name: 'Earthquake', score: 30, tier: 'Low', warning: 'Valley deep-alluvium attenuation' },
      { name: 'Severe Storm', score: 28, tier: 'Low', warning: 'Light valley breeze (< 12 mph)' },
      { name: 'Wildfire', score: 24, tier: 'Low', warning: 'Agricultural irrigated buffer' },
    ],
  },
];
// frontend/lib/api.ts
// All calls to the backend go through here. See claude-docs/backend-doc.md.
import type {
  CountyRecord,
  MapLevel,
  MapMetric,
  MapValue,
  SearchResult,
  StateRecord,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }
  return response.json();
}

export function fetchState(code: string, signal?: AbortSignal): Promise<StateRecord> {
  return get(`/states/${encodeURIComponent(code)}`, signal);
}

export function fetchCounty(fips: string, signal?: AbortSignal): Promise<CountyRecord> {
  return get(`/counties/${encodeURIComponent(fips)}`, signal);
}

export function fetchMapValues(
  level: MapLevel,
  metric: MapMetric,
  signal?: AbortSignal
): Promise<MapValue[]> {
  return get(`/map-values?level=${level}&metric=${metric}`, signal);
}

export function searchCounties(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  return get(`/search?q=${encodeURIComponent(query)}`, signal);
}

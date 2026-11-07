// frontend/components/map/MapExplorer.tsx
// Owns all /map state. Reads ?q=, so app/map/page.tsx wraps it in <Suspense>.
'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { fetchCounty, fetchMapValues, fetchState } from '@/lib/api';
import type {
  CountyRecord,
  MapLevel,
  MapMetric,
  MapValue,
  SearchResult,
  StateRecord,
} from '@/lib/types';
import CountyInspector from './CountyInspector';
import InspectorPlaceholder from './InspectorPlaceholder';
import MapControls, { METRIC_FILTERS } from './MapControls';
import MapLegend from './MapLegend';
import type { MapFocus } from './RiskLeafletMap';
import StateInspector from './StateInspector';

const DEFAULT_STATE = 'CA';

const RiskLeafletMap = dynamic(() => import('./RiskLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-gray-100/80 animate-pulse rounded-2xl flex items-center justify-center border border-gray-200">
      <span className="text-xs font-mono text-gray-500">Initializing map...</span>
    </div>
  ),
});

type Selection = { level: MapLevel; id: string };
type LoadedRecord =
  | { key: string; level: 'state'; record: StateRecord }
  | { key: string; level: 'county'; record: CountyRecord }
  | { key: string; level: 'error' };

const selectionKey = (selection: Selection, attempt: number) =>
  `${selection.level}:${selection.id}:${attempt}`;

export default function MapExplorer() {
  const query = useSearchParams().get('q');

  const [viewMode, setViewMode] = useState<'states' | 'counties'>('states');
  const [metric, setMetric] = useState<MapMetric>('compositeScore');
  const [selection, setSelection] = useState<Selection>({ level: 'state', id: DEFAULT_STATE });
  const [focus, setFocus] = useState<MapFocus | null>(null);

  // Each result is stored with the request it answers. Anything that doesn't
  // match the current request counts as still loading.
  const [loaded, setLoaded] = useState<LoadedRecord | null>(null);
  const [recordAttempt, setRecordAttempt] = useState(0);
  const [mapResult, setMapResult] = useState<{ key: string; values: MapValue[] | null } | null>(null);
  const [mapAttempt, setMapAttempt] = useState(0);

  const level: MapLevel = viewMode === 'states' ? 'state' : 'county';
  const mapKey = `${level}:${metric}:${mapAttempt}`;
  const recordKey = selectionKey(selection, recordAttempt);

  useEffect(() => {
    const controller = new AbortController();
    fetchMapValues(level, metric, controller.signal)
      .then((values) => setMapResult({ key: mapKey, values }))
      .catch(() => {
        if (!controller.signal.aborted) setMapResult({ key: mapKey, values: null });
      });
    return () => controller.abort();
  }, [level, metric, mapKey]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const request: Promise<LoadedRecord> =
      selection.level === 'state'
        ? fetchState(selection.id, signal).then((record) => ({
            key: recordKey,
            level: 'state' as const,
            record,
          }))
        : fetchCounty(selection.id, signal).then((record) => ({
            key: recordKey,
            level: 'county' as const,
            record,
          }));
    request.then(setLoaded).catch(() => {
      if (!signal.aborted) setLoaded({ key: recordKey, level: 'error' });
    });
    return () => controller.abort();
  }, [selection, recordKey]);

  const currentMap = mapResult?.key === mapKey ? mapResult : null;
  const currentRecord = loaded?.key === recordKey ? loaded : null;

  const handleFeatureSelect = useCallback((id: string, featureLevel: MapLevel) => {
    setSelection({ level: featureLevel, id });
  }, []);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setViewMode('counties');
    setSelection({ level: 'county', id: result.fips });
    setFocus((current) => ({ id: result.fips, nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const showState = (code: string) => {
    setViewMode('states');
    setSelection({ level: 'state', id: code });
  };

  const handleViewModeChange = (mode: 'states' | 'counties') => {
    if (mode === 'states' && selection.level === 'county') {
      // The county's state is only known once its record has loaded.
      showState(currentRecord?.level === 'county' ? currentRecord.record.stateCode : DEFAULT_STATE);
    } else {
      setViewMode(mode);
    }
  };

  const handleDrillDown = () => {
    setViewMode('counties');
    setFocus((current) => ({ id: selection.id, nonce: (current?.nonce ?? 0) + 1 }));
  };

  const legendTitle =
    METRIC_FILTERS.find((filter) => filter.metric === metric)?.legendTitle ?? 'Risk score';

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-8">
      <MapControls
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        selectedMetric={metric}
        onMetricChange={setMetric}
        initialQuery={query}
        onSearchSelect={handleSearchSelect}
      />

      {currentMap && currentMap.values === null && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-950 flex items-center justify-between gap-3">
          <span>Couldn&apos;t load risk scores, so the map isn&apos;t coloured. The risk API may be offline.</span>
          <button
            type="button"
            onClick={() => setMapAttempt((attempt) => attempt + 1)}
            className="font-semibold underline cursor-pointer whitespace-nowrap"
          >
            Try again
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* self-start keeps this at the map's height, so the legend stays on the map */}
        <div className="flex-1 relative self-start w-full">
          <RiskLeafletMap
            viewMode={viewMode}
            values={currentMap?.values ?? null}
            focus={focus}
            onSelectFeature={handleFeatureSelect}
          />
          <MapLegend title={legendTitle} />
        </div>

        {!currentRecord && <InspectorPlaceholder />}
        {currentRecord?.level === 'error' && (
          <InspectorPlaceholder
            error
            onRetry={() => setRecordAttempt((attempt) => attempt + 1)}
          />
        )}
        {currentRecord?.level === 'state' && (
          <StateInspector
            stateData={currentRecord.record}
            viewMode={viewMode}
            onDrillDown={handleDrillDown}
          />
        )}
        {currentRecord?.level === 'county' && (
          <CountyInspector
            county={currentRecord.record}
            onBackToState={() => showState(currentRecord.record.stateCode)}
          />
        )}
      </div>
    </main>
  );
}

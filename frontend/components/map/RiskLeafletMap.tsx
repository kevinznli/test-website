// frontend/components/map/RiskLeafletMap.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { NO_DATA_COLOR, TIER_COLORS } from '@/lib/tiers';
import type { MapLevel, MapValue } from '@/lib/types';

const BOUNDARY_URLS: Record<MapLevel, string> = {
  state:
    'https://raw.githubusercontent.com/python-visualization/folium-example-data/main/us_states.json',
  // About 3.2 MB and 3,221 counties, so it's only fetched when first needed
  county: 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json',
};

export interface MapFocus {
  id: string; // State code or FIPS
  nonce: number; // Changes on each request, so the same place can be focused twice
}

interface Props {
  viewMode: 'states' | 'counties';
  values: MapValue[] | null;
  focus: MapFocus | null;
  onSelectFeature: (id: string, level: MapLevel) => void;
}

function findFeature(collection: FeatureCollection | undefined, id: string): Feature | undefined {
  return collection?.features.find((feature) => feature.id === id);
}

export default function RiskLeafletMap({ viewMode, values, focus, onSelectFeature }: Props) {
  const [boundaries, setBoundaries] = useState<Partial<Record<MapLevel, FeatureCollection>>>({});
  const [failedLevels, setFailedLevels] = useState<Partial<Record<MapLevel, boolean>>>({});
  const mapRef = useRef<L.Map | null>(null);

  const level: MapLevel = viewMode === 'states' ? 'state' : 'county';
  const needsBoundaries = !boundaries[level];

  const valuesById = useMemo(
    () => new Map((values ?? []).map((item) => [item.id, item])),
    [values]
  );

  // react-leaflet reads onEachFeature only when a layer is created, so its
  // handlers reach the latest props through these refs.
  const valuesRef = useRef(valuesById);
  const onSelectRef = useRef(onSelectFeature);
  useEffect(() => {
    valuesRef.current = valuesById;
    onSelectRef.current = onSelectFeature;
  }, [valuesById, onSelectFeature]);

  // Read CARTO API key from Next.js environment variable
  const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;

  // If key is present in env, use CARTO Positron; otherwise fallback gracefully to OpenStreetMap
  const tileUrl = cartoApiKey
    ? `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${cartoApiKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = cartoApiKey
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  useEffect(() => {
    if (!needsBoundaries) return;
    const controller = new AbortController();
    fetch(BOUNDARY_URLS[level], { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary request failed: ${response.status}`);
        return response.json();
      })
      .then((collection: FeatureCollection) => {
        setBoundaries((current) => ({ ...current, [level]: collection }));
        setFailedLevels((current) => ({ ...current, [level]: false }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Error fetching map boundaries:', error);
        setFailedLevels((current) => ({ ...current, [level]: true }));
      });
    return () => controller.abort();
  }, [level, needsBoundaries]);

  // Pan and zoom to a requested place once its boundary is available.
  useEffect(() => {
    if (!focus || !mapRef.current) return;
    const feature = findFeature(boundaries.county, focus.id) ?? findFeature(boundaries.state, focus.id);
    if (feature) {
      mapRef.current.fitBounds(L.geoJSON(feature).getBounds(), { padding: [24, 24], maxZoom: 8 });
    }
  }, [focus, boundaries]);

  const fillColor = useCallback(
    (feature: Feature | undefined) => {
      const item = valuesById.get(String(feature?.id));
      return item ? TIER_COLORS[item.tier] : NO_DATA_COLOR;
    },
    [valuesById]
  );

  // These keep a stable identity until the values change, because react-leaflet
  // restyles every polygon whenever the style prop changes.
  const stateStyle = useCallback(
    (feature: Feature | undefined) => ({
      fillColor: fillColor(feature),
      weight: 1.2,
      opacity: 1,
      color: '#2d3748',
      fillOpacity: 0.75,
    }),
    [fillColor]
  );
  const countyStyle = useCallback(
    (feature: Feature | undefined) => ({
      fillColor: fillColor(feature),
      weight: 0.35,
      opacity: 0.8,
      color: '#4a5568',
      fillOpacity: 0.7,
    }),
    [fillColor]
  );

  const tooltipFor = (name: string, id: string) => () => {
    const item = valuesRef.current.get(id);
    const score = item ? `${item.value}/100 · ${item.tier}` : 'No data';
    return `<b>${name}</b><br/>${score}`;
  };

  const loading = needsBoundaries && !failedLevels[level];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm bg-[#e8ecef]">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white/75 backdrop-blur-xs">
          <div className="w-8 h-8 border-3 border-gray-400 border-t-black rounded-full animate-spin mb-2" />
          <span className="font-mono text-xs text-gray-700">Loading map boundaries...</span>
        </div>
      )}

      {failedLevels[level] && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/75 backdrop-blur-xs p-6 text-center">
          <span className="font-mono text-xs text-gray-700">
            Couldn&apos;t load map boundaries. Check your connection and reload the page.
          </span>
        </div>
      )}

      {/* Map Centered over North America */}
      <MapContainer
        ref={mapRef}
        center={[45.0, -100.0]}
        zoom={3.5}
        minZoom={3}
        maxZoom={9}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />

        {/* States Overview Mode */}
        {viewMode === 'states' && boundaries.state && (
          <GeoJSON
            key="states-layer"
            data={boundaries.state}
            style={stateStyle}
            onEachFeature={(feature, layer) => {
              const id = String(feature.id);
              layer.bindTooltip(tooltipFor(feature.properties?.name ?? id, id), { sticky: true });
              layer.on({
                click: () => onSelectRef.current(id, 'state'),
                mouseover: (e) => e.target.setStyle({ weight: 2.2, color: '#000000', fillOpacity: 0.9 }),
                mouseout: (e) => e.target.setStyle({ weight: 1.2, color: '#2d3748', fillOpacity: 0.75 }),
              });
            }}
          />
        )}

        {/* Counties Detailed Mode */}
        {viewMode === 'counties' && boundaries.county && (
          <GeoJSON
            key="counties-layer"
            data={boundaries.county}
            style={countyStyle}
            onEachFeature={(feature, layer) => {
              const id = String(feature.id);
              layer.bindTooltip(tooltipFor(feature.properties?.NAME ?? id, id), { sticky: true });
              layer.on({
                click: () => onSelectRef.current(id, 'county'),
                mouseover: (e) => e.target.setStyle({ weight: 1.5, color: '#000000', fillOpacity: 0.9 }),
                mouseout: (e) => e.target.setStyle({ weight: 0.35, color: '#4a5568', fillOpacity: 0.7 }),
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

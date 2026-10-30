// frontend/components/map/RiskLeafletMap.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 5-quintile Risk Gradient Ramp
const GRADIENT_COLORS = [
  '#fef3cc', // 1: Very Low (pale yellow)
  '#e5ab58', // 2: Moderate (golden amber)
  '#ca6834', // 3: Relatively High (terracotta)
  '#a23924', // 4: High (crimson)
  '#7a221b', // 5: Very High (deep burgundy)
];

function getFeatureColor(idString: string = '') {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = (hash << 5) - hash + idString.charCodeAt(i);
    hash |= 0;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

interface Props {
  viewMode: 'states' | 'counties';
  onSelectFeature?: (name: string, type: 'state' | 'county') => void;
}

export default function RiskLeafletMap({ viewMode, onSelectFeature }: Props) {
  const [statesGeo, setStatesGeo] = useState<any>(null);
  const [countiesGeo, setCountiesGeo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mapRef = useRef<any>(null);

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
    // 1. Fetch US States GeoJSON
    const fetchStates = fetch(
      'https://raw.githubusercontent.com/python-visualization/folium-example-data/main/us_states.json'
    ).then((res) => res.json());

    // 2. Fetch US Counties GeoJSON (~3,143 counties)
    const fetchCounties = fetch(
      'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
    ).then((res) => res.json());

    Promise.all([fetchStates, fetchCounties])
      .then(([statesData, countiesData]) => {
        setStatesGeo(statesData);
        setCountiesGeo(countiesData);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching map boundaries:', err));
  }, []);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm bg-[#e8ecef]">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 backdrop-blur-xs">
          <div className="w-8 h-8 border-3 border-gray-400 border-t-black rounded-full animate-spin mb-2" />
          <span className="font-mono text-xs text-gray-700">Loading North America Geographic Boundary Layers...</span>
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
        {viewMode === 'states' && statesGeo && (
          <GeoJSON
            key="states-layer"
            data={statesGeo}
            style={(feature) => ({
              fillColor: getFeatureColor(feature?.properties?.name || feature?.id),
              weight: 1.2,
              opacity: 1,
              color: '#2d3748',
              fillOpacity: 0.65,
            })}
            onEachFeature={(feature, layer) => {
              const stateName = feature.properties?.name || 'Unknown State';
              layer.bindTooltip(`<b>${stateName}</b>`, { sticky: true });
              layer.on({
                click: () => onSelectFeature?.(stateName, 'state'),
                mouseover: (e) => e.target.setStyle({ weight: 2.2, color: '#000000', fillOpacity: 0.85 }),
                mouseout: (e) => e.target.setStyle({ weight: 1.2, color: '#2d3748', fillOpacity: 0.65 }),
              });
            }}
          />
        )}

        {/* Counties Detailed Mode */}
        {viewMode === 'counties' && countiesGeo && (
          <GeoJSON
            key="counties-layer"
            data={countiesGeo}
            style={(feature) => ({
              fillColor: getFeatureColor(feature?.id || feature?.properties?.NAME),
              weight: 0.35,
              opacity: 0.8,
              color: '#4a5568',
              fillOpacity: 0.55,
            })}
            onEachFeature={(feature, layer) => {
              const countyName = feature.properties?.NAME || `County ${feature.id}`;
              layer.bindTooltip(`<b>${countyName}</b><br/>FIPS: ${feature.id}`, { sticky: true });
              layer.on({
                click: () => onSelectFeature?.(countyName, 'county'),
                mouseover: (e) => e.target.setStyle({ weight: 1.5, color: '#000000', fillOpacity: 0.85 }),
                mouseout: (e) => e.target.setStyle({ weight: 0.35, color: '#4a5568', fillOpacity: 0.55 }),
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
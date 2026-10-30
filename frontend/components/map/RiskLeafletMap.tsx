// frontend/components/map/RiskLeafletMap.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 5-quintile Risk Gradient Ramp matching your visual palette
const GRADIENT_COLORS = [
  '#fef3cc', // 1: Very Low (pale yellow)
  '#e5ab58', // 2: Moderate (golden amber)
  '#ca6834', // 3: Relatively High (terracotta orange)
  '#a23924', // 4: High (crimson)
  '#7a221b', // 5: Very High (deep burgundy)
];

// Generates a stable mock gradient index based on boundary name/FIPS
function getFeatureColor(idString: string = '') {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = (hash << 5) - hash + idString.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[colorIndex];
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

  useEffect(() => {
    // 1. Fetch States GeoJSON (~50 shapes)
    const fetchStates = fetch(
      'https://raw.githubusercontent.com/python-visualization/folium-example-data/main/us_states.json'
    ).then((res) => res.json());

    // 2. Fetch US Counties GeoJSON (~3,143 shapes)
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
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm bg-[#f2ede4]">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs">
          <div className="w-8 h-8 border-3 border-gray-400 border-t-black rounded-full animate-spin mb-2" />
          <span className="font-mono text-xs text-gray-700">Loading US geographic boundaries...</span>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={[38.5, -96.0]}
        zoom={4}
        minZoom={3}
        maxZoom={10}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        {/* CARTO Positron Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
        />

        {/* Dynamic GeoJSON Layer: Toggles between States and Counties */}
        {viewMode === 'states' && statesGeo && (
          <GeoJSON
            key="states-geojson-layer"
            data={statesGeo}
            style={(feature) => ({
              fillColor: getFeatureColor(feature?.properties?.name || feature?.id),
              weight: 1.2,
              opacity: 1,
              color: '#333333',
              fillOpacity: 0.65,
            })}
            onEachFeature={(feature, layer) => {
              const stateName = feature.properties?.name || 'Unknown State';
              layer.bindTooltip(
                `<div style="font-family: monospace; font-size: 11px;">
                  <b>${stateName}</b><br/><span>Risk Tier: Active</span>
                </div>`,
                { sticky: true }
              );
              layer.on({
                click: () => onSelectFeature?.(stateName, 'state'),
                mouseover: (e) => {
                  const target = e.target;
                  target.setStyle({ weight: 2.5, color: '#000000', fillOpacity: 0.85 });
                },
                mouseout: (e) => {
                  const target = e.target;
                  target.setStyle({ weight: 1.2, color: '#333333', fillOpacity: 0.65 });
                },
              });
            }}
          />
        )}

        {viewMode === 'counties' && countiesGeo && (
          <GeoJSON
            key="counties-geojson-layer"
            data={countiesGeo}
            style={(feature) => ({
              fillColor: getFeatureColor(feature?.id || feature?.properties?.NAME),
              weight: 0.4,
              opacity: 0.8,
              color: '#555555',
              fillOpacity: 0.55,
            })}
            onEachFeature={(feature, layer) => {
              const countyName = feature.properties?.NAME || `County ${feature.id}`;
              layer.bindTooltip(
                `<div style="font-family: monospace; font-size: 11px;">
                  <b>${countyName}</b><br/><span>FIPS: ${feature.id}</span>
                </div>`,
                { sticky: true }
              );
              layer.on({
                click: () => onSelectFeature?.(countyName, 'county'),
                mouseover: (e) => {
                  const target = e.target;
                  target.setStyle({ weight: 1.8, color: '#000000', fillOpacity: 0.85 });
                },
                mouseout: (e) => {
                  const target = e.target;
                  target.setStyle({ weight: 0.4, color: '#555555', fillOpacity: 0.55 });
                },
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
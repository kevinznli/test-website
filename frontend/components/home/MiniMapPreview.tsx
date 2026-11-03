'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Station {
  name: string;
  code: string;
  xPct: number;
  yPct: number;
  gust: number;
  rh: number;
  score: number;
  tier: string;
}

const STATIONS: Station[] = [
  { name: 'San Gorgonio Pass', code: 'SGP', xPct: 0.35, yPct: 0.42, gust: 48, rh: 9, score: 88, tier: 'Extreme' },
  { name: 'Sierra Ridge', code: 'SRG', xPct: 0.62, yPct: 0.28, gust: 36, rh: 14, score: 72, tier: 'High' },
  { name: 'South Coast Basin', code: 'SCB', xPct: 0.22, yPct: 0.70, gust: 18, rh: 44, score: 34, tier: 'Low' },
  { name: 'Mojave Desert Basin', code: 'MDB', xPct: 0.78, yPct: 0.65, gust: 29, rh: 11, score: 64, tier: 'Moderate' },
];

export default function MiniMapPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station>(STATIONS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 300);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 300;
    };
    window.addEventListener('resize', handleResize);

    // Particle vector system
    const particleCount = 140;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 1.2 + Math.random() * 2.2,
      length: 12 + Math.random() * 16,
      opacity: 0.25 + Math.random() * 0.6,
      color: Math.random() > 0.4 ? '#ca6834' : '#e5ab58',
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(251, 249, 244, 0.22)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        // Curve trajectory simulating canyon wind funneling
        const angle = Math.sin(p.y * 0.012) * 0.45 + 0.1;
        const vx = Math.cos(angle) * p.speed;
        const vy = Math.sin(angle) * p.speed * 0.6;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * p.length * 0.15, p.y - vy * p.length * 0.15);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        p.x += vx;
        p.y += vy;

        // Reset particle on edge boundaries
        if (p.x > width + 20) p.x = -10;
        if (p.x < -20) p.x = width + 10;
        if (p.y > height + 20) p.y = -10;
        if (p.y < -20) p.y = height + 10;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="font-semibold text-gray-800">Atmospheric Wind Vector Field</span>
        </div>
        <Link
          href="/map"
          className="text-[11px] font-mono text-gray-500 group-hover:text-black underline underline-offset-2 transition-colors"
        >
          open risk map →
        </Link>
      </div>

      {/* Canvas Viewport */}
      <div className="relative h-[280px] bg-[#fbf9f4] rounded-xl overflow-hidden border border-[#ece4d0]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Station Focal Points */}
        {STATIONS.map((st) => (
          <button
            key={st.code}
            onClick={() => setSelectedStation(st)}
            style={{ left: `${st.xPct * 100}%`, top: `${st.yPct * 100}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full border transition-transform ${
              selectedStation.code === st.code
                ? 'bg-black text-white border-black scale-110 shadow-md z-10'
                : 'bg-white/90 backdrop-blur-xs text-gray-800 border-gray-300 hover:scale-105'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                st.score > 75 ? 'bg-red-500' : st.score > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[10px] font-mono font-bold">{st.code}</span>
          </button>
        ))}

        {/* Selected Node Telemetry Badge */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono shadow-xs">
          <div>
            <span className="font-bold text-gray-900 block">{selectedStation.name}</span>
            <span className="text-[10px] text-gray-500">
              Gusts: {selectedStation.gust} mph · RH: {selectedStation.rh}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-red-700 block">
              {selectedStation.tier}
            </span>
            <span className="font-bold text-gray-900">{selectedStation.score}/100</span>
          </div>
        </div>
      </div>

      {/* FEMA Quintile Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-3.5 px-1">
        <span>Calm Flow</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#fef3cc] rounded-xs" title="Low" />
          <span className="w-2.5 h-2.5 bg-[#e5ab58] rounded-xs" title="Moderate" />
          <span className="w-2.5 h-2.5 bg-[#ca6834] rounded-xs" title="High" />
          <span className="w-2.5 h-2.5 bg-[#a23924] rounded-xs" title="Severe" />
          <span className="w-2.5 h-2.5 bg-[#7a221b] rounded-xs ring-1 ring-red-400" title="Extreme" />
        </div>
        <span className="text-red-700 font-semibold">Gale / Desiccated</span>
      </div>
    </div>
  );
}
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
  { name: 'San Gorgonio Pass', code: 'SGP', xPct: 0.35, yPct: 0.40, gust: 48, rh: 9, score: 88, tier: 'Extreme' },
  { name: 'Sierra Ridge', code: 'SRG', xPct: 0.60, yPct: 0.28, gust: 36, rh: 14, score: 72, tier: 'High' },
  { name: 'South Coast Basin', code: 'SCB', xPct: 0.22, yPct: 0.68, gust: 18, rh: 44, score: 34, tier: 'Low' },
  { name: 'Mojave Desert Basin', code: 'MDB', xPct: 0.78, yPct: 0.62, gust: 29, rh: 11, score: 64, tier: 'Moderate' },
];

export default function MiniMapPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station>(STATIONS[3]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // High-contrast hazard palette (vivid amber to deep warning crimson)
    const streamColors = ['#ea580c', '#d97706', '#b91c1c', '#c2410c', '#9a3412'];

    // 450 particles with distinct speeds and trail lengths
    const particleCount = 450;
    let particles: Array<{
      x: number;
      y: number;
      speed: number;
      length: number;
      color: string;
      size: number;
    }> = [];

    const initParticles = () => {
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * (width || 500),
        y: Math.random() * (height || 280),
        speed: 1.5 + Math.random() * 2.8,
        length: 16 + Math.random() * 24,
        color: streamColors[Math.floor(Math.random() * streamColors.length)],
        size: Math.random() > 0.85 ? 2.2 : 1.4,
      }));
    };

    // Correctly scale for high-DPI (Retina) displays
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);

    // Initial background paint
    ctx.fillStyle = '#f8f5ee';
    ctx.fillRect(0, 0, width || 500, height || 280);

    const render = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth semi-transparent fade creating flowing streamline trails
      ctx.fillStyle = 'rgba(248, 245, 238, 0.18)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        // Canyon wind compression & curl wave physics
        const wave = Math.sin(p.y * 0.015 + p.x * 0.004);
        const angle = wave * 0.55 + 0.15;
        const vx = Math.cos(angle) * p.speed;
        const vy = Math.sin(angle) * p.speed * 0.55;

        // Draw streamline streak
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * (p.length * 0.25), p.y - vy * (p.length * 0.25));
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw glowing particle head
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Advance position
        p.x += vx;
        p.y += vy;

        // Boundary wrap-around
        if (p.x > width + 30) {
          p.x = -15;
          p.y = Math.random() * height;
        }
        if (p.y > height + 20) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.y < -20) {
          p.y = height + 10;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
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
      <div
        ref={containerRef}
        className="relative h-[280px] bg-[#f8f5ee] rounded-xl overflow-hidden border border-[#ece4d0]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />

        {/* Station Telemetry Badges */}
        {STATIONS.map((st) => (
          <button
            key={st.code}
            type="button"
            onClick={() => setSelectedStation(st)}
            style={{ left: `${st.xPct * 100}%`, top: `${st.yPct * 100}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-transform shadow-xs z-10 cursor-pointer ${
              selectedStation.code === st.code
                ? 'bg-black text-white border-black scale-110 shadow-md ring-2 ring-black/20'
                : 'bg-white/95 backdrop-blur-xs text-gray-800 border-gray-300 hover:scale-105'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                st.score > 75 ? 'bg-red-500 animate-pulse' : st.score > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[10px] font-mono font-bold">{st.code}</span>
          </button>
        ))}

        {/* Selected Station Bottom Card */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono shadow-xs z-10">
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

      {/* Quintile Legend */}
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
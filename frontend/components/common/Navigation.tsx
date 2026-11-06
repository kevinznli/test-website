'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#11100e]/90 backdrop-blur-md border-b border-white/10 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand link to home */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <div className="border border-white/20 rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 bg-[#1a1815] group-hover:border-amber-500/50 transition-colors shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 flex items-center justify-center">
              <span className="w-1 h-1 bg-amber-400 rounded-full" />
            </span>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-tight group-hover:text-amber-200 transition-colors">
                Risk Resource
              </span>
              <span className="text-[10px] text-gray-400 font-mono block leading-none">
                US natural disaster risk
              </span>
            </div>
          </div>
        </Link>

        {/* Links & Prototype Pill */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 text-xs">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/map"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/map'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Risk map
            </Link>
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/about'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              About the data
            </Link>
          </nav>

          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 hidden sm:inline-block">
            PROTOTYPE · SAMPLE DATA
          </span>
        </div>
      </div>
    </header>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-[#fcfbf7] border-b border-[#ece6da]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <Link href="/" className="text-base font-bold text-gray-900 tracking-tight block">
            Risk Resource
          </Link>
          <p className="text-[11px] text-gray-500 font-mono">US natural disaster risk</p>
        </div>

        <nav className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname === '/'
                ? 'bg-gray-200/80 text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <Link
            href="/map"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname === '/map'
                ? 'bg-gray-200/80 text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Risk map
          </Link>
          <span className="px-3 py-1.5 text-gray-400 cursor-not-allowed">
            About the data
          </span>
        </nav>
      </div>
    </header>
  );
}
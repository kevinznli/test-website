import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/80 py-6 text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Risk Resource · [TEAM / CLASS NAME]</span>
        <span>
          Data:{' '}
          <a
            href="https://hazards.fema.gov/nri/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-900"
          >
            FEMA National Risk Index
          </a>
          , December 2025
        </span>
      </div>
    </footer>
  );
}
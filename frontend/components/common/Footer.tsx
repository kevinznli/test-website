import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d0c0a] border-t border-white/10 pt-16 pb-12 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          {/* Col 1 */}
          <div className="md:col-span-5 space-y-3 pr-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Risk Resource</h3>
            <p className="leading-relaxed text-gray-400 max-w-sm">
              Combines federal data from FEMA, NOAA, USGS and NIFC into an explainable risk index for homeowners and communities.
            </p>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-mono uppercase text-gray-200 text-[11px] tracking-wider">Navigation</h4>
            <ul className="space-y-1.5">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Risk map</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About the data</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-mono uppercase text-gray-200 text-[11px] tracking-wider">Data feeds</h4>
            <ul className="space-y-1.5">
              <li><a href="https://hazards.fema.gov/nri/" target="_blank" rel="noreferrer" className="hover:text-white">FEMA NRI</a></li>
              <li><a href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer" className="hover:text-white">USGS</a></li>
              <li><a href="https://www.weather.gov/" target="_blank" rel="noreferrer" className="hover:text-white">NOAA / NWS</a></li>
              <li><a href="https://www.nifc.gov/" target="_blank" rel="noreferrer" className="hover:text-white">NIFC</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-mono uppercase text-gray-200 text-[11px] tracking-wider">Affiliations</h4>
            <ul className="space-y-1.5">
              <li><a href="https://ds3ucsd.com" target="_blank" rel="noreferrer" className="hover:text-white">DS3 at UCSD</a></li>
              <li><a href="https://datascience.ucsd.edu" target="_blank" rel="noreferrer" className="hover:text-white">HDSI</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-gray-500">
          <span>Risk Resource 2026. Informational only, not a substitute for official warnings.</span>
          <span>Prototype for review</span>
        </div>
      </div>
    </footer>
  );
}
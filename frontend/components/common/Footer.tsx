'use client';

import React from 'react';
import Link from 'next/link';

interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Team Member 1', role: 'Wildfire Pod', linkedin: 'https://linkedin.com' },
  { name: 'Team Member 2', role: 'Flood Pod', linkedin: 'https://linkedin.com' },
  { name: 'Team Member 3', role: 'Earthquake Pod', linkedin: 'https://linkedin.com' },
  { name: 'Team Member 4', role: 'Severe Weather Pod', linkedin: 'https://linkedin.com' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#fdfdfd] border-t border-gray-200/80 pt-16 pb-12 text-gray-600 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
          
          {/* Column 1: Project Identity & Mission (Spans 4 cols) */}
          <div className="md:col-span-4 space-y-4 pr-6">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
              Risk Resource
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              Risk Resource synthesizes fragmented federal agency data (NOAA, USGS, NIFC, FEMA) into an explainable, real-time risk index for homeowners and communities across the United States.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-gray-900 font-mono transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Column 2: 3-Tab Navigation (Spans 2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-medium">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Risk map
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors">
                  About the data
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LinkedIn Team Member Links (Spans 2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-medium">
              LinkedIn
            </h4>
            <ul className="space-y-2 text-xs">
              {TEAM_MEMBERS.map((member) => (
                <li key={member.name}>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-gray-900 transition-colors block"
                  >
                    {member.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Data Feeds (Spans 2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-medium">
              Data Feeds
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://hazards.fema.gov/nri/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  FEMA NRI
                </a>
              </li>
              <li>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  USGS Seismic
                </a>
              </li>
              <li>
                <a
                  href="https://www.weather.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  NOAA / NWS
                </a>
              </li>
              <li>
                <a
                  href="https://www.nifc.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  NIFC Wildland
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Affiliations / DS3 & HDSI (Spans 2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-medium">
              Affiliations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://ds3ucsd.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  DS3 Club
                </a>
              </li>
              <li>
                <a
                  href="https://datascience.ucsd.edu"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  HDSI Institute
                </a>
              </li>
              <li>
                <span className="text-gray-400">
                  Spring Projects
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="pt-8 border-t border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
          <div>
            <span>Risk Resource 2026. All rights reserved.</span>
          </div>

          {/* Green Status Beacon */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="text-gray-600">All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Risk Resource | US Natural Disaster Risk',
  description:
    'Synthesizing federal data from FEMA, NOAA, USGS, and NIFC into an explainable risk index for homeowners and communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#11100e] text-white min-h-screen antialiased selection:bg-amber-900/60 selection:text-white">
        {children}
      </body>
    </html>
  );
}
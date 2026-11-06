import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Risk Resource | US Natural Disaster Risk',
  description: 'US Natural Disaster Risk Assessment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fcfbf7] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
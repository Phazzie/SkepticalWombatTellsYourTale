import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkepticalWombat - Tell Your Tale',
  description: 'Voice-first storytelling and memoir app with AI collaboration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

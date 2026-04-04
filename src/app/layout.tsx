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
      <body className="bg-app-bg text-app-fg min-h-screen">
        {children}
      </body>
    </html>
  );
}

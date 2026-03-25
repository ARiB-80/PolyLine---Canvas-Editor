import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PolyLine Editor',
  description: 'Create and edit polyline drawings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

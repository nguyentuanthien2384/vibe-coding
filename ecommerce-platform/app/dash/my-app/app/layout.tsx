import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DashStack — Admin Dashboard',
  description: 'Hệ thống quản trị thương mại điện tử',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="h-full font-sans bg-[#F5F6FA] text-[#202224]">{children}</body>
    </html>
  );
}

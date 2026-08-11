import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DashStack — Admin Dashboard',
  description: 'Hệ thống quản trị thương mại điện tử',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${nunitoSans.variable} h-full antialiased`}>
      <body className="h-full font-sans bg-[#F5F6FA] text-[#202224]">{children}</body>
    </html>
  );
}

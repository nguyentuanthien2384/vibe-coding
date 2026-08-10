import React from 'react';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';

export const metadata = {
  title: 'Xác thực tài khoản - TechBite',
  description: 'Đăng nhập hoặc đăng ký tài khoản TechBite để nhận ưu đãi và mua sắm đồ ăn vặt chạy deadline.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

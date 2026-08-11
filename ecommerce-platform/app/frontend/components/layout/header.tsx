"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "../../store/use-cart-store";
import { useAuthStore } from "../../store/use-auth-store";
import { useAuthInit } from "../../hooks/use-auth-init";
import { SearchBar } from "../search/search-bar";
import { MobileSearchModal } from "../search/mobile-search-modal";

export const Header = () => {
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tự động khôi phục phiên đăng nhập và kích hoạt refresh token khi F5
  useAuthInit();

  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tự động đóng mobile menu & mobile search modal khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  const totalCount = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const displayName = user?.fullName || user?.name || '';
  const displayFirstName = displayName.trim()
    ? displayName.trim().split(' ').filter(Boolean).pop()
    : 'Tài khoản';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Mở menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center font-extrabold text-white text-xl shadow-md shadow-orange-600/20 group-hover:bg-orange-500 transition-colors">
              ⚡
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              Tech<span className="text-orange-600">Bite</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700 ml-4">
            <Link href="/" className="text-orange-600">
              Trang chủ
            </Link>
            <Link href="/products" className="hover:text-orange-600 transition-colors">
              Thực đơn
            </Link>
            <Link href="/combos" className="hover:text-orange-600 transition-colors">
              Combo Deadline 💻
            </Link>
            <Link href="/deals" className="hover:text-orange-600 transition-colors">
              Khuyến mãi 🔥
            </Link>
            {mounted && user?.role === 'ADMIN' && (
              <Link
                href="/admin/email-logs"
                className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>⚡</span> Email Logs
              </Link>
            )}
          </nav>

          {/* Desktop Search Bar */}
          <SearchBar className="flex-1 max-w-xs xl:max-w-md hidden md:block ml-auto" />

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Tìm kiếm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 active:scale-95"
              aria-label="Mở giỏ hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[18px] h-[18px] px-1 bg-orange-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Button */}
            {mounted && isAuthenticated ? (
              <Link
                href="/profile"
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-sm shadow-orange-600/20"
              >
                <span>👤</span>
                <span>{displayFirstName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-colors shrink-0 inline-block"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Search Overlay */}
      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white">
                  ⚡
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Tech<span className="text-orange-600">Bite</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Điều hướng
                </p>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 text-orange-600 font-semibold text-sm"
                >
                  <span>🏠</span> Trang chủ
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  <span>🍱</span> Tất cả thực đơn
                </Link>
                <Link
                  href="/combos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  <span>💻</span> Combo Deadline
                </Link>
                <Link
                  href="/deals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  <span>🔥</span> Khuyến mãi Hot
                </Link>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-1">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Danh mục món
                </p>
                <Link
                  href="/categories/do-an-vat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 text-sm hover:bg-slate-50"
                >
                  <span>🍟</span> Đồ ăn vặt
                </Link>
                <Link
                  href="/categories/nuoc-uong"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 text-sm hover:bg-slate-50"
                >
                  <span>🧃</span> Nước uống
                </Link>
                <Link
                  href="/categories/trai-cay-to"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 text-sm hover:bg-slate-50"
                >
                  <span>🍓</span> Trái cây tô
                </Link>
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {mounted && isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-colors"
                >
                  Trang cá nhân
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-colors"
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around shadow-lg">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="text-[10px] font-medium">Danh mục</span>
        </button>
        <button
          onClick={openCart}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-[10px] font-medium">Giỏ hàng</span>
          {totalCount > 0 && (
            <span className="absolute -top-1 right-2 min-w-[16px] h-[16px] px-0.5 bg-orange-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Tài khoản</span>
        </Link>
      </div>
    </>
  );
};

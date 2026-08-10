"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/use-auth-store';
import { useCartStore } from '../store/use-cart-store';
import { getMeApi } from '../lib/auth';

/**
 * Custom hook tự động kiểm tra và duy trì phiên đăng nhập (Auth Hydration) khi F5 / mở ứng dụng.
 * Đồng thời tự động khởi tạo / gộp giỏ hàng cho cả User đã đăng nhập lẫn Guest vãng lai.
 */
export function useAuthInit() {
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user = await getMeApi();
        if (isMounted) {
          setUser(user);
          // Đã đăng nhập ➔ Đồng bộ giỏ hàng vãng lai (nếu có) vào giỏ hàng DB
          await mergeGuestCart();
        }
      } catch {
        if (isMounted) {
          logout();
          // Chưa đăng nhập ➔ Tải giỏ hàng vãng lai (Guest Cart) qua Session ID
          await fetchCart();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser, logout, mergeGuestCart, fetchCart]);

  return { isLoading };
}

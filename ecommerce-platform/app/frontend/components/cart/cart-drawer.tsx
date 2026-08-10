"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/use-cart-store";
import { Backdrop } from "../ui/backdrop";
import { CartHeader } from "./cart-header";
import { CartItemList } from "./cart-item-list";
import { CartSummary } from "./cart-summary";

export const CartDrawer: React.FC = () => {
  const {
    isOpen,
    isLoading,
    error,
    items,
    summary,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItemsCount,
  } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open without layout shift (scrollbar jump)
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const totalItems = getTotalItemsCount();

  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop overlay */}
      <Backdrop isOpen={isOpen} onClick={closeCart} />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Giỏ hàng"
      >
        {/* Header */}
        <CartHeader
          totalCount={totalItems}
          onClose={closeCart}
          onClearCart={clearCart}
        />

        {/* Scrollable Item List */}
        <CartItemList
          items={items}
          isLoading={isLoading}
          error={error}
          onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
          onRemoveItem={(id) => removeItem(id)}
          onContinueShopping={closeCart}
        />

        {/* Sticky Summary & Checkout Footer */}
        {items.length > 0 && (
          <CartSummary
            summary={summary}
            onCheckout={handleCheckout}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};

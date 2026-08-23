import React from "react";
import type { Metadata } from "next";
import { CheckoutHeader } from "../../components/checkout/checkout-header";
import { CheckoutFooter } from "../../components/checkout/checkout-footer";
import { CheckoutContainer } from "../../components/checkout/checkout-container";

export const metadata: Metadata = {
  title: "Thanh toán đơn hàng - TechBite",
  description:
    "Hoàn tất thanh toán đơn hàng TechBite nhanh chóng với VietQR Auto-Confirmation hoặc COD.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-slate-900 flex flex-col">
      <CheckoutHeader currentStep={2} />
      <main className="flex-grow">
        <CheckoutContainer />
      </main>
      <CheckoutFooter />
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import { CheckoutHeader } from "../../components/checkout/checkout-header";
import { CheckoutFooter } from "../../components/checkout/checkout-footer";
import { CheckoutContainer } from "../../components/checkout/checkout-container";
import { MaintenanceBanner } from "../../components/layout/maintenance-banner";
import { getPublicSettings } from "../../lib/settings";

export const metadata: Metadata = {
  title: "Thanh toán đơn hàng - TechBite",
  description:
    "Hoàn tất thanh toán đơn hàng TechBite nhanh chóng với VietQR Auto-Confirmation hoặc COD.",
};

export default async function CheckoutPage() {
  const { general } = await getPublicSettings();

  return (
    <div className="bg-gray-50 min-h-screen text-slate-900 flex flex-col justify-between">
      <div>
        {general.maintenanceMode && (
          <MaintenanceBanner message={general.maintenanceMessage} />
        )}
        <CheckoutHeader currentStep={2} generalSettings={general} />
        <main className="flex-grow">
          <CheckoutContainer />
        </main>
      </div>
      <CheckoutFooter generalSettings={general} />
    </div>
  );
}

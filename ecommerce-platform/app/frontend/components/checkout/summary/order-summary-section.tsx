"use client";

import React from "react";
import {
  AppliedVoucherData,
  MiniCartItemData,
  PaymentMethodType,
} from "../../../types/checkout";
import { MiniCartItemList } from "./mini-cart-item-list";
import { CouponInputContainer } from "./coupon-input-container";
import { CheckoutPriceBreakdown } from "./checkout-price-breakdown";
import { PaymentMethodSelector } from "./payment-method-selector";
import { CheckoutSubmitButton } from "./checkout-submit-button";

interface OrderSummarySectionProps {
  items: MiniCartItemData[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  appliedVoucher: AppliedVoucherData | null;
  onApplyVoucher: (voucher: AppliedVoucherData | null) => void;
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  onSubmitOrder: () => void;
  isSubmitting: boolean;
}

export const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  items,
  subtotal,
  shippingFee,
  discountAmount,
  total,
  appliedVoucher,
  onApplyVoucher,
  paymentMethod,
  onPaymentMethodChange,
  onSubmitOrder,
  isSubmitting,
}) => {
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 font-headline">
          Đơn hàng của bạn ({totalCount})
        </h2>
        <span className="text-xs bg-orange-100 text-orange-700 font-extrabold px-2.5 py-1 rounded-full">
          Giao Hỏa Tốc
        </span>
      </div>

      {/* Mini Cart Items */}
      <MiniCartItemList items={items} />

      {/* Voucher Input */}
      <CouponInputContainer
        subtotal={subtotal}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={onApplyVoucher}
      />

      {/* Price Breakdown */}
      <CheckoutPriceBreakdown
        subtotal={subtotal}
        shippingFee={shippingFee}
        discountAmount={discountAmount}
        total={total}
      />

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onChange={onPaymentMethodChange}
      />

      {/* Primary CTA Submit */}
      <CheckoutSubmitButton
        onClick={onSubmitOrder}
        isLoading={isSubmitting}
        disabled={items.length === 0}
      />
    </section>
  );
};

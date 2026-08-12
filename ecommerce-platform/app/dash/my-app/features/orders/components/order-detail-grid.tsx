import React from 'react';
import { OrderDetail, PaymentStatus } from '../types/order.types';
import { PaymentInfoCard } from './cards/payment-info-card';
import { CustomerShippingCard } from './cards/customer-shipping-card';
import { OrderItemsCard } from './cards/order-items-card';
import { OrderFinancialSummaryCard } from './cards/order-financial-summary-card';

export interface OrderDetailGridProps {
  order: OrderDetail;
  onUpdatePaymentStatus?: (newStatus: PaymentStatus) => void;
}

export const OrderDetailGrid: React.FC<OrderDetailGridProps> = ({
  order,
  onUpdatePaymentStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PaymentInfoCard
            method={order.paymentMethod}
            status={order.paymentStatus}
            paidAt={order.paidAt || undefined}
            onUpdatePaymentStatus={onUpdatePaymentStatus}
          />
        </div>

        <div className="lg:col-span-2">
          <CustomerShippingCard
            customer={order.customer}
            shippingAddress={order.shippingAddress}
            orderNote={order.orderNote || undefined}
          />
        </div>
      </div>

      {/* Bottom Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderItemsCard items={order.items} />
        </div>

        <div className="lg:col-span-1">
          <OrderFinancialSummaryCard summary={order.summary} />
        </div>
      </div>
    </div>
  );
};


'use client';

import CustomerProfileCard from './cards/customer-profile-card';
import CustomerFinancialMetricsCard from './cards/customer-financial-metrics-card';
import CustomerAddressesCard from './cards/customer-addresses-card';
import CustomerOrderHistoryCard from './cards/customer-order-history-card';
import { CustomerDetail, CustomerAddress } from '../types/customer.types';

interface CustomerDetailGridProps {
  customer: CustomerDetail;
  onAddAddressClick: () => void;
}

const CustomerDetailGrid = ({ customer, onAddAddressClick }: CustomerDetailGridProps) => {
  return (
    <div className="space-y-6">
      {/* Hàng 1: Profile Card + Financial Metrics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CustomerProfileCard customer={customer} />
        </div>
        <div className="lg:col-span-2">
          <CustomerFinancialMetricsCard customer={customer} />
        </div>
      </div>

      {/* Hàng 2: Address List Card */}
      <CustomerAddressesCard
        addresses={customer.addresses}
        onAddClick={onAddAddressClick}
      />

      {/* Hàng 3: Order History Card */}
      <CustomerOrderHistoryCard customerId={customer.id} />
    </div>
  );
};

export default CustomerDetailGrid;

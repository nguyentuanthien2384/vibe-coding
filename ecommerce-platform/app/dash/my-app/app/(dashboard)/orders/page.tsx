import { OrderListPageClient } from '@/features/orders/components/order-list-page-client';

export const metadata = {
  title: 'Quản lý đơn hàng | Admin Dashboard',
  description: 'Trang quản lý đơn hàng hệ thống E-commerce',
};

export default function OrdersPage() {
  return <OrderListPageClient />;
}

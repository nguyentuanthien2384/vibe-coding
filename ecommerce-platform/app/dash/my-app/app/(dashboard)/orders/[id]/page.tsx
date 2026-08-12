import { OrderDetailContainer } from '@/features/orders/components/order-detail-container';

export const metadata = {
  title: 'Chi tiết đơn hàng | Admin Dashboard',
  description: 'Trang xem chi tiết đơn hàng hệ thống E-commerce',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailContainer orderId={id} />;
}

import CustomerDetailContainer from '../../../../features/customers/components/customer-detail-container';

export const metadata = {
  title: 'Chi Tiết Khách Hàng | TechBite Admin',
  description: 'Xem thông tin chi tiết, sổ địa chỉ và lịch sử đơn hàng của khách hàng.',
};

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomerDetailContainer customerId={id} />;
}

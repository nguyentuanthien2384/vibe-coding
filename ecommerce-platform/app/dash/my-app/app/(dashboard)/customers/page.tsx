import CustomerListPageClient from '../../../features/customers/components/customer-list-page-client';

export const metadata = {
  title: 'Quản Lý Khách Hàng | TechBite Admin',
  description: 'Danh sách và quản lý thông tin khách hàng, phân loại thành viên và khách vãng lai.',
};

const CustomersPage = () => {
  return <CustomerListPageClient />;
};

export default CustomersPage;

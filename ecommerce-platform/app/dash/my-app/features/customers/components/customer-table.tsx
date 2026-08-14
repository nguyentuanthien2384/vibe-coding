import CustomerTableHeader from './customer-table-header';
import CustomerTableRow from './customer-table-row';
import { CustomerListItem } from '../types/customer.types';
import { Users } from 'lucide-react';

interface CustomerTableProps {
  customers: CustomerListItem[];
  isLoading?: boolean;
  onStatusClick: (customer: CustomerListItem) => void;
  onEditClick: (customer: CustomerListItem) => void;
}

const CustomerTable = ({ customers, isLoading = false, onStatusClick, onEditClick }: CustomerTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-t-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4880FF] border-t-transparent" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Đang tải danh sách khách hàng...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Không tìm thấy khách hàng</h3>
        <p className="text-sm text-slate-500 mt-1">
          Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-t-2xl border border-b-0 border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <CustomerTableHeader />
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {customers.map((customer) => (
            <CustomerTableRow
              key={customer.id}
              customer={customer}
              onStatusClick={onStatusClick}
              onEditClick={onEditClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;

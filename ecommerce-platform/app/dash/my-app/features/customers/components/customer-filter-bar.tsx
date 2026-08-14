'use client';

import { Filter, ArrowUpDown } from 'lucide-react';
import SearchInput from '../../../components/ui/search-input';
import { CustomerType, CustomerStatus, CustomerSortOption } from '../types/customer.types';

interface CustomerFilterBarProps {
  searchRaw: string;
  onSearchChange: (value: string) => void;
  selectedType: CustomerType | 'ALL';
  onTypeChange: (type: CustomerType | 'ALL') => void;
  selectedStatus: CustomerStatus | 'ALL';
  onStatusChange: (status: CustomerStatus | 'ALL') => void;
  sortBy: CustomerSortOption;
  onSortChange: (sort: CustomerSortOption) => void;
  onResetFilters: () => void;
}

const CustomerFilterBar = ({
  searchRaw,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onResetFilters,
}: CustomerFilterBarProps) => {
  const hasActiveFilters =
    searchRaw !== '' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || sortBy !== 'createdAt_desc';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Ô Tìm Kiếm */}
      <div className="flex-1 min-w-[240px]">
        <SearchInput
          value={searchRaw}
          onChange={onSearchChange}
          placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
          className="w-full"
        />
      </div>

      {/* Bộ Lọc Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Lọc loại khách hàng */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as CustomerType | 'ALL')}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
          >
            <option value="ALL">Tất cả loại khách</option>
            <option value="REGISTERED">Khách thành viên</option>
            <option value="GUEST">Khách vãng lai</option>
          </select>
        </div>

        {/* Lọc trạng thái */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as CustomerStatus | 'ALL')}
          className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="BLOCKED">Đã bị tạm khóa</option>
          <option value="INACTIVE">Chưa kích hoạt</option>
        </select>

        {/* Sắp xếp */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as CustomerSortOption)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30"
          >
            <option value="createdAt_desc">Mới nhất</option>
            <option value="createdAt_asc">Cũ nhất</option>
            <option value="totalSpent_desc">Chi tiêu nhiều nhất</option>
            <option value="totalOrders_desc">Đơn hàng nhiều nhất</option>
            <option value="name_asc">Tên (A - Z)</option>
          </select>
        </div>

        {/* Nút Đặt lại bộ lọc */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerFilterBar;

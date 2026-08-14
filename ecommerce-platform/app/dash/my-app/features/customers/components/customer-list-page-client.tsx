'use client';

import { useState, useEffect, useCallback } from 'react';
import CustomerListPageHeader from './customer-list-page-header';
import CustomerFilterBar from './customer-filter-bar';
import CustomerTable from './customer-table';
import CustomerPagination from './customer-pagination';
import CreateCustomerModal from './create-customer-modal';
import UpdateCustomerStatusModal from './update-customer-status-modal';
import EditCustomerModal from './edit-customer-modal';
import { useDebounce } from '../../../hooks/use-debounce';
import { useToast } from '../../../components/ui/toast';
import {
  CustomerListItem,
  CustomerType,
  CustomerStatus,
  CustomerSortOption,
  CreateCustomerInput,
  UpdateCustomerStatusInput,
  UpdateCustomerInfoInput,
} from '../types/customer.types';
import { getCustomers, createCustomer, updateCustomerStatus, updateCustomerInfo } from '../api/customers-api';

const CustomerListPageClient = () => {
  const { showToast } = useToast();
  const [searchRaw, setSearchRaw] = useState('');
  const debouncedSearch = useDebounce(searchRaw, 400);

  const [selectedType, setSelectedType] = useState<CustomerType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<CustomerSortOption>('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    registeredCount: 0,
    guestCount: 0,
    activeCount: 0,
    blockedCount: 0,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerForStatus, setSelectedCustomerForStatus] = useState<CustomerListItem | null>(null);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<CustomerListItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await getCustomers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        type: selectedType,
        status: selectedStatus,
        sortBy,
      });

      setCustomers(res.data);
      setTotalRecords(res.total);
      setTotalPages(res.totalPages);
      setStats(res.stats);
    } catch (err: any) {
      const message = err?.message || 'Không thể kết nối đến máy chủ API';
      setErrorMsg(message);
      showToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedType, selectedStatus, sortBy, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset trang về 1 khi đổi bộ lọc
  const handleSearchChange = (val: string) => {
    setSearchRaw(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: CustomerType | 'ALL') => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleStatusChange = (st: CustomerStatus | 'ALL') => {
    setSelectedStatus(st);
    setCurrentPage(1);
  };

  const handleSortChange = (so: CustomerSortOption) => {
    setSortBy(so);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchRaw('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortBy('createdAt_desc');
    setCurrentPage(1);
  };

  const handleCreateSubmit = async (input: CreateCustomerInput) => {
    try {
      await createCustomer(input);
      showToast('success', 'Tạo mới tài khoản khách hàng thành công!');
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi tạo tài khoản khách hàng');
    }
  };

  const handleStatusSubmit = async (input: UpdateCustomerStatusInput) => {
    try {
      await updateCustomerStatus(input);
      showToast('success', `Đã cập nhật trạng thái khách hàng sang [${input.status}] thành công!`);
      setSelectedCustomerForStatus(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleEditSubmit = async (input: UpdateCustomerInfoInput) => {
    try {
      await updateCustomerInfo(input);
      showToast('success', 'Cập nhật thông tin khách hàng thành công!');
      setSelectedCustomerForEdit(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  return (
    <div className="w-full">
      <CustomerListPageHeader
        stats={stats}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <CustomerFilterBar
        searchRaw={searchRaw}
        onSearchChange={handleSearchChange}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
      />

      {errorMsg && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onStatusClick={(cust) => setSelectedCustomerForStatus(cust)}
        onEditClick={(cust) => setSelectedCustomerForEdit(cust)}
      />

      <CustomerPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
      />

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditCustomerModal
        customer={selectedCustomerForEdit}
        isOpen={!!selectedCustomerForEdit}
        onClose={() => setSelectedCustomerForEdit(null)}
        onSubmit={handleEditSubmit}
      />

      <UpdateCustomerStatusModal
        customer={selectedCustomerForStatus}
        isOpen={!!selectedCustomerForStatus}
        onClose={() => setSelectedCustomerForStatus(null)}
        onSubmit={handleStatusSubmit}
      />
    </div>
  );
};

export default CustomerListPageClient;

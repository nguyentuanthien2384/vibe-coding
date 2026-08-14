'use client';

import { useState, useEffect } from 'react';
import CustomerDetailHeader from './customer-detail-header';
import CustomerDetailGrid from './customer-detail-grid';
import UpdateCustomerStatusModal from './update-customer-status-modal';
import EditCustomerModal from './edit-customer-modal';
import CreateCustomerModal from './create-customer-modal';
import AddAddressModal from './modals/add-address-modal';
import { useToast } from '../../../components/ui/toast';
import { CustomerDetail, CustomerAddress, UpdateCustomerStatusInput, UpdateCustomerInfoInput, CreateCustomerInput } from '../types/customer.types';
import { getCustomerById, updateCustomerStatus, updateCustomerInfo, createCustomer, addCustomerAddress } from '../api/customers-api';
import { Users } from 'lucide-react';

interface CustomerDetailContainerProps {
  customerId: string;
}

const CustomerDetailContainer = ({ customerId }: CustomerDetailContainerProps) => {
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const decodedId = decodeURIComponent(customerId);
      const data = await getCustomerById(decodedId);
      setCustomer(data);
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi tải thông tin khách hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleStatusSubmit = async (input: UpdateCustomerStatusInput) => {
    try {
      await updateCustomerStatus(input);
      showToast('success', `Đã cập nhật trạng thái khách hàng sang [${input.status}] thành công!`);
      setIsStatusModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleEditSubmit = async (input: UpdateCustomerInfoInput) => {
    try {
      await updateCustomerInfo(input);
      showToast('success', 'Cập nhật thông tin khách hàng thành công!');
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  const handleCreateSubmit = async (input: CreateCustomerInput) => {
    try {
      await createCustomer(input);
      showToast('success', 'Tạo mới tài khoản khách hàng thành công!');
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi tạo tài khoản');
    }
  };

  const handleAddAddressSubmit = async (address: Omit<CustomerAddress, 'id'>) => {
    try {
      await addCustomerAddress(customerId, address);
      showToast('success', 'Thêm địa chỉ nhận hàng mới thành công!');
      setIsAddressModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi thêm địa chỉ');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4880FF] border-t-transparent" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Đang tải thông tin khách hàng từ máy chủ...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Không tìm thấy thông tin khách hàng</h3>
        <p className="text-sm text-slate-500 mt-1">Mã khách hàng {customerId} không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CustomerDetailHeader
        customer={customer}
        onStatusToggle={() => setIsStatusModalOpen(true)}
        onEditClick={() => setIsEditModalOpen(true)}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <CustomerDetailGrid
        customer={customer}
        onAddAddressClick={() => setIsAddressModalOpen(true)}
      />

      <EditCustomerModal
        customer={customer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <UpdateCustomerStatusModal
        customer={customer}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusSubmit}
      />

      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={handleAddAddressSubmit}
      />
    </div>
  );
};

export default CustomerDetailContainer;

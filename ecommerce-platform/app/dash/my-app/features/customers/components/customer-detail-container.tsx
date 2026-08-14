'use client';

import { useState, useEffect } from 'react';
import CustomerDetailHeader from './customer-detail-header';
import CustomerDetailGrid from './customer-detail-grid';
import UpdateCustomerStatusModal from './update-customer-status-modal';
import EditCustomerModal from './edit-customer-modal';
import CreateCustomerModal from './create-customer-modal';
import AddAddressModal from './modals/add-address-modal';
import { CustomerDetail, CustomerAddress, UpdateCustomerStatusInput, UpdateCustomerInfoInput, CreateCustomerInput } from '../types/customer.types';
import { getCustomerById, updateCustomerStatus, updateCustomerInfo, createCustomer, addCustomerAddress } from '../api/customers-api';
import { Users } from 'lucide-react';

interface CustomerDetailContainerProps {
  customerId: string;
}

const CustomerDetailContainer = ({ customerId }: CustomerDetailContainerProps) => {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomerById(customerId);
      setCustomer(data);
    } catch (err) {
      console.error('Lỗi tải thông tin khách hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleStatusSubmit = async (input: UpdateCustomerStatusInput) => {
    await updateCustomerStatus(input);
    await loadData();
  };

  const handleEditSubmit = async (input: UpdateCustomerInfoInput) => {
    await updateCustomerInfo(input);
    await loadData();
  };

  const handleCreateSubmit = async (input: CreateCustomerInput) => {
    await createCustomer(input);
    await loadData();
  };

  const handleAddAddressSubmit = async (address: Omit<CustomerAddress, 'id'>) => {
    await addCustomerAddress(customerId, address);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4880FF] border-t-transparent" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Đang tải thông tin khách hàng...</p>
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

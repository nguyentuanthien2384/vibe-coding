'use client';

import { MapPin, Plus, Star, Phone, User } from 'lucide-react';
import { CustomerAddress } from '../../types/customer.types';

interface CustomerAddressesCardProps {
  addresses: CustomerAddress[];
  onAddClick: () => void;
}

const CustomerAddressesCard = ({ addresses, onAddClick }: CustomerAddressesCardProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#4880FF]" />
          Sổ Địa Chỉ Giao Hàng ({addresses.length})
        </h3>
        <button
          onClick={onAddClick}
          className="inline-flex items-center text-xs font-semibold text-[#4880FF] hover:underline"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Thêm địa chỉ mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Khách hàng chưa lưu địa chỉ giao hàng nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-xl border relative transition-all ${
                addr.isDefault
                  ? 'border-[#4880FF] bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-[#4880FF] text-white rounded-full">
                  <Star className="w-3 h-3 mr-0.5 fill-current" />
                  Mặc định
                </span>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {addr.recipientName}
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {addr.phone}
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {addr.detailAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAddressesCard;

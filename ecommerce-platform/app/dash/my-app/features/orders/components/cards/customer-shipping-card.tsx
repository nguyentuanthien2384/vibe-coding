import React from 'react';
import { CustomerInfo, ShippingAddress } from '../../types/order.types';
import { MapPin, User, Phone, FileText } from 'lucide-react';

export interface CustomerShippingCardProps {
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  orderNote?: string;
}

export const CustomerShippingCard: React.FC<CustomerShippingCardProps> = ({
  customer,
  shippingAddress,
  orderNote,
}) => {
  const fullAddress = `${shippingAddress.detailAddress}, ${shippingAddress.wardName}, ${shippingAddress.districtName}, ${shippingAddress.provinceName}`;
  const noteContent = orderNote || shippingAddress.note;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 h-full">
      <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <MapPin className="w-5 h-5" />
        </div>
        <h3>Thông tin giao hàng & Khách hàng</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Customer / Recipient Name & Phone */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium block">Người nhận hàng</span>
              <span className="font-bold text-slate-900">{shippingAddress.recipientName}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium block">Số điện thoại</span>
              <span className="font-semibold text-slate-800">{shippingAddress.phone}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-medium block">Địa chỉ nhận hàng</span>
              <span className="font-medium text-slate-700 leading-snug">{fullAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Section */}
      {noteContent && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60">
            <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-amber-700 font-extrabold block uppercase tracking-wider">
                Ghi chú từ khách hàng (Note DB)
              </span>
              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                {noteContent}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


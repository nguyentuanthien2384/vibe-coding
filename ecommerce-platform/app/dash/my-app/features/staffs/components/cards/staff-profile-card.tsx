import React from 'react';
import { Mail, Phone, Calendar, Clock, ClipboardList } from 'lucide-react';
import { StaffDetail } from '@/features/staffs/types/staff.types';
import UserAvatar from '@/components/ui/user-avatar';
import StaffStatusBadge from '../staff-status-badge';

interface StaffProfileCardProps {
  staff: StaffDetail;
}

export default function StaffProfileCard({ staff }: StaffProfileCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Thông tin cá nhân</h3>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
        <UserAvatar name={staff.fullName} avatarUrl={staff.avatarUrl} size="lg" />
        <div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{staff.fullName}</h4>
          <div className="flex items-center gap-3 mt-2">
            <StaffStatusBadge status={staff.status} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{staff.email}</p>
            <p className="text-xs text-slate-500">Địa chỉ Email</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {staff.phone || 'Chưa cập nhật'}
            </p>
            <p className="text-xs text-slate-500">Số điện thoại</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {staff.createdAt}
            </p>
            <p className="text-xs text-slate-500">Ngày tham gia</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${staff.lastLoginAt ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 italic'}`}>
              {staff.lastLoginAt
                ? new Date(staff.lastLoginAt).toLocaleString('vi-VN')
                : 'Chưa từng đăng nhập'}
            </p>
            <p className="text-xs text-slate-500">Hoạt động gần nhất</p>
          </div>
        </div>


        {staff.notes && (
          <div className="flex items-start gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <ClipboardList className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-relaxed">
                {staff.notes}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ghi chú nội bộ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

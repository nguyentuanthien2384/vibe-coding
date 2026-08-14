import { Mail, Phone, Calendar, Clock, FileText } from 'lucide-react';
import UserAvatar from '../../../../components/ui/user-avatar';
import { CustomerDetail } from '../../types/customer.types';

interface CustomerProfileCardProps {
  customer: CustomerDetail;
}

const CustomerProfileCard = ({ customer }: CustomerProfileCardProps) => {
  const formattedCreatedAt = new Date(customer.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedLastOrder = customer.lastOrderAt
    ? new Date(customer.lastOrderAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa có đơn hàng';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center space-x-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <UserAvatar name={customer.fullName} avatarUrl={customer.avatarUrl} size="lg" />
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{customer.fullName}</h3>
          <span className="text-xs text-[#4880FF] font-semibold">
            {customer.type === 'REGISTERED' ? 'Tài khoản thành viên' : 'Khách vãng lai'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Mail className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-500 mr-2">Email:</span>
          <span className="font-semibold text-slate-800 dark:text-white select-all">{customer.email}</span>
        </div>

        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Phone className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-500 mr-2">Số điện thoại:</span>
          <span className="font-semibold text-slate-800 dark:text-white select-all">{customer.phone}</span>
        </div>

        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-500 mr-2">Ngày tham gia:</span>
          <span className="font-semibold text-slate-800 dark:text-white">{formattedCreatedAt}</span>
        </div>

        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-500 mr-2">Mua hàng gần nhất:</span>
          <span className="font-semibold text-slate-800 dark:text-white">{formattedLastOrder}</span>
        </div>

        {customer.notes && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center text-slate-500 font-semibold mb-1">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Ghi chú quản trị:
            </div>
            <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic whitespace-pre-line">
              {customer.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileCard;

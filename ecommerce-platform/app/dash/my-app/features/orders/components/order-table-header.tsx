import React from 'react';

export const OrderTableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="bg-slate-50/80 border-b border-gray-100 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
        <th scope="col" className="py-4 px-5">
          Mã đơn hàng
        </th>
        <th scope="col" className="py-4 px-5">
          Khách hàng
        </th>
        <th scope="col" className="py-4 px-5 text-center">
          Số món
        </th>
        <th scope="col" className="py-4 px-5">
          Tổng tiền
        </th>
        <th scope="col" className="py-4 px-5">
          Trạng thái đơn
        </th>
        <th scope="col" className="py-4 px-5">
          Thanh toán
        </th>
        <th scope="col" className="py-4 px-5">
          Thời gian
        </th>
        <th scope="col" className="py-4 px-5 text-right">
          Thao tác
        </th>
      </tr>
    </thead>
  );
};

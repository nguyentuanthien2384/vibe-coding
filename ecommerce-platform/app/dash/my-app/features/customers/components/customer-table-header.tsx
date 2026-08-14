const CustomerTableHeader = () => {
  return (
    <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs text-slate-500 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
      <tr>
        <th scope="col" className="px-6 py-3.5 text-left">
          Khách Hàng
        </th>
        <th scope="col" className="px-6 py-3.5 text-left">
          Liên Hệ
        </th>
        <th scope="col" className="px-6 py-3.5 text-center">
          Trạng Thái
        </th>
        <th scope="col" className="px-6 py-3.5 text-right">
          Đơn Hàng / Chi Tiêu
        </th>
        <th scope="col" className="px-6 py-3.5 text-center">
          Ngày Tạo
        </th>
        <th scope="col" className="px-6 py-3.5 text-center">
          Thao Tác
        </th>
      </tr>
    </thead>
  );
};

export default CustomerTableHeader;

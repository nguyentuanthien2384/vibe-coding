export default function BlogTableHeader() {
  return (
    <thead>
      <tr className="bg-gray-50/60 border-b border-gray-100">
        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[300px]">
          Bài viết
        </th>
        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          Chuyên mục
        </th>
        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          Tác giả
        </th>
        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Lượt xem
        </th>
        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          Trạng thái
        </th>
        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Ngày xuất bản
        </th>
        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
          Thao tác
        </th>
      </tr>
    </thead>
  );
}

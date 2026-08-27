import { PostCategory } from '../../types/blog.types';
import BlogCategoryTableRow from './blog-category-table-row';

interface BlogCategoryTableProps {
  categories: PostCategory[];
  onEditClick: (category: PostCategory) => void;
  onDeleteClick: (category: PostCategory) => void;
  onToggleActive: (categoryId: number, currentActive: boolean) => void;
}

export default function BlogCategoryTable({
  categories,
  onEditClick,
  onDeleteClick,
  onToggleActive,
}: BlogCategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/60 border-b border-gray-100">
            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</th>
            <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên chuyên mục</th>
            <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mô tả</th>
            <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Bài viết</th>
            <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thứ tự</th>
            <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center">
                <p className="text-2xl mb-2">📁</p>
                <p className="text-sm text-gray-400 font-medium">Chưa có chuyên mục nào</p>
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <BlogCategoryTableRow
                key={category.id}
                category={category}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onToggleActive={onToggleActive}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

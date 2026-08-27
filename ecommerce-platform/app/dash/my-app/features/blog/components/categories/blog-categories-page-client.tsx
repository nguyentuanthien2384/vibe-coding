'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { PostCategory } from '../../types/blog.types';
import { blogApi } from '../../../../lib/blog-api';
import BlogCategoryPageHeader from './blog-category-page-header';
import BlogCategoryTable from './blog-category-table';
import CategoryFormModal from './category-form-modal';
import DeleteCategoryConfirmModal from './delete-category-confirm-modal';

interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
}

export default function BlogCategoriesPageClient() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<PostCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await blogApi.getCategories();
      if (res && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách chuyên mục';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (category: PostCategory) => {
    setEditingCategory(category);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (category: PostCategory) => {
    setDeletingCategory(category);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await blogApi.updateCategory(editingCategory.id, data);
      } else {
        await blogApi.createCategory(data);
      }
      await fetchCategories();
      setFormModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu chuyên mục thất bại');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await blogApi.deleteCategory(deletingCategory.id);
      setDeleteModalOpen(false);
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa chuyên mục thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (categoryId: number, currentActive: boolean) => {
    try {
      await blogApi.updateCategory(categoryId, { isActive: !currentActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, isActive: !currentActive } : c)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BlogCategoryPageHeader
        totalCount={categories.length}
        onOpenCreate={handleOpenCreate}
      />

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
            <span className="text-sm font-semibold text-gray-500">Đang tải danh sách chuyên mục...</span>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Lỗi kết nối dữ liệu</h3>
              <p className="text-xs text-gray-500 mt-1">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchCategories()}
              className="px-4 py-2 bg-[#4880FF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại
            </button>
          </div>
        ) : (
          <BlogCategoryTable
            categories={categories.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))}
            onEditClick={handleOpenEdit}
            onDeleteClick={handleOpenDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <CategoryFormModal
        isOpen={formModalOpen}
        category={editingCategory}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Modal */}
      <DeleteCategoryConfirmModal
        isOpen={deleteModalOpen}
        category={deletingCategory}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

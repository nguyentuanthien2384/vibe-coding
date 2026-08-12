'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '../../../hooks/use-debounce';
import { useToast } from '../../../components/ui/toast';
import { categoriesApi, GetCategoriesParams } from '../../../lib/categories-api';
import {
  Category,
  CategoryFormData,
  Pagination,
  AdminCategoriesListResponse,
} from '../types/category.types';
import CategoryPageHeader from './category-page-header';
import CategoryFilterBar from './category-filter-bar';
import CategoryTable from './category-table';
import CategoryPagination from './category-pagination';
import CategoryFormModal from './category-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 10;

interface CategoryPageClientProps {
  /** Data được pre-fetch từ Server Component. null nếu server fetch thất bại. */
  initialData: AdminCategoriesListResponse | null;
}

const CategoryPageClient = ({ initialData }: CategoryPageClientProps) => {
  const { showToast } = useToast();

  // ── Khởi tạo state từ server-fetched data ─────────────────────
  const [categories, setCategories] = useState<Category[]>(
    initialData?.data ?? [],
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialData?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
  );

  // ── UI state ──────────────────────────────────────────────────
  // Nếu server đã fetch thành công → isLoading = false ngay từ đầu (no flash)
  const [isLoading, setIsLoading] = useState(initialData === null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Filter / Pagination state ─────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 350);

  // ── Modal state ───────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Đánh dấu lần render đầu để skip client-fetch khi đã có initialData ──
  const isFirstRender = useRef(true);

  // ── Client-side fetch (chỉ khi user tương tác) ────────────────
  const fetchCategories = useCallback(
    async (params: GetCategoriesParams) => {
      setIsLoading(true);
      try {
        const res = await categoriesApi.getList(params);
        setCategories(res.data);
        setPagination(res.pagination);
      } catch (err) {
        showToast(
          'error',
          err instanceof Error
            ? err.message
            : 'Không thể tải danh sách chuyên mục. Vui lòng thử lại.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    // Bỏ qua lần chạy đầu tiên nếu server đã cung cấp data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialData !== null) return; // Server data đã có → không fetch lại
    }
    // Các lần sau: user thay đổi search hoặc page → client fetch
    fetchCategories({ search: debouncedSearch, page: currentPage, limit: PAGE_SIZE });
  }, [debouncedSearch, currentPage, fetchCategories, initialData]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setSubmitError(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setSubmitError(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) setDeletingCategory(cat);
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
    setSubmitError(null);
  };

  // ── Submit Create / Update ─────────────────────────────────────
  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, data);
        showToast('success', `Đã cập nhật chuyên mục "${data.name}" thành công`);
      } else {
        await categoriesApi.create(data);
        showToast('success', `Đã tạo mới chuyên mục "${data.name}" thành công`);
      }
      handleFormClose();
      await fetchCategories({ search: debouncedSearch, page: currentPage, limit: PAGE_SIZE });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit Delete ──────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deletingCategory.id);
      showToast('success', `Đã xóa chuyên mục "${deletingCategory.name}" thành công`);
      setDeletingCategory(null);

      const newTotal = pagination.total - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE);
      const nextPage =
        currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
      setCurrentPage(nextPage);
      await fetchCategories({ search: debouncedSearch, page: nextPage, limit: PAGE_SIZE });
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể xóa chuyên mục. Vui lòng thử lại.',
      );
      setDeletingCategory(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1400px]">
      <CategoryPageHeader onAddClick={handleAddClick} />

      <CategoryFilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <CategoryTable
              categories={categories}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
            <CategoryPagination
              currentPage={pagination.page}
              totalItems={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <CategoryFormModal
        isOpen={isFormModalOpen}
        editingCategory={editingCategory}
        categories={categories}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deletingCategory !== null}
        categoryName={deletingCategory?.name ?? ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};

export default CategoryPageClient;

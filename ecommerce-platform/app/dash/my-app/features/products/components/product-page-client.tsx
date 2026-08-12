'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ProductItem, CategoryOption, AdminProductListResponse, Pagination } from '../types/product.types';
import { productsApi, GetAdminProductsParams } from '../../../lib/products-api';
import { categoriesApi } from '../../../lib/categories-api';
import { useToast } from '../../../components/ui/toast';
import { useDebounce } from '../../../hooks/use-debounce';
import ProductPageHeader from './product-page-header';
import ProductFilterBar from './product-filter-bar';
import ProductTable from './product-table';
import ProductPagination from './product-pagination';
import DeleteConfirmModal from './delete-confirm-modal';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const PAGE_SIZE = 10;

interface ProductPageClientProps {
  initialData: AdminProductListResponse | null;
}

export default function ProductPageClient({ initialData }: ProductPageClientProps) {
  const { showToast } = useToast();

  // Data & Pagination state
  const [products, setProducts] = useState<ProductItem[]>(initialData?.data ?? []);
  const [pagination, setPagination] = useState<Pagination>(
    initialData?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
  );

  // Categories list for filter bar
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);

  // UI state (3-States: Loading, Error, Success/Empty)
  const [isLoading, setIsLoading] = useState(initialData === null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Debounced search term (350ms)
  const debouncedSearch = useDebounce(searchTerm, 350);

  // First render flag to skip redundant client fetch if initialData exists
  const isFirstRender = useRef(true);

  // Fetch Categories list from API on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoriesApi.getList({ limit: 100 });
        const options: CategoryOption[] = res.data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }));
        setCategoriesList(options);
      } catch (err) {
        // Fallback gracefully
        console.warn('Could not load categories for filter', err);
      }
    }
    loadCategories();
  }, []);

  // Compute category counts based on current fetched products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: pagination.total || products.length };
    categoriesList.forEach((cat) => {
      counts[cat.name] = products.filter((p) => p.categoryName === cat.name || p.categoryId === cat.id).length;
    });
    return counts;
  }, [products, pagination.total, categoriesList]);

  // Client-side API fetcher
  const fetchProducts = useCallback(
    async (params: GetAdminProductsParams) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await productsApi.getList(params);
        setProducts(res.data);
        setPagination(res.pagination);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm từ máy chủ.';
        setErrorMessage(msg);
        showToast('error', msg);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  // Trigger fetch when filters or page change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialData !== null) return;
    }

    // Map selected category name to categoryId if found
    const selectedCatObj = categoriesList.find((c) => c.name === selectedCategory);
    const categoryId = selectedCatObj ? selectedCatObj.id : undefined;

    fetchProducts({
      search: debouncedSearch,
      status: selectedStatus,
      stockStatus: stockFilter,
      categoryId,
      page: currentPage,
      limit: PAGE_SIZE,
    });
  }, [debouncedSearch, selectedStatus, selectedCategory, stockFilter, currentPage, categoriesList, fetchProducts, initialData]);

  // Handlers
  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
  };

  const handleOpenDeleteModal = (product: ProductItem) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(productToDelete.id);
      showToast('success', `Đã xóa sản phẩm "${productToDelete.name}" thành công`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);

      // Refresh list
      const newTotal = pagination.total - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE);
      const nextPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
      setCurrentPage(nextPage);

      const selectedCatObj = categoriesList.find((c) => c.name === selectedCategory);
      await fetchProducts({
        search: debouncedSearch,
        status: selectedStatus,
        stockStatus: stockFilter,
        categoryId: selectedCatObj?.id,
        page: nextPage,
        limit: PAGE_SIZE,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa sản phẩm. Vui lòng thử lại.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setStockFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductPageHeader totalCount={pagination.total} />

      {/* Filter Bar */}
      <ProductFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        categoriesList={categoriesList}
        categoryCounts={categoryCounts}
        stockFilter={stockFilter}
        onStockFilterChange={(stock) => {
          setStockFilter(stock);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Table Box (3 UI States: Loading, Error, Success/Empty) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 1. Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
            <span className="text-sm font-semibold text-gray-500">Đang kết nối API & tải danh sách sản phẩm...</span>
          </div>
        ) : errorMessage ? (
          /* 2. Error State */
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
              onClick={() => {
                const selectedCatObj = categoriesList.find((c) => c.name === selectedCategory);
                fetchProducts({
                  search: debouncedSearch,
                  status: selectedStatus,
                  stockStatus: stockFilter,
                  categoryId: selectedCatObj?.id,
                  page: currentPage,
                  limit: PAGE_SIZE,
                });
              }}
              className="px-4 py-2 bg-[#4880FF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại trang
            </button>
          </div>
        ) : products.length === 0 ? (
          /* 3. Empty State */
          <div className="py-20 text-center space-y-3">
            <p className="text-gray-400 font-semibold text-sm">Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>

            {(searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || stockFilter !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#4880FF] hover:underline cursor-pointer"
              >
                Xóa bộ lọc & thử lại
              </button>
            )}
          </div>
        ) : (
          /* 4. Success State with Product Table & Pagination */
          <>
            <ProductTable
              products={products}
              onDelete={handleOpenDeleteModal}
              onCategoryClick={handleCategoryClick}
            />
            <ProductPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

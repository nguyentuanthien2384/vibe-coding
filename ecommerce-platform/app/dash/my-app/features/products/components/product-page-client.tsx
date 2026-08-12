'use client';

import { useState, useMemo } from 'react';
import { ProductItem } from '../types/product.types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mock-products';
import ProductPageHeader from './product-page-header';
import ProductFilterBar from './product-filter-bar';
import ProductTable from './product-table';
import ProductPagination from './product-pagination';
import DeleteConfirmModal from './delete-confirm-modal';
import { useDebounce } from '../../../hooks/use-debounce';

export default function ProductPageClient() {
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Debounced search term for performance (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Compute category counts for category filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    MOCK_CATEGORIES.forEach((cat) => {
      counts[cat.name] = products.filter((p) => p.categoryName === cat.name).length;
    });
    return counts;
  }, [products]);

  // Filter products based on search, category, status, stock
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Search (Name or Slug)
      const matchesSearch =
        debouncedSearchTerm.trim() === '' ||
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // 2. Status
      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      // 3. Category
      const matchesCategory =
        selectedCategory === 'ALL' || item.categoryName === selectedCategory;

      // 4. Stock Filter
      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && item.stock > 0) ||
        (stockFilter === 'OUT_OF_STOCK' && item.stock === 0);

      return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });
  }, [products, debouncedSearchTerm, selectedStatus, selectedCategory, stockFilter]);

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Handle Category click from Table Row
  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (product: ProductItem) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Action
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Reset Filters
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
      <ProductPageHeader totalCount={products.length} />

      {/* Filter Bar with Category Pills & Counts */}
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
        categoriesList={MOCK_CATEGORIES}
        categoryCounts={categoryCounts}
        stockFilter={stockFilter}
        onStockFilterChange={(stock) => {
          setStockFilter(stock);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ProductTable
        products={paginatedProducts}
        onDelete={handleOpenDeleteModal}
        onCategoryClick={handleCategoryClick}
      />

      {/* Pagination */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
      />
    </div>
  );
}

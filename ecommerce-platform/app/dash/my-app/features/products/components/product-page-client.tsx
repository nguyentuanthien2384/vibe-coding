'use client';

import { useState, useMemo } from 'react';
import { ProductItem, ProductFormData } from '../types/product.types';
import { MOCK_PRODUCTS } from '../data/mock-products';
import ProductPageHeader from './product-page-header';
import ProductFilterBar from './product-filter-bar';
import ProductTable from './product-table';
import ProductPagination from './product-pagination';
import ProductFormModal from './product-form-modal';
import ProductDeleteModal from './product-delete-modal';
import { useDebounce } from '../../../hooks/use-debounce';

const CATEGORIES_LIST = [
  { id: 'cat-001', name: 'Thiết bị điện tử' },
  { id: 'cat-002', name: 'Thời trang nam nữ' },
  { id: 'cat-003', name: 'Thực phẩm & Đồ ăn' },
];

export default function ProductPageClient() {
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  // Debounced search term for performance (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter products based on search, category, status
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      const matchesCategory =
        selectedCategory === 'ALL' || item.categoryName === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, debouncedSearchTerm, selectedStatus, selectedCategory]);

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Actions
  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (product: ProductItem) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (productToEdit) {
      // Edit existing product
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id === productToEdit.id) {
            const cat = CATEGORIES_LIST.find((c) => c.id === data.categoryId);
            return {
              ...item,
              ...data,
              categoryName: cat?.name || item.categoryName,
            };
          }
          return item;
        })
      );
    } else {
      // Add new product
      const cat = CATEGORIES_LIST.find((c) => c.id === data.categoryId);
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        ...data,
        categoryName: cat?.name || 'Chưa phân loại',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProducts((prev) => [newProd, ...prev]);
    }
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductPageHeader
        onAddClick={handleOpenAddModal}
        totalCount={products.length}
      />

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
        categoriesList={CATEGORIES_LIST}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ProductTable
        products={paginatedProducts}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Pagination */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        productToEdit={productToEdit}
        categoriesList={CATEGORIES_LIST}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
      />
    </div>
  );
}

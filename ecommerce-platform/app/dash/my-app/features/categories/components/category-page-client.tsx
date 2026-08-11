'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from '../../../hooks/use-debounce';
import { MOCK_CATEGORIES } from '../data/mock-categories';
import { Category, CategoryFormData } from '../types/category.types';
import CategoryPageHeader from './category-page-header';
import CategoryFilterBar from './category-filter-bar';
import CategoryTable from './category-table';
import CategoryPagination from './category-pagination';
import CategoryFormModal from './category-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';

const PAGE_SIZE = 8;

const CategoryPageClient = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.parentName?.toLowerCase().includes(q) ?? false)
    );
  }, [categories, debouncedSearch]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingCategoryId(id);
  };

  const handleFormSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      // Edit mode
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                ...data,
                parentName:
                  data.parentId
                    ? (prev.find((p) => p.id === data.parentId)?.name ?? null)
                    : null,
              }
            : c
        )
      );
    } else {
      // Add mode
      const newCategory: Category = {
        id: String(Date.now()),
        ...data,
        iconUrl: data.iconUrl || null,
        parentName: data.parentId
          ? (categories.find((c) => c.id === data.parentId)?.name ?? null)
          : null,
        productCount: 0,
      };
      setCategories((prev) => [newCategory, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategoryId) return;
    setCategories((prev) => prev.filter((c) => c.id !== deletingCategoryId));
    setDeletingCategoryId(null);
  };

  const deletingCategory = categories.find((c) => c.id === deletingCategoryId);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <CategoryPageHeader onAddClick={handleAddClick} />

      <CategoryFilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <CategoryTable
          categories={paginatedCategories}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
        <CategoryPagination
          currentPage={currentPage}
          totalItems={filteredCategories.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <CategoryFormModal
        isOpen={isFormModalOpen}
        editingCategory={editingCategory}
        categories={categories}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deletingCategoryId !== null}
        categoryName={deletingCategory?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategoryId(null)}
      />
    </div>
  );
};

export default CategoryPageClient;

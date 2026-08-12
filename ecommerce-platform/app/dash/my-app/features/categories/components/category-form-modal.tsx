'use client';

import { useEffect, useState } from 'react';
import { X, Save, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Category, CategoryFormData } from '../types/category.types';
import { ImageUploader } from '../../../components/ui/image-uploader';

export interface CategoryFormModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  categories: Category[];
  isSubmitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

const EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  iconUrl: '',
  parentId: null,
  isActive: true,
};

const toSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const CategoryFormModal = ({
  isOpen,
  editingCategory,
  categories,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: CategoryFormModalProps) => {
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setForm({
          name: editingCategory.name,
          slug: editingCategory.slug,
          iconUrl: editingCategory.iconUrl ?? '',
          parentId: editingCategory.parentId,
          isActive: editingCategory.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [isOpen, editingCategory]);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      // Chỉ auto-gen slug khi đang tạo mới
      ...(editingCategory ? {} : { slug: toSlug(name) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // Loại trừ chính mình khỏi danh sách chuyên mục cha
  const parentOptions = categories.filter(
    (c) => (editingCategory ? c.id !== editingCategory.id : true),
  );

  if (!isOpen) return null;

  const isEdit = editingCategory !== null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 id="form-modal-title" className="text-base font-extrabold text-gray-900">
            {isEdit ? 'Chỉnh sửa chuyên mục' : 'Thêm chuyên mục mới'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Error Banner */}
        {submitError && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Tên */}
          <div>
            <label
              htmlFor="field-name"
              className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Tên chuyên mục <span className="text-red-500">*</span>
            </label>
            <input
              id="field-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Điện thoại thông minh"
              required
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="field-slug"
              className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Slug (URL)
            </label>
            <input
              id="field-slug"
              type="text"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="dien-thoai-thong-minh"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:text-gray-400"
            />
          </div>

          {/* Icon Upload */}
          <ImageUploader
            value={form.iconUrl}
            onChange={(url) => setForm((p) => ({ ...p, iconUrl: url }))}
            disabled={isSubmitting}
          />

          {/* Chuyên mục cha */}
          <div>
            <label
              htmlFor="field-parent"
              className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              Chuyên mục cha
            </label>
            <select
              id="field-parent"
              value={form.parentId ?? ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  parentId: e.target.value ? Number(e.target.value) : null,
                }))
              }
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">-- Không có (Chuyên mục gốc) --</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Trạng thái
            </label>
            <div className="flex items-center gap-3">
              {([true, false] as boolean[]).map((val) => (
                <label
                  key={String(val)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                    isSubmitting ? 'opacity-50 pointer-events-none' : ''
                  } ${
                    form.isActive === val
                      ? val
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-400 bg-gray-50 text-gray-600'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    value={String(val)}
                    checked={form.isActive === val}
                    onChange={() => setForm((p) => ({ ...p, isActive: val }))}
                    className="sr-only"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${val ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  {val ? 'Hoạt động' : 'Ẩn'}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              id="btn-submit-form"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                <>
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Thêm chuyên mục
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;

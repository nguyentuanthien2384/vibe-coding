'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PostCategory } from '../../types/blog.types';

interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  category: PostCategory | null; // null = create mode
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMOJI_SUGGESTIONS = ['📰', '💻', '🍿', '⚡', '🔥', '🍔', '☕', '🎮', '📱', '🚀', '🎯', '💡'];

export default function CategoryFormModal({
  isOpen,
  category,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormData>({
    name: '',
    slug: '',
    icon: '📁',
    description: '',
    orderIndex: 1,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        icon: category.icon ?? '📁',
        description: category.description ?? '',
        orderIndex: category.orderIndex,
        isActive: category.isActive,
      });
    } else {
      setForm({ name: '', slug: '', icon: '📁', description: '', orderIndex: 1, isActive: true });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setForm((prev) => ({ ...prev, name: val, slug: slugify(val) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCreate = !category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 id="category-modal-title" className="text-lg font-bold text-[#202224]">
            {isCreate ? 'Thêm chuyên mục mới' : 'Chỉnh sửa chuyên mục'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Emoji Icon Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Icon chuyên mục</label>
            <div className="flex items-center gap-2 flex-wrap">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    form.icon === emoji
                      ? 'border-[#4880FF] bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                maxLength={2}
                placeholder="✏️"
                className="w-16 h-9 px-2 text-center text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="cat-name">
              Tên chuyên mục <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Góc Coder Thức Khuya"
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="cat-slug">
              Slug
            </label>
            <input
              id="cat-slug"
              type="text"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
              placeholder="goc-coder-thuc-khuya"
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-mono text-gray-600 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="cat-desc">
              Mô tả
            </label>
            <textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Mô tả ngắn về chuyên mục..."
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all resize-none"
            />
          </div>

          {/* Order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="cat-order">
                Thứ tự
              </label>
              <input
                id="cat-order"
                type="number"
                min={1}
                value={form.orderIndex}
                onChange={(e) => setForm((p) => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Trạng thái
              </label>
              <label className="flex items-center gap-2 cursor-pointer h-[42px]">
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                    form.isActive ? 'bg-[#4880FF]' : 'bg-gray-300'
                  }`}
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      form.isActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {form.isActive ? 'Hiển thị' : 'Ẩn'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#4880FF] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : isCreate ? (
              'Tạo chuyên mục'
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { ProductItem, ProductFormData, ProductStatus } from '../types/product.types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  productToEdit?: ProductItem | null;
  categoriesList: { id: string; name: string }[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  categoriesList,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    categoryId: categoriesList[0]?.id || '',
    price: 0,
    salePrice: undefined,
    stock: 0,
    imageUrl: '',
    colors: ['#000000', '#3b82f6'],
    status: 'ACTIVE',
  });

  const [colorInput, setColorInput] = useState('#000000');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        slug: productToEdit.slug,
        categoryId: productToEdit.categoryId,
        price: productToEdit.price,
        salePrice: productToEdit.salePrice,
        stock: productToEdit.stock,
        imageUrl: productToEdit.imageUrl,
        colors: productToEdit.colors || [],
        status: productToEdit.status,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        categoryId: categoriesList[0]?.id || '',
        price: 0,
        salePrice: undefined,
        stock: 10,
        imageUrl: '',
        colors: ['#000000', '#3b82f6'],
        status: 'ACTIVE',
      });
    }
  }, [productToEdit, categoriesList, isOpen]);

  const handleNameChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
    }));
  };

  const handleAddColor = () => {
    if (colorInput && !formData.colors.includes(colorInput)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, colorInput] }));
    }
  };

  const handleRemoveColor = (hex: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== hex),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            {productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Apple Watch Series 4"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] focus:bg-white transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Slug (Đường dẫn cố định)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4880FF] focus:bg-white transition-all"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Danh mục *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trạng thái *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProductStatus })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
              >
                <option value="ACTIVE">Đang bán (Active)</option>
                <option value="OUT_OF_STOCK">Hết hàng (Out of Stock)</option>
                <option value="DRAFT">Nháp (Draft)</option>
              </select>
            </div>
          </div>

          {/* Price, SalePrice & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá gốc ($) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giá khuyến mãi ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.salePrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Không bắt buộc"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Hình ảnh
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
              />
            </div>
          </div>

          {/* Colors Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Màu sắc sản phẩm
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-all"
              >
                + Thêm màu
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {formData.colors.map((hex) => (
                  <span
                    key={hex}
                    onClick={() => handleRemoveColor(hex)}
                    className="w-6 h-6 rounded-full border border-slate-300 shadow-xs cursor-pointer relative group flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                    title="Bấm để xóa màu"
                  >
                    <X className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#4880FF] hover:bg-blue-600 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
